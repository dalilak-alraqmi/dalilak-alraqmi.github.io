(function(){
const CFG={url:'__SUPABASE_URL__',key:'__SUPABASE_ANON_KEY__'},S=localStorage;
const ready=!CFG.url.startsWith('__');
async function raw(m,p,b,tok,x){const h={apikey:CFG.key,'Content-Type':'application/json',...(x||{})};if(tok)h.Authorization='Bearer '+tok;
 const r=await fetch(CFG.url+p,{method:m,headers:h,body:b?JSON.stringify(b):undefined});let d=null;try{d=await r.json()}catch(_){}return{ok:r.ok,status:r.status,d:d||{}}}
const session=()=>{try{return JSON.parse(S.sb_session||'null')}catch(_){return null}};
function save(d){S.sb_session=JSON.stringify({access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Date.now()/1000+(d.expires_in||3600)-60,email:d.user&&d.user.email})}
async function token(){const s=session();if(!s)return null;if(Date.now()/1000<s.expires_at)return s.access_token;
 const r=await raw('POST','/auth/v1/token?grant_type=refresh_token',{refresh_token:s.refresh_token});if(r.ok){save(r.d);return r.d.access_token}S.removeItem('sb_session');return null}
window.SB={ready,session,save,raw,
 api:async(m,p,b,x)=>raw(m,p,b,await token(),x),
 signup:(email,password)=>raw('POST','/auth/v1/signup',{email,password}),
 login:(email,password)=>raw('POST','/auth/v1/token?grant_type=password',{email,password}),
 recover:email=>raw('POST','/auth/v1/recover?redirect_to='+encodeURIComponent(location.origin+'/reset.html'),{email}),
 logout(){S.removeItem('sb_session')}};
})();
