const {user,deny}=require('./_lib');
const {accessToken,request}=require('./_sheets');
const validDate=v=>/^20\d\d-\d\d-\d\d$/.test(String(v));
const safe=v=>String(v??'').slice(0,1200).replace(/^[=+@-]/,"'");
const dailyRange="'روزانه'!A2:L100";
const receiptRange="'رسیدها'!A1:I5000";
const itemRange="'هزینه‌ها'!A1:K15000";
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(!user(req))return deny(res,401,'Sign in with Google first');
 if(!['GET','POST'].includes(req.method))return deny(res,405,'Method not allowed');
 if(req.method==='POST'&&req.headers.origin&&req.headers.origin!=='https://rutin274.vercel.app')return deny(res,403,'Bad origin');
 const action=req.method==='GET'?req.query.action:req.body?.action,args=req.body?.args||[];
 try{
  const token=await accessToken();
  if(action==='getDailyData'&&req.method==='GET'){
   const r=await request(token,dailyRange);
   return res.json((r.values||[]).filter(x=>validDate(x[0])).map(x=>({date:x[0],weight:x[2]??'',notes:x[10]||'',purchase:x[8]||''})));
  }
  if(action==='getInventory'&&req.method==='GET'){
   const r=await request(token,"'موجودی خانه'!A2:F100");
   return res.json((r.values||[]).filter(x=>x[0]).map(x=>({id:String(x[0]),name:String(x[1]||''),quantity:Number(x[2])||0,unit:String(x[3]||''),updatedAt:String(x[4]||'')})));
  }
  if(action==='saveInventory'&&req.method==='POST'){
   const entry=args[0],ids=['bread','rice','tuna','potatoes','eggs','chicken','skyr','cheese','fresh','salad','vegetables','fruit','salt','pepper','oil','lemon'];
   if(!entry||!ids.includes(entry.id)||!Number.isFinite(Number(entry.quantity))||Number(entry.quantity)<0||Number(entry.quantity)>100000)return deny(res,400,'Invalid inventory');
   const r=await request(token,"'موجودی خانه'!A2:F100"),rows=r.values||[];
   const found=rows.findIndex(x=>x[0]===entry.id);
   const next=[entry.id,safe(entry.name),Number(entry.quantity),safe(entry.unit),new Date().toISOString(),''];
   const row=found>=0?found+2:rows.length+2;
   await request(token,"'موجودی خانه'!A"+row+":F"+row,'PUT',[next]);
   return res.json({ok:true,entry:{id:entry.id,name:next[1],quantity:next[2],unit:next[3],updatedAt:next[4]}});
  }
  if(action==='getExpenseReceipts'&&req.method==='GET'){
   const [r,i]=await Promise.all([request(token,receiptRange),request(token,itemRange)]);
   const rows=(r.values||[]).slice(1),items=(i.values||[]).slice(1);
   return res.json(rows.filter(x=>x[0]).map(x=>({id:String(x[0]),date:String(x[1]||''),shop:String(x[2]||''),total:Number(x[3])||0,related:Number(x[4])||0,items:items.filter(y=>y[0]===x[0]).map(y=>({name:String(y[3]||''),qty:Number(y[5])||0,unit:Number(y[6])||0,related:String(y[8]).toLowerCase()==='true'}))})));
  }
  if(req.method!=='POST')return deny(res,405,'Method not allowed');
  if(['saveDailyWeight','deleteDailyWeight','appendDailyNote','savePurchaseStatus'].includes(action)){
   const date=args[0];if(!validDate(date))return deny(res,400,'Invalid date');
   const r=await request(token,dailyRange),rows=r.values||[],idx=rows.findIndex(x=>x[0]===date);
   if(idx<0)return deny(res,400,'Date not in sheet');
   const row=idx+2;
   if(action==='deleteDailyWeight'){
    await request(token,"'روزانه'!C"+row,'PUT',[['']]);
    return res.json({ok:true,date,weight:null});
   }
   if(action==='saveDailyWeight'){
    const w=Number(args[1]);if(!Number.isFinite(w)||w<25||w>350)return deny(res,400,'Invalid weight');
    await request(token,"'روزانه'!C"+row,'PUT',[[w]]);
    return res.json({weight:w,date});
   }
   if(action==='appendDailyNote'){
    const note=String(args[1]||'').trim();if(!note||note.length>1000)return deny(res,400,'Invalid note');
    const time=new Intl.DateTimeFormat('fa-IR',{timeZone:'Europe/Berlin',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
    const next=(rows[idx][10]?rows[idx][10]+'\n':'')+time+' — '+safe(note);
    await request(token,"'روزانه'!K"+row,'PUT',[[next]]);
    return res.json({date,notes:next});
   }
   const status=String(args[1]||'').slice(0,100);
   await request(token,"'روزانه'!I"+row,'PUT',[[status]]);
   return res.json({date,status});
  }
  if(action==='saveExpenseReceipt'){
   const x=args[0],photo=args[1];
   if(photo)return deny(res,422,'Photo uploads need private storage integration');
   if(!x||!/^R\d{10,}$/.test(String(x.id))||!validDate(x.date)||!String(x.shop||'').trim()||!Array.isArray(x.items)||!x.items.length)return deny(res,400,'Invalid receipt');
   const total=Number(x.total),sum=x.items.reduce((n,v)=>n+Number(v.qty)*Number(v.unit),0);
   if(!Number.isFinite(total)||total<=0||Math.abs(sum-total)>.04||x.items.some(i=>!String(i.name||'').trim()||!(Number(i.qty)>0)||!(Number(i.unit)>=0)))return deny(res,400,'Invalid items or total');
   const old=await request(token,receiptRange);
   if((old.values||[]).some(r=>r[0]===x.id))return deny(res,409,'Duplicate receipt');
   const relevant=Number(x.items.filter(i=>i.related).reduce((n,i)=>n+Number(i.qty)*Number(i.unit),0).toFixed(2));
   await request(token,"'رسیدها'!A:I",'POST',[[x.id,x.date,safe(x.shop),total,relevant,Number((total-relevant).toFixed(2)),'ثبت دستی','','']]);
   const lines=x.items.map(i=>[x.id,x.date,safe(x.shop),safe(i.name),i.related?'مرتبط':'سایر',Number(i.qty),Number(i.unit),Number((Number(i.qty)*Number(i.unit)).toFixed(2)),!!i.related,i.related?Number((Number(i.qty)*Number(i.unit)).toFixed(2)):0,'']);
   await request(token,"'هزینه‌ها'!A:K",'POST',lines);
   return res.json({ok:true,id:x.id});
  }
  return deny(res,400,'Unsupported action');
 }catch(e){console.error('Rutin sheets error:',e.message);return deny(res,502,'Could not sync with Google Sheets')}
};
