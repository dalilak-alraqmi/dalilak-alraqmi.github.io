(function(){
const $=id=>document.getElementById(id),S=localStorage,R=document.documentElement;
// visitor dark toggle
const dk=$('darkbtn');if(dk){dk.onclick=()=>{const on=R.dataset.mode!=='dark';R.dataset.mode=on?'dark':'';on?S.dl_dark='1':S.removeItem('dl_dark');dk.setAttribute('aria-pressed',on)};dk.setAttribute('aria-pressed',R.dataset.mode==='dark')}
// owner-chosen theme and font (saved in the database), applied after load and cached for next visit
if(window.SB&&SB.ready){SB.raw('GET','/rest/v1/settings?select=key,value').then(r=>{if(!r.ok||!Array.isArray(r.d))return;for(const x of r.d){if(x.key==='theme'){R.dataset.theme=x.value;S.dl_theme=x.value}if(x.key==='font'){R.dataset.font=x.value;S.dl_font=x.value}}})}
// account page
if($('authform')){
 let mode='in';const msg=(t,e)=>{$('msg').textContent=t;$('msg').className=e?'err':''};
 const tabs=m=>{mode=m;$('tab-in').classList.toggle('on',m==='in');$('tab-up').classList.toggle('on',m==='up');$('submit').textContent=m==='in'?'دخول':'إنشاء الحساب';$('password').autocomplete=m==='in'?'current-password':'new-password'};
 $('tab-in').onclick=()=>tabs('in');$('tab-up').onclick=()=>tabs('up');
 const show=()=>{const s=SB.session();$('authform').hidden=!!s;$('signed').hidden=!s;$('tabs').hidden=!!s;if(s)$('who').textContent='مسجل الدخول: '+s.email};show();
 $('logout').onclick=()=>{SB.logout();location.reload()};
 $('forgot').onclick=async()=>{const e=$('email').value.trim();if(!e)return msg('اكتب بريدك أولًا',1);if(!SB.ready)return msg('التسجيل غير مفعّل بعد',1);await SB.recover(e);msg('إذا كان البريد مسجلًا، أرسلنا لك رابط الاستعادة')};
 $('authform').onsubmit=async e=>{e.preventDefault();const email=$('email').value.trim(),password=$('password').value;
  if(!/^\S+@\S+\.\S+$/.test(email))return msg('اكتب بريدًا إلكترونيًا صحيحًا',1);
  if(password.length<8)return msg('كلمة المرور لازم تكون 8 أحرف على الأقل',1);
  if(!SB.ready)return msg('التسجيل غير مفعّل بعد على هذا الموقع',1);
  msg('جارٍ المعالجة...');
  try{const r=mode==='up'?await SB.signup(email,password):await SB.login(email,password);
   if(!r.ok){const t=(r.d.msg||r.d.error_description||'')+'';
    if(mode==='in')return msg('البريد أو كلمة المرور غير صحيحة',1);
    if(/already|registered/i.test(t))return msg('هذا البريد مسجل من قبل، جرّب تسجيل الدخول',1);
    return msg('تعذر إنشاء الحساب، حاول مرة أخرى',1)}
   if(!r.d.access_token)return msg('تم إنشاء الحساب. افتح بريدك واضغط رابط التأكيد ثم سجّل الدخول.');
   SB.save(r.d);show();
  }catch(_){msg('تعذر الاتصال، حاول لاحقًا',1)}};
}
})();
