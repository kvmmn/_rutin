const crypto = require('node:crypto');
const ORIGIN = 'https://rutin274.vercel.app';

/** Temporary preview mode: default ON until AUTH_DISABLED=false. Re-enable auth by setting AUTH_DISABLED=false. */
function authDisabled() {
  const v = String(process.env.AUTH_DISABLED ?? 'true').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function secret(){const s=process.env.AUTH_SESSION_SECRET;if(!s||s.length<32)throw Error('AUTH_SESSION_SECRET is missing');return crypto.createHash('sha256').update(s).digest()}
function cookie(res,name,val,seconds=0){res.setHeader('Set-Cookie',[...([].concat(res.getHeader('Set-Cookie')||[])),name+'='+encodeURIComponent(val)+'; Path=/; HttpOnly; Secure; SameSite=Lax'+(seconds?'; Max-Age='+seconds:'')])}
function parse(req){const o={};for(const p of (req.headers.cookie||'').split(';')){const i=p.indexOf('=');if(i>0){try{o[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1))}catch{}}}return o}
function seal(data){const iv=crypto.randomBytes(12);const c=crypto.createCipheriv('aes-256-gcm',secret(),iv);const enc=Buffer.concat([c.update(JSON.stringify(data)),c.final()]);return Buffer.concat([iv,c.getAuthTag(),enc]).toString('base64url')}
function unseal(value){try{const b=Buffer.from(value,'base64url'),d=crypto.createDecipheriv('aes-256-gcm',secret(),b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString())}catch{return null}}
function user(req){
  if (authDisabled()) {
    return { email: 'preview@rutin.local', name: 'Preview', authDisabled: true };
  }
  const s = unseal(parse(req).rutin_session || '');
  return s && s.exp > Date.now() && s.email === process.env.AUTH_ALLOWED_EMAIL?.trim().toLowerCase()
    ? { email: s.email, name: s.name || '' }
    : null;
}
function deny(res,code,message){res.status(code).json({error:message})}
/** When auth is off, allow Vercel preview origins so meal/push APIs work without login. */
function allowOrigin(req) {
  if (authDisabled()) return true;
  const origin = req.headers.origin;
  if (!origin) return true;
  return origin === ORIGIN;
}
module.exports={crypto,ORIGIN,cookie,parse,seal,unseal,user,deny,authDisabled,allowOrigin};
