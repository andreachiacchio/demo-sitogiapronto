(function(){
var d=document,h=d.documentElement,q=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var cap=/[?&]capture=1/.test(location.search);
// barra di avanzamento
var pb=d.createElement('div');pb.id='pbar';pb.setAttribute('aria-hidden','true');d.body.appendChild(pb);
var tk=false;function upd(){tk=false;var m=h.scrollHeight-innerHeight;pb.style.transform='scaleX('+(m>0?Math.min(1,scrollY/m):0)+')';
 if(!rm)q('.nt-bg').forEach(function(e){var r=e.parentNode.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)e.style.transform='translate3d(0,'+(r.top*-.08).toFixed(1)+'px,0) scale(1.06)'})}
addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(upd)}},{passive:true});upd();
// comparsa allo scroll (solo se il movimento e' consentito)
if(!rm&&!cap&&'IntersectionObserver' in window){
 h.classList.add('fx-on');
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 q('.fx').forEach(function(e,i){io.observe(e)});
 setTimeout(function(){q('.fx:not(.in)').forEach(function(e){var r=e.getBoundingClientRect();if(r.top<innerHeight)e.classList.add('in')})},2500);
}
// galleria: ingrandimento
var dlg=null;function open(src,alt){
 if(!dlg){dlg=d.createElement('dialog');dlg.className='zm';dlg.innerHTML='<button type="button" aria-label="Chiudi">×</button><img alt="">';d.body.appendChild(dlg);
  dlg.addEventListener('click',function(){dlg.close()});}
 var im=dlg.querySelector('img');im.src=src;im.alt=alt||'';if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','')}
q('[data-zoom]').forEach(function(f){f.tabIndex=0;f.setAttribute('role','button');f.setAttribute('aria-label','Ingrandisci la foto');
 var go=function(){var im=f.querySelector('img');open(im.getAttribute('data-full')||im.currentSrc||im.src,im.alt)};
 f.addEventListener('click',go);f.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
// carosello: frecce
q('.gal-wrap').forEach(function(w){var g=w.querySelector('.gal');
 q('.gal-nav button',w).forEach(function(b){b.addEventListener('click',function(){var s=g.querySelector('figure');var st=(s?s.getBoundingClientRect().width:300)+14;g.scrollBy({left:b.dataset.d*st,behavior:rm?'auto':'smooth'})})})});
})();
