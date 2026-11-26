import fs from 'fs';
import crypto from 'crypto';
const SITE=(process.env.SITE_URL||'https://example.com').replace(/\/$/,'');
const SBU=process.env.SUPABASE_URL,SBK=process.env.SUPABASE_ANON_KEY;
const NAME='دليلك الرقمي',TAG='YOUR DIGITAL GUIDE';
const CATS=[{slug:'apps',name:'التطبيقات',desc:'شروحات خطوة بخطوة لأهم التطبيقات',hue:['#2174d9','#b95fcc']},{slug:'articles',name:'المقالات',desc:'معلومات ونصائح تقنية بلغة بسيطة',hue:['#b95fcc','#2174d9']},{slug:'news',name:'أخبار التقنية',desc:'شروحات وفهم لما يجري في عالم التقنية',hue:['#1a5bb0','#c37bd6']}];
const catOf=n=>CATS.find(c=>c.name===n)||CATS[1];
let A=JSON.parse(fs.readFileSync('articles.json','utf8')).map(a=>({...a,sample:true}));
let theme='logo',font='thmanyah';
if(SBU&&SBK){const h={apikey:SBK};
 const r=await fetch(SBU+'/rest/v1/posts?select=*&published=eq.true&order=created_at.desc',{headers:h});
 if(r.ok){A=(await r.json()).map(p=>({slug:p.slug,title:p.title,cat:p.cat,date:p.created_at.slice(0,10),desc:p.description,body:p.body.split(/\n+/).filter(Boolean),sample:!!p.sample}))}else console.error('posts fetch failed',r.status);
 const s=await fetch(SBU+'/rest/v1/settings?select=key,value',{headers:h});
 if(s.ok)for(const x of await s.json()){if(x.key==='theme')theme=x.value;if(x.key==='font')font=x.value}}
const out='dist';fs.rmSync(out,{recursive:true,force:true});
for(const d of ['articles','category','assets/covers'])fs.mkdirSync(`${out}/${d}`,{recursive:true});
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmt=d=>new Date(d).toLocaleDateString('ar-SA-u-nu-latn',{year:'numeric',month:'long',day:'numeric'});
const W=(p,c)=>fs.writeFileSync(`${out}/${p}`,c);
const fileId=a=>crypto.createHash('md5').update(a.slug).digest('hex').slice(0,10);
const postUrl=a=>`/articles/${fileId(a)}-${encodeURIComponent(a.slug).replace(/%/g,'').slice(0,40)}.html`;
// generated covers (own artwork, no third-party images)
function cover(a){const c=catOf(a.cat),h=parseInt(fileId(a),16);const r=n=>((h>>(n*3))%100)/100;
 const glyph={apps:'<rect x="500" y="190" width="200" height="330" rx="34" fill="#fff" fill-opacity=".95"/><rect x="524" y="226" width="152" height="230" rx="14" fill="#2174d9" fill-opacity=".25"/><circle cx="600" cy="486" r="14" fill="#b95fcc"/><rect x="545" y="250" width="50" height="50" rx="12" fill="#b95fcc"/><rect x="605" y="250" width="50" height="50" rx="12" fill="#2174d9"/><rect x="545" y="310" width="50" height="50" rx="12" fill="#2174d9"/><rect x="605" y="310" width="50" height="50" rx="12" fill="#b95fcc"/>',
  articles:'<rect x="450" y="170" width="300" height="380" rx="28" fill="#fff" fill-opacity=".95"/><rect x="490" y="220" width="160" height="22" rx="11" fill="#b95fcc"/><rect x="490" y="270" width="220" height="14" rx="7" fill="#2174d9" fill-opacity=".5"/><rect x="490" y="302" width="220" height="14" rx="7" fill="#2174d9" fill-opacity=".5"/><rect x="490" y="334" width="190" height="14" rx="7" fill="#2174d9" fill-opacity=".5"/><rect x="490" y="390" width="220" height="110" rx="16" fill="#b95fcc" fill-opacity=".35"/>',
  news:'<circle cx="600" cy="360" r="46" fill="#fff"/><circle cx="600" cy="360" r="100" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="12"/><circle cx="600" cy="360" r="160" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="12"/><circle cx="600" cy="360" r="220" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="12"/>'}[c.slug];
 let dots='';for(let i=0;i<14;i++){const x=Math.round(60+r(i%9)*1080+i*7)%1140+30,y=Math.round(40+r((i+3)%9)*540),s=18+Math.round(r((i+5)%9)*40);dots+=`<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s/4|0}" fill="#fff" fill-opacity="${(.10+r(i%7)*.18).toFixed(2)}"/>`}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-label="${esc(a.title)}"><defs><linearGradient id="g" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.hue[0]}"/><stop offset="1" stop-color="${c.hue[1]}"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/>${dots}${glyph}</svg>`}
const coverUrl=a=>`/assets/covers/c-${fileId(a)}.svg`;
for(const a of A)W(`assets/covers/c-${fileId(a)}.svg`,cover(a));
const NAV=[['/','الرئيسية'],...CATS.map(c=>[`/category/${c.slug}.html`,c.name]),['/about.html','عن المدونة']];
const layout=({title,desc,path,body,ld,type='website',image='/assets/og.png'})=>`<!doctype html>
<html lang="ar" dir="rtl" data-theme="${theme}" data-font="${font}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<script>try{var d=document.documentElement,s=localStorage;if(s.dl_theme)d.dataset.theme=s.dl_theme;if(s.dl_font)d.dataset.font=s.dl_font;if(s.dl_dark)d.dataset.mode='dark'}catch(e){}</script>
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${path}"><meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:locale" content="ar_AR"><meta property="og:type" content="${type}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}${path}"><meta property="og:site_name" content="${NAME}"><meta property="og:image" content="${SITE}${image.endsWith('.svg')?'/assets/og.png':image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#2174d9">
<link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="${NAME}" href="${SITE}/feed.xml">
<link rel="preload" href="/assets/fonts/thmanyah-sans-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/style.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script></head><body>
<a class="skip" href="#main">تخطي إلى المحتوى</a>
<header class="top"><div class="wrap bar"><a class="brand" href="/"><img src="/assets/logo-96.png" width="40" height="40" alt="شعار ${NAME}"><span>${NAME}</span></a>
<nav aria-label="القائمة الرئيسية">${NAV.map(([h,t])=>`<a href="${h}"${h===path?' aria-current="page"':''}>${t}</a>`).join('')}</nav>
<div class="acts"><button class="iconbtn" id="darkbtn" type="button" aria-label="الوضع الداكن" aria-pressed="false"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 2v14a7 7 0 010-14z"/></svg></button><a class="btn" href="/account.html">دخول / تسجيل</a></div></div></header>
<main id="main" class="wrap">${body}</main>
<footer class="foot"><div class="wrap fgrid"><div><strong>${NAME}</strong><p>${TAG}<br>شروحات تطبيقات ومعلومات مفيدة بالعربي.</p></div><div><strong>الأقسام</strong>${CATS.map(c=>`<a href="/category/${c.slug}.html">${c.name}</a>`).join('')}</div><div><strong>روابط</strong><a href="/about.html">عن المدونة</a><a href="/feed.xml">RSS</a><a href="/sitemap.xml">خريطة الموقع</a></div></div></footer>
<script src="/assets/sb.js"></script><script src="/assets/app.js" defer></script></body></html>`;
const card=a=>`<article class="card"><a class="cover" href="${postUrl(a)}" tabindex="-1" aria-hidden="true"><img src="${coverUrl(a)}" width="1200" height="630" loading="lazy" alt=""></a><div class="cb"><div class="meta"><a class="tag" href="/category/${catOf(a.cat).slug}.html">${esc(catOf(a.cat).name)}</a>${a.sample?'<span class="tag sample">تجريبي</span>':''}</div><h3><a href="${postUrl(a)}">${esc(a.title)}</a></h3><p>${esc(a.desc)}</p><time datetime="${a.date}">${fmt(a.date)}</time></div></article>`;
const sorted=[...A].sort((x,y)=>y.date.localeCompare(x.date));
const grid=l=>l.length?`<div class="grid">${l.map(card).join('')}</div>`:'<p class="empty">لا توجد مقالات في هذا القسم بعد.</p>';
const catTiles=`<div class="tiles">${CATS.map(c=>`<a class="tile t-${c.slug}" href="/category/${c.slug}.html"><strong>${c.name}</strong><span>${c.desc}</span><em>${A.filter(a=>catOf(a.cat).slug===c.slug).length} مقال</em></a>`).join('')}</div>`;
W('index.html',layout({title:`${NAME} | شروحات تطبيقات ومعلومات بالعربي`,desc:'مدونة عربية تشرح التطبيقات والأدوات الرقمية والمعلومات المفيدة بخطوات بسيطة وواضحة.',path:'/',
body:`<section class="hero"><div class="hc"><h1>دليلك الرقمي لفهم التطبيقات</h1><p>شروحات عربية واضحة خطوة بخطوة للتطبيقات والأدوات الرقمية، ومعلومات تفيدك في يومك.</p><div class="hbtn"><a class="btn big light" href="/articles/">تصفح المقالات</a><a class="btn big ghost" href="/account.html">أنشئ حسابك مجانًا</a></div></div><img class="hl" src="/assets/logo-512.png" width="260" height="260" alt="" aria-hidden="true"></section>
<h2>الأقسام</h2>${catTiles}<h2>أحدث المقالات</h2>${grid(sorted.slice(0,6))}<p class="more"><a class="btn" href="/articles/">كل المقالات</a></p>`,
ld:{'@context':'https://schema.org','@type':'WebSite',name:NAME,url:SITE+'/',inLanguage:'ar'}}));
W('articles/index.html',layout({title:`جميع المقالات | ${NAME}`,desc:'قائمة بجميع شروحات التطبيقات والمعلومات في المدونة.',path:'/articles/',body:`<h1>جميع المقالات</h1>${grid(sorted)}`,ld:{'@context':'https://schema.org','@type':'CollectionPage',name:'جميع المقالات',inLanguage:'ar'}}));
for(const c of CATS){const l=sorted.filter(a=>catOf(a.cat).slug===c.slug);
 W(`category/${c.slug}.html`,layout({title:`${c.name} | ${NAME}`,desc:c.desc+' في مدونة دليلك الرقمي.',path:`/category/${c.slug}.html`,body:`<nav class="crumb" aria-label="مسار التنقل"><a href="/">الرئيسية</a> › ${c.name}</nav><h1>${c.name}</h1><p class="lead">${c.desc}</p>${grid(l)}`,ld:{'@context':'https://schema.org','@type':'CollectionPage',name:c.name,inLanguage:'ar'}}))}
for(const a of A){const html=a.body.map(p=>p.startsWith('## ')?`<h2>${esc(p.slice(3))}</h2>`:/^\d\. /.test(p)?`<p class="step">${esc(p)}</p>`:`<p>${esc(p)}</p>`).join('');
 const rel=sorted.filter(x=>x.slug!==a.slug&&catOf(x.cat).slug===catOf(a.cat).slug).concat(sorted.filter(x=>x.slug!==a.slug&&catOf(x.cat).slug!==catOf(a.cat).slug)).slice(0,3);
 W(postUrl(a).slice(1),layout({title:`${a.title} | ${NAME}`,desc:a.desc,path:postUrl(a),type:'article',image:coverUrl(a),
 body:`<nav class="crumb" aria-label="مسار التنقل"><a href="/">الرئيسية</a> › <a href="/category/${catOf(a.cat).slug}.html">${esc(catOf(a.cat).name)}</a></nav><article class="post"><img class="pcover" src="${coverUrl(a)}" width="1200" height="630" alt="${esc(a.title)}"><div class="pb"><h1>${esc(a.title)}</h1><p class="meta"><a class="tag" href="/category/${catOf(a.cat).slug}.html">${esc(catOf(a.cat).name)}</a>${a.sample?' <span class="tag sample">مقال تجريبي</span>':''} <time datetime="${a.date}">${fmt(a.date)}</time></p>${html}</div></article><h2>اقرأ أيضًا</h2>${grid(rel)}`,
 ld:{'@context':'https://schema.org','@type':'Article',headline:a.title,description:a.desc,datePublished:a.date,dateModified:a.date,inLanguage:'ar',image:SITE+coverUrl(a),mainEntityOfPage:SITE+postUrl(a),publisher:{'@type':'Organization',name:NAME}}}))}
W('about.html',layout({title:`عن المدونة | ${NAME}`,desc:'تعرّف على مدونة دليلك الرقمي وما نقدمه.',path:'/about.html',body:`<h1>عن المدونة</h1><div class="post"><div class="pb"><p><img class="aboutlogo" src="/assets/logo-512.png" width="160" height="160" alt="شعار ${NAME}"></p><p>${NAME} (${TAG}) مدونة عربية تشرح التطبيقات والأدوات الرقمية ومعلومات مفيدة، بلغة بسيطة وخطوات واضحة.</p><p>يمكنك إنشاء حساب مجاني لمتابعة جديد المدونة.</p></div></div>`,ld:{'@context':'https://schema.org','@type':'AboutPage',name:'عن المدونة',inLanguage:'ar'}}));
W('account.html',layout({title:`تسجيل الدخول وإنشاء حساب | ${NAME}`,desc:'أنشئ حسابًا مجانيًا أو سجّل دخولك.',path:'/account.html',body:`<section class="authbox"><h1>حسابك</h1><div class="tabs" id="tabs"><button type="button" id="tab-in" class="on">تسجيل الدخول</button><button type="button" id="tab-up">حساب جديد</button></div>
<form id="authform" novalidate><label>البريد الإلكتروني<input id="email" type="email" required autocomplete="email" dir="ltr"></label><label>كلمة المرور (8 أحرف على الأقل)<input id="password" type="password" required minlength="8" autocomplete="current-password" dir="ltr"></label><button class="btn big" id="submit" type="submit">دخول</button> <button type="button" class="btn ghost2" id="forgot">نسيت كلمة المرور</button><p id="msg" role="status"></p></form>
<div id="signed" hidden><p id="who"></p><p><a class="btn" href="/admin.html">لوحة الإدارة</a> <button type="button" class="btn ghost2" id="logout">تسجيل الخروج</button></p></div></section>`,ld:{'@context':'https://schema.org','@type':'WebPage',name:'الحساب',inLanguage:'ar'}}).replace('index,follow','noindex'));
W('404.html',layout({title:`الصفحة غير موجودة | ${NAME}`,desc:'الصفحة المطلوبة غير موجودة.',path:'/404.html',body:'<h1>الصفحة غير موجودة</h1><p><a href="/">العودة للرئيسية</a></p>',ld:{'@context':'https://schema.org','@type':'WebPage',name:'404'}}).replace('index,follow','noindex'));
const urls=['/','/articles/',...CATS.map(c=>`/category/${c.slug}.html`),'/about.html',...A.map(postUrl)];
W('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${SITE}${u}</loc></url>`).join('')}</urlset>`);
W('robots.txt',`User-agent: *\nAllow: /\nDisallow: /account.html\nDisallow: /admin.html\nDisallow: /reset.html\nSitemap: ${SITE}/sitemap.xml\n`);
W('feed.xml',`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${NAME}</title><link>${SITE}/</link><description>شروحات تطبيقات ومعلومات</description><language>ar</language>${sorted.map(a=>`<item><title>${esc(a.title)}</title><link>${SITE}${postUrl(a)}</link><description>${esc(a.desc)}</description><pubDate>${new Date(a.date).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`);
for(const f of ['admin.html','reset.html'])fs.copyFileSync(f,`${out}/${f}`);
fs.cpSync('static',`${out}/assets`,{recursive:true});
fs.writeFileSync(`${out}/assets/style.css`,fs.readFileSync('fonts.css','utf8')+fs.readFileSync('style.css','utf8'));
for(const f of ['sb.js','app.js','admin.js']){let t=fs.readFileSync(f,'utf8');if(SBU&&SBK)t=t.replace('__SUPABASE_URL__',SBU).replace('__SUPABASE_ANON_KEY__',SBK);fs.writeFileSync(`${out}/assets/${f}`,t)}
console.log('pages',urls.length+2,'posts',A.length,'theme',theme,font);
