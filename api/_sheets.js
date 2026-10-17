const crypto = require('node:crypto');
function normalizeKey(value='') {
  let key=value.trim();
  if(key.startsWith('{')) {
    try { key=JSON.parse(key).private_key || key; } catch {}
  }
  if(key.startsWith('"')) {
    try { key=JSON.parse(key); } catch {}
  }
  return key.replace(/\\n/g,'\n');
}
async function accessToken() {
  const key=crypto.createPrivateKey(normalizeKey(process.env.GOOGLE_PRIVATE_KEY));
  const email=process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const timestamp=Math.floor(Date.now()/1000);
  const enc=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
  const claim={iss:email,scope:'https://www.googleapis.com/auth/spreadsheets',aud:'https://oauth2.googleapis.com/token',iat:timestamp,exp:timestamp+3600};
  const payload=enc({alg:'RS256',typ:'JWT'})+'.'+enc(claim);
  const signature=crypto.sign('RSA-SHA256',Buffer.from(payload),key).toString('base64url');
  const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:payload+'.'+signature})});
  if(!response.ok)throw Error('Google authorization failed: '+response.status);
  return (await response.json()).access_token;
}
async function request(token,range,method='GET',values){
  const id=process.env.GOOGLE_SHEET_ID;
  const url='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(id)+'/values/'+encodeURIComponent(range)+(method==='PUT'?'?valueInputOption=RAW':method==='POST'?':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS':'');
  const response=await fetch(url,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:values?JSON.stringify({values}):undefined});
  if(!response.ok)throw Error('Google Sheets request failed: '+response.status);
  return response.json();
}
module.exports={accessToken,request};
