const CFG=window.SB||{url:'__SUPABASE_URL__',key:'__SUPABASE_ANON_KEY__'};
const $=id=>document.getElementById(id),S=localStorage;
const H=(tok)=>({apikey:CFG.key,Authorization:'Bearer '+(tok||CFG.key),'Content-Type':'application/json'});
const req=(m,p,b,tok,x)=>fetch(CFG.url+p,{method:m,headers:{...H(tok),...(x||{})},body:b?JSON.stringify(b):undefined}).then(async r=>({ok:r.ok,d:await r.json().catch(()=>({}))}));
const say=(id,t,e)=>{$(id).textContent=t;$(id).className=e?'err':''};
const slugify=t=>t.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'')||('post-'+Date.now());
if(location.hash.includes('type=recovery')&&$('rf')){const t=new URLSearchParams(location.hash.slice(1)).get('access_token');
 $('rf').onsubmit=async e=>{e.preventDefault();const r=await req('PUT','/auth/v1/user',{password:$('np').value},t);say('rm',r.ok?'تم الحفظ. ادخل من لوحة الإدارة بكلمتك الجديدة.':'تعذر الحفظ، اطلب رابطًا جديدًا',!r.ok)}}
else if($('rf')){say('rm','افتح هذه الصفحة من رابط الاستعادة المرسل لبريدك',1)}
if($('lf')){
 const show=()=>{const ok=!!S.sb_token;$('login').hidden=ok;$('panel').hidden=!ok;$('out').hidden=!ok;if(ok)load()};
 $('out').onclick=()=>{S.removeItem('sb_token');location.reload()};
 $('forgot').onclick=async()=>{const e=$('le').value.trim();if(!e)return say('lm','اكتب بريدك أولًا',1);await req('POST','/auth/v1/recover?redirect_to='+encodeURIComponent(location.origin+'/reset.html'),{email:e});say('lm','إذا كان البريد مسجلًا، أرسلنا لك رابط الاستعادة')};
 $('lf').onsubmit=async e=>{e.preventDefault();if(CFG.url.startsWith('__'))return say('lm','لوحة الإدارة غير مفعّلة بعد',1);
  const r=await req('POST','/auth/v1/token?grant_type=password',{email:$('le').value.trim(),password:$('lp').value});
  if(!r.ok)return say('lm','البريد أو كلمة المرور غير صحيحة',1);S.sb_token=r.d.access_token;show()};
 async function load(){const r=await req('GET','/rest/v1/posts?select=id,slug,title,created_at&order=created_at.desc',null,S.sb_token);
  if(!r.ok){S.removeItem('sb_token');return show()}
  $('list').innerHTML='';for(const p of r.d){const row=document.createElement('p');row.textContent=p.title+' ';const b=document.createElement('button');b.type='button';b.className='btn';b.textContent='حذف';b.onclick=async()=>{if(b.dataset.s!=='1'){b.dataset.s='1';b.textContent='اضغط للتأكيد';return}await req('DELETE','/rest/v1/posts?id=eq.'+p.id,null,S.sb_token);load()};row.append(b);$('list').append(row)}}
 $('pf').onsubmit=async e=>{e.preventDefault();const r=await req('POST','/rest/v1/posts',{slug:slugify($('t').value),title:$('t').value.trim(),cat:$('c').value.trim()||'عام',description:$('d').value.trim(),body:$('b').value},S.sb_token,{Prefer:'return=minimal'});
  say('pm',r.ok?'تم الحفظ. يظهر في الموقع بعد دقيقة تقريبًا.':'تعذر النشر. تأكد أن حسابك مضاف كمالك.',!r.ok);if(r.ok)$('pf').reset();if(r.ok)load()};
 show();}
