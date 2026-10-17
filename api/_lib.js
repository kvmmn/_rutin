const crypto = require('node:crypto');
const ORIGIN = 'https://rutin274.vercel.app';
function secret(){const s=process.env.AUTH_SESSION_SECRET;if(!s||s.length<32)throw Error('AUTH_SESSION_SECRET is missing');return crypto.createHash('sha256').update(s).digest()}
function cookie(res,name,val,seconds=0){res.setHeader('Set-Cookie',[...([].concat(res.getHeader('Set-Cookie')||[])),name+'='+encodeURIComponent(val)+'; Path=/; HttpOnly; Secure; SameSite=Lax'+(seconds?'; Max-Age='+seconds:'')])}
function parse(req){const o={};for(const p of (req.headers.cookie||'').split(';')){const i=p.indexOf('=');if(i>0){try{o[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1))}catch{}}}return o}
function seal(data){const iv=crypto.randomBytes(12);const c=crypto.createCipheriv('aes-256-gcm',secret(),iv);const enc=Buffer.concat([c.update(JSON.stringify(data)),c.final()]);return Buffer.concat([iv,c.getAuthTag(),enc]).toString('base64url')}
function unseal(value){try{const b=Buffer.from(value,'base64url'),d=crypto.createDecipheriv('aes-256-gcm',secret(),b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString())}catch{return null}}
function user(req){const s=unseal(parse(req).rutin_session||'');return s&&s.exp>Date.now()&&s.email===process.env.AUTH_ALLOWED_EMAIL?.trim().toLowerCase()?{email:s.email,name:s.name||''}:null}
function deny(res,code,message){res.status(code).json({error:message})}
module.exports={crypto,ORIGIN,cookie,parse,seal,unseal,user,deny};
