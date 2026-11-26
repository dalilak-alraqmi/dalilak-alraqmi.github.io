// Sign-up and login via Supabase Auth (free tier). Fill in the two values from the Supabase project settings.
const CFG={url:'__SUPABASE_URL__',key:'__SUPABASE_ANON_KEY__'};
const $=id=>document.getElementById(id);
if($('authform')){
 let mode='in';const msg=(t,e)=>{$('msg').textContent=t;$('msg').className=e?'err':''};
 const ready=!CFG.url.startsWith('__');
 const api=(p,body)=>fetch(CFG.url+'/auth/v1/'+p,{method:'POST',headers:{apikey:CFG.key,'Content-Type':'application/json'},body:JSON.stringify(body)}).then(async r=>({ok:r.ok,d:await r.json().catch(()=>({}))}));
 const tabs=m=>{mode=m;$('tab-in').className=m==='in'?'on':'';$('tab-up').className=m==='up'?'on':'';$('submit').textContent=m==='in'?'دخول':'إنشاء الحساب';$('password').autocomplete=m==='in'?'current-password':'new-password'};
 $('tab-in').onclick=()=>tabs('in');$('tab-up').onclick=()=>tabs('up');

 $('forgot').onclick=async()=>{const e=$('email').value.trim();if(!e)return msg('اكتب بريدك أولًا',1);if(!ready)return msg('التسجيل غير مفعّل بعد',1);await api('recover?redirect_to='+encodeURIComponent(location.origin+'/reset.html'),{email:e});msg('إذا كان البريد مسجلًا، أرسلنا لك رابط الاستعادة')};
 const show=()=>{const t=localStorage.getItem('sb_email');if(t){$('authform').hidden=true;$('signed').hidden=false;$('who').textContent='مسجل الدخول: '+t}};show();
 $('logout').onclick=()=>{localStorage.removeItem('sb_email');localStorage.removeItem('sb_token');location.reload()};
 $('authform').onsubmit=async e=>{e.preventDefault();const email=$('email').value.trim(),password=$('password').value;
  if(!/^\S+@\S+\.\S+$/.test(email))return msg('اكتب بريدًا إلكترونيًا صحيحًا',1);
  if(password.length<8)return msg('كلمة المرور لازم تكون 8 أحرف على الأقل',1);
  if(!ready)return msg('التسجيل غير مفعّل بعد على هذا الموقع',1);
  msg('جارٍ المعالجة...');
  try{const r=mode==='up'?await api('signup',{email,password}):await api('token?grant_type=password',{email,password});
   if(!r.ok)return msg(mode==='in'?'البريد أو كلمة المرور غير صحيحة':'تعذر إنشاء الحساب: '+(r.d.msg||r.d.error_description||'حاول مرة أخرى'),1);
   if(mode==='up'&&!r.d.access_token)return msg('تم إنشاء الحساب. افتح بريدك واضغط رابط التأكيد ثم سجّل الدخول.');
   localStorage.setItem('sb_email',email);localStorage.setItem('sb_token',r.d.access_token||'');show();
  }catch(_){msg('تعذر الاتصال، حاول لاحقًا',1)}};
}
