(() => {
 'use strict';
 const cfg = window.SEVENUP || {};
 const $ = (s) => document.querySelector(s);
 const toast = $('#toast'); let timer;
 const notify = (msg) => { toast.textContent=msg;toast.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),2600); };
 const safePath = (s) => { if(typeof s!=='string') return ''; const v=s.trim(); if(/^https:\/\//i.test(v)) {try{const u=new URL(v);return u.protocol==='https:'?v:'';}catch{return '';}} if(!/^(?!\/|\\|\.|#)[\w\-./ %]+\.pdf(?:\?[^#]*)?$/i.test(v)||v.includes('..'))return '';return v; };
 const grid=$('#bookGrid');
 const books=Array.isArray(cfg.books)?cfg.books:[];
 const safe=(t)=>String(t??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const bookData=books.map(book=>({...book,validPdf:safePath(book.pdf)}));
 function drawBooks(query='') {
  const q=query.trim().toLocaleLowerCase('bn');
  const filtered=bookData.filter(b=>[b.title,b.category,b.summary,...(b.tags||[])].join(' ').toLocaleLowerCase('bn').includes(q));
  grid.innerHTML=filtered.map(b=>`<article class="book-card"><div class="book-cover"><span class="vol">খণ্ড ${safe(b.volume)}</span><img src="${safe(b.cover)}" alt="${safe(b.title)} বইয়ের প্রচ্ছদ" loading="lazy" width="220" height="310"></div><div class="book-body"><div class="book-category">${safe(b.category)} · ${b.validPdf?'প্রকাশিত':'শিগগিরই আসছে'}</div><h3>${safe(b.title)}</h3><p>${safe(b.summary)}</p><div class="book-tags">${(b.tags||[]).slice(0,3).map(t=>`<span>${safe(t)}</span>`).join('')}</div><button class="download" type="button" data-book="${safe(b.id)}" ${b.validPdf?'':'disabled'}>${b.validPdf?'বিনামূল্যে পিডিএফ ডাউনলোড ↓':'শিগগিরই আসছে'}</button></div></article>`).join('');
  $('#noBooks').hidden=filtered.length!==0;$('#count').textContent=`${filtered.length.toLocaleString('bn-BD')}টি বই`;
 }
 drawBooks(); $('#search').addEventListener('input',e=>drawBooks(e.target.value));
 grid.addEventListener('click',e=>{ const btn=e.target.closest('[data-book]'); if(!btn)return; const b=bookData.find(x=>x.id===btn.dataset.book); if(!b?.validPdf)return;const a=document.createElement('a');a.href=b.validPdf;a.rel='noopener noreferrer';if(!/^https:\/\//.test(a.href)&&!/^https:\/\//.test(b.validPdf))a.download=b.validPdf.split('/').pop().split('?')[0];document.body.append(a);a.click();a.remove(); });
 async function copy(v){ if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(v); const ta=document.createElement('textarea');ta.value=v;ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();if(!ok)throw Error('copy failed'); }
 for(const method of ['bkash','nagad','rocket']){const value=String(cfg.payments?.[method]||'').trim();const display=$(`#number-${method}`);const btn=$(`[data-method="${method}"]`);if(/^01\d{9}$/.test(value)){display.textContent=value;btn.disabled=false;btn.addEventListener('click',async()=>{try{await copy(value);notify('নম্বর কপি হয়েছে!');btn.textContent='কপি হয়েছে ✓';setTimeout(()=>btn.textContent='নম্বর কপি',2000);}catch{notify('নম্বর কপি করা যায়নি। হাতে কপি করুন।');}});} }
 const fb=String(cfg.facebook||'');if(/^https:\/\/(www\.)?facebook\.com\//i.test(fb)){const a=$('#facebook');a.href=fb;a.hidden=false;}
 $('#year').textContent=new Date().getFullYear();
 const menu=$('.menu');const nav=$('#nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'মেনু বন্ধ করুন':'মেনু খুলুন');});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}));
})();
