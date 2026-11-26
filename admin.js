(function(){
const $=id=>document.getElementById(id);
const say=(id,t,e)=>{$(id).textContent=t;$(id).className=e?'err':''};
const slugify=t=>t.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'')||('post-'+Date.now());
const THEMES={logo:'ألوان الشعار (فاتح)',night:'ليلي داكن',soft:'هادئ بنفسجي'};
const FONTS={thmanyah:'ثمانية',cairo:'Cairo',tajawal:'Tajawal',plex:'IBM Plex Sans Arabic'};
// password reset page
if($('rf')){const t=new URLSearchParams(location.hash.slice(1)).get('access_token');
 if(!t)say('rm','افتح هذه الصفحة من رابط الاستعادة المرسل لبريدك',1);
 $('rf').onsubmit=async e=>{e.preventDefault();const r=await SB.raw('PUT','/auth/v1/user',{password:$('np').value},t);say('rm',r.ok?'تم الحفظ. ادخل من لوحة الإدارة بكلمتك الجديدة.':'تعذر الحفظ، اطلب رابطًا جديدًا',!r.ok)}}
if(!$('lf'))return;
const show=()=>{const ok=!!SB.session();$('login').hidden=ok;$('panel').hidden=!ok;$('out').hidden=!ok;if(ok)load()};
$('out').onclick=()=>{SB.logout();location.reload()};
$('forgot').onclick=async()=>{const e=$('le').value.trim();if(!e)return say('lm','اكتب بريدك أولًا',1);await SB.recover(e);say('lm','إذا كان البريد مسجلًا، أرسلنا لك رابط الاستعادة')};
$('lf').onsubmit=async e=>{e.preventDefault();if(!SB.ready)return say('lm','لوحة الإدارة غير مفعّلة بعد',1);
 const r=await SB.login($('le').value.trim(),$('lp').value);if(!r.ok)return say('lm','البريد أو كلمة المرور غير صحيحة',1);SB.save(r.d);show()};
for(const [k,v] of Object.entries(THEMES)){const o=document.createElement('option');o.value=k;o.textContent=v;$('theme').append(o)}
for(const [k,v] of Object.entries(FONTS)){const o=document.createElement('option');o.value=k;o.textContent=v;$('font').append(o)}
async function load(){
 const a=await SB.api('GET','/rest/v1/admins?select=email');
 if(!a.ok||!a.d.length){$('panel').hidden=true;$('login').hidden=false;return say('lm','هذا الحساب غير مضاف كمالك للموقع',1)}
 const s=await SB.raw('GET','/rest/v1/settings?select=key,value');if(s.ok)for(const x of s.d){if(x.key==='theme')$('theme').value=x.value;if(x.key==='font')$('font').value=x.value}
 const r=await SB.api('GET','/rest/v1/posts?select=id,title,cat,sample&order=created_at.desc');
 $('list').innerHTML='';if(!r.ok)return;
 for(const p of r.d){const row=document.createElement('div');row.className='arow';const t=document.createElement('span');t.textContent=p.title+' · '+p.cat+(p.sample?' · تجريبي':'');
  const b=document.createElement('button');b.type='button';b.className='btn danger';b.textContent='حذف';
  b.onclick=async()=>{if(b.dataset.s!=='1'){b.dataset.s='1';b.textContent='اضغط للتأكيد';return}await SB.api('DELETE','/rest/v1/posts?id=eq.'+p.id);load()};row.append(t,b);$('list').append(row)}}
$('delsamples').onclick=async()=>{const b=$('delsamples');if(b.dataset.s!=='1'){b.dataset.s='1';b.textContent='اضغط مرة ثانية لحذف كل المقالات التجريبية';return}
 b.dataset.s='';b.textContent='حذف كل المقالات التجريبية';await SB.api('DELETE','/rest/v1/posts?sample=eq.true');load()};
$('sf').onsubmit=async e=>{e.preventDefault();
 const r=await SB.api('POST','/rest/v1/settings?on_conflict=key',[{key:'theme',value:$('theme').value},{key:'font',value:$('font').value}],{Prefer:'resolution=merge-duplicates,return=minimal'});
 say('sm',r.ok?'تم الحفظ. يظهر التغيير للزوار خلال ثوانٍ.':'تعذر الحفظ',!r.ok)};
$('pf').onsubmit=async e=>{e.preventDefault();
 const r=await SB.api('POST','/rest/v1/posts',{slug:slugify($('t').value),title:$('t').value.trim(),cat:$('c').value,description:$('d').value.trim(),body:$('b').value},{Prefer:'return=minimal'});
 say('pm',r.ok?'تم الحفظ. يظهر المقال في الموقع خلال 20 دقيقة تقريبًا.':(r.status===409?'يوجد مقال بنفس العنوان':'تعذر النشر. تأكد أن حسابك مضاف كمالك.'),!r.ok);if(r.ok){$('pf').reset();load()}};
show();
})();
