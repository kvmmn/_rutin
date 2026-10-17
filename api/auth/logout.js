const {cookie,deny}=require('../_lib');module.exports=(req,res)=>{if(req.method!=='POST')return deny(res,405,'Method not allowed');cookie(res,'rutin_session','',-1);res.status(200).json({ok:true})};
