import fs from 'fs';
const SITE=(process.env.SITE_URL||'https://example.com').replace(/\/$/,'');
const NAME='دليلك الرقمي';
const A=JSON.parse(fs.readFileSync('articles.json','utf8'));
const SBU=process.env.SUPABASE_URL,SBK=process.env.SUPABASE_ANON_KEY;
if(SBU&&SBK){A.length=0;const r=await fetch(SBU+'/rest/v1/posts?select=*&published=eq.true&order=created_at.desc',{headers:{apikey:SBK,Authorization:'Bearer '+SBK}});
 if(r.ok)for(const p of await r.json())A.push({slug:encodeURIComponent(p.slug),title:p.title,cat:p.cat,date:p.created_at.slice(0,10),desc:p.description,body:p.body.split(/\n+/).filter(Boolean)});else console.error('supabase fetch failed',r.status)}
const out='dist'; fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out+'/articles',{recursive:true}); fs.mkdirSync(out+'/assets',{recursive:true});
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmt=d=>new Date(d).toLocaleDateString('ar-SA-u-nu-latn',{year:'numeric',month:'long',day:'numeric'});
const layout=({title,desc,path,body,ld,type='website'})=>`<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${path}"><meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:locale" content="ar_AR"><meta property="og:type" content="${type}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}${path}"><meta property="og:site_name" content="${NAME}">
<meta property="og:image" content="${SITE}/assets/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${SITE}/assets/og.png"><meta name="theme-color" content="#2174d9">
<link rel="alternate" type="application/rss+xml" title="${NAME}" href="${SITE}/feed.xml">
<link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"><link rel="preload" href="/assets/fonts/thmanyah-sans-Regular.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/style.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script></head><body>
<a class="skip" href="#main">تخطي إلى المحتوى</a>
<header class="top"><div class="wrap bar"><a class="brand" href="/"><img src="/assets/logo-96.png" width="40" height="40" alt="شعار دليلك الرقمي"><span>${NAME}</span></a>
<nav aria-label="القائمة الرئيسية"><a href="/">الرئيسية</a><a href="/articles/">المقالات</a><a href="/about.html">عن المدونة</a><a class="btn" href="/account.html">دخول / تسجيل</a></nav></div></header>
<main id="main" class="wrap">${body}</main>
<footer class="foot"><div class="wrap"><p>${NAME}: شروحات تطبيقات ومعلومات مفيدة بالعربي.</p><p><a href="/about.html">عن المدونة</a> · <a href="/feed.xml">RSS</a> · <a href="/sitemap.xml">خريطة الموقع</a></p></div></footer>
<script src="/assets/auth.js" defer></script></body></html>`;
const card=a=>`<article class="card"><span class="tag">${a.cat}</span><h3><a href="/articles/${a.slug}.html">${esc(a.title)}</a></h3><p>${esc(a.desc)}</p><time datetime="${a.date}">${fmt(a.date)}</time></article>`;
const W=(p,c)=>fs.writeFileSync(`${out}/${p}`,c);
const sorted=[...A].sort((a,b)=>b.date.localeCompare(a.date));
W('index.html',layout({title:`${NAME} | شروحات تطبيقات ومعلومات بالعربي`,desc:'مدونة عربية تشرح التطبيقات والأدوات الرقمية والمعلومات المفيدة بخطوات بسيطة وواضحة.',path:'/',
body:`<section class="hero"><h1>تعلّم التطبيقات بخطوات بسيطة</h1><p>شروحات عربية واضحة للتطبيقات والأدوات الرقمية، ومعلومات تفيدك في يومك.</p><a class="btn big" href="/account.html">أنشئ حسابك مجانًا</a></section><h2>أحدث المقالات</h2><div class="grid">${sorted.map(card).join('')}</div>`,
ld:{'@context':'https://schema.org','@type':'WebSite',name:NAME,url:SITE+'/',inLanguage:'ar'}}));
W('articles/index.html',layout({title:`جميع المقالات | ${NAME}`,desc:'قائمة بجميع شروحات التطبيقات والمعلومات في المدونة.',path:'/articles/',body:`<h1>جميع المقالات</h1><div class="grid">${sorted.map(card).join('')}</div>`,ld:{'@context':'https://schema.org','@type':'CollectionPage',name:'جميع المقالات',inLanguage:'ar'}}));
for(const a of A){const html=a.body.map(p=>p.startsWith('## ')?`<h2>${esc(p.slice(3))}</h2>`:/^\d\. /.test(p)?`<p class="step">${esc(p)}</p>`:`<p>${esc(p)}</p>`).join('');
const rel=sorted.filter(x=>x.slug!==a.slug).slice(0,3);
W(`articles/${a.slug}.html`,layout({title:`${a.title} | ${NAME}`,desc:a.desc,path:`/articles/${a.slug}.html`,type:'article',
body:`<nav class="crumb" aria-label="مسار التنقل"><a href="/">الرئيسية</a> › <a href="/articles/">المقالات</a> › ${esc(a.cat)}</nav><article class="post"><h1>${esc(a.title)}</h1><p class="meta"><span class="tag">${a.cat}</span> <time datetime="${a.date}">${fmt(a.date)}</time></p>${html}</article><h2>اقرأ أيضًا</h2><div class="grid">${rel.map(card).join('')}</div>`,
ld:{'@context':'https://schema.org','@type':'Article',headline:a.title,description:a.desc,datePublished:a.date,dateModified:a.date,inLanguage:'ar',mainEntityOfPage:`${SITE}/articles/${a.slug}.html`,publisher:{'@type':'Organization',name:NAME}}}));}
W('about.html',layout({title:`عن المدونة | ${NAME}`,desc:'تعرّف على مدونة دليلك الرقمي وما نقدمه.',path:'/about.html',body:'<h1>عن المدونة</h1><p>نكتب شروحات عربية مبسطة للتطبيقات والأدوات الرقمية ومعلومات مفيدة، بدون تعقيد.</p><p><img class="aboutlogo" src="/assets/logo-full-light.jpg" width="220" height="220" alt="شعار دليلك الرقمي: YOUR DIGITAL GUIDE"></p><p>يمكنك إنشاء حساب مجاني لمتابعة جديد المدونة.</p>',ld:{'@context':'https://schema.org','@type':'AboutPage',name:'عن المدونة',inLanguage:'ar'}}));
W('account.html',layout({title:`تسجيل الدخول وإنشاء حساب | ${NAME}`,desc:'أنشئ حسابًا مجانيًا أو سجّل دخولك.',path:'/account.html',body:`<section class="authbox"><h1>حسابك</h1><div class="tabs"><button type="button" id="tab-in" class="on">تسجيل الدخول</button><button type="button" id="tab-up">حساب جديد</button></div>
<form id="authform" novalidate><label>البريد الإلكتروني<input id="email" type="email" required autocomplete="email" dir="ltr"></label><label>كلمة المرور (8 أحرف على الأقل)<input id="password" type="password" required minlength="8" autocomplete="current-password" dir="ltr"></label><button class="btn big" id="submit" type="submit">دخول</button><p><button type="button" class="btn" id="forgot">نسيت كلمة المرور</button></p><p id="msg" role="status"></p></form>
<div id="signed" hidden><p id="who"></p><button type="button" class="btn" id="logout">تسجيل الخروج</button></div></section>`,ld:{'@context':'https://schema.org','@type':'WebPage',name:'الحساب',inLanguage:'ar'}}));
const nf=layout({title:`الصفحة غير موجودة | ${NAME}`,desc:'الصفحة المطلوبة غير موجودة.',path:'/404.html',body:'<h1>الصفحة غير موجودة</h1><p><a href="/">العودة للرئيسية</a></p>',ld:{'@context':'https://schema.org','@type':'WebPage',name:'404'}}).replace('index,follow','noindex');W('404.html',nf);
const urls=['/','/articles/','/about.html',...A.map(a=>`/articles/${a.slug}.html`)];
W('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${SITE}${u}</loc></url>`).join('')}</urlset>`);
W('robots.txt',`User-agent: *\nAllow: /\nDisallow: /account.html\nDisallow: /admin.html\nDisallow: /reset.html\nSitemap: ${SITE}/sitemap.xml\n`);
W('feed.xml',`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${NAME}</title><link>${SITE}/</link><description>شروحات تطبيقات ومعلومات</description><language>ar</language>${sorted.map(a=>`<item><title>${esc(a.title)}</title><link>${SITE}/articles/${a.slug}.html</link><description>${esc(a.desc)}</description><pubDate>${new Date(a.date).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`);
fs.cpSync('static',out+'/assets',{recursive:true});for(const f of ['admin.html','reset.html'])fs.copyFileSync(f,out+'/'+f);fs.copyFileSync('admin.js',out+'/assets/admin.js');fs.copyFileSync('style.css',out+'/assets/style.css');for(const f of ['auth.js','admin.js']){let t=fs.readFileSync(f,'utf8');if(SBU&&SBK)t=t.replace('__SUPABASE_URL__',SBU).replace('__SUPABASE_ANON_KEY__',SBK);fs.writeFileSync(out+'/assets/'+f,t)}
fs.writeFileSync(out+'/_headers','/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n');
console.log('pages',urls.length+2);
