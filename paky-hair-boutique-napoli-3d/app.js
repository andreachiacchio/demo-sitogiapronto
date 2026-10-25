/* Sito Già Pronto 3D (modulo template/3d): orari/aperto-chiuso, scroll -> --p, fasi, carte recensioni, avvio scena (bundle del tema, three.js).
   Legge dal .stage: data-imgs (foto, separate da virgola), data-cuts (soglie delle 4 fasi), data-load (testo di attesa), data-svr="a,b" + data-svn="n" (servizi a passi, facoltativo). */
(function(){
  var d=document.documentElement,st=document.querySelector('.stage');
  /* ---- orari (Europe/Rome) ---- */
  function romeNow(){try{var f=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()),o={};f.forEach(function(x){o[x.type]=x.value});var wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[o.weekday];return{d:wd,m:(+o.hour%24)*60+(+o.minute)}}catch(e){var n=new Date();return{d:n.getDay(),m:n.getHours()*60+n.getMinutes()}}}
  function tm(s){var a=s.split(':');return(+a[0])*60+(+a[1])}
  var H={};try{H=JSON.parse(document.getElementById('hrs-data').textContent)}catch(e){}
  var DN=['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
  function badge(){if(!Object.keys(H).length)return;var n=romeNow(),t='',cls='';
    var today=H[n.d]||[];
    for(var i=0;i<today.length;i++){var a=tm(today[i][0]),b=tm(today[i][1]);if(n.m>=a&&n.m<b){t='Aperto ora · fino alle '+today[i][1];cls='is-open';break}}
    if(!cls){cls='is-closed';var found=false;
      for(var i2=0;i2<today.length;i2++){if(tm(today[i2][0])>n.m){t='Chiuso ora · apre oggi alle '+today[i2][0];found=true;break}}
      if(!found){for(var k=1;k<=7;k++){var dd=(n.d+k)%7,h=H[dd]||[];if(h.length){t='Chiuso ora · apre '+(k===1?'domani':DN[dd])+' alle '+h[0][0];break}}}}
    [].forEach.call(document.querySelectorAll('.open-badge'),function(b){b.classList.add(cls);var s=b.querySelector('.ob-t')||b.querySelector('span');if(s)s.textContent=t});
    var tr=document.querySelector('.hrs tr[data-d="'+((n.d+6)%7)+'"]');if(tr)tr.classList.add('today')}
  try{badge()}catch(e){}
  /* ---- livello dyn: comparsa allo scroll ---- */
  function revealInit(){
    if(!('IntersectionObserver' in window)){[].forEach.call(document.querySelectorAll('.pz,.rv'),function(el){el.classList.add('in')});return}
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});
    [].forEach.call(document.querySelectorAll('.pz,.rv'),function(el){io.observe(el)})}
  var rvCards=null;
  window.__sgpInit=function(){ /* fallback da 3D a livello dyn: rimetto le recensioni nella sezione */
    if(rvCards){var l=document.querySelector('#recensioni .rv-list');rvCards.forEach(function(c){c.removeAttribute('style');c.className='rv';if(l)l.appendChild(c)})}
    var st2=document.querySelector('.stage');if(st2){st2.removeAttribute('data-ph');st2.style.removeProperty('--p')}
    revealInit()};
  if(d.classList.contains('dyn'))revealInit();
  /* ---- 3D ---- */
  if(!st||!d.classList.contains('dyn3'))return;
  var cv=st.querySelector('.r3d'),pin=st.querySelector('.pin'),ring=st.querySelector('.rev-ring'),raf=0,P=0,cards=[].slice.call(document.querySelectorAll('#recensioni .rv'));
  rvCards=cards;cards.forEach(function(c){ring.appendChild(c)});
  var ld=document.createElement('p');ld.className='load';ld.setAttribute('aria-hidden','true');ld.textContent=st.dataset.load||'Carico la scena…';pin.appendChild(ld);
  var CUT=(st.dataset.cuts||'.07,.2,.58,.86').split(',').map(Number),SV=(st.dataset.svr||'').split(',').map(Number),SVN=+st.dataset.svn||0,IMGS=(st.dataset.imgs||'').split(',');
  var cn=st.querySelector('.dc-n b'),body=document.body;
  function ph(p){return p<CUT[0]?0:p<CUT[1]?1:p<CUT[2]?2:p<CUT[3]?3:4}
  function upd(){raf=0;var r=st.getBoundingClientRect(),vh=innerHeight,tot=st.offsetHeight-vh;
    P=tot>0?Math.min(1,Math.max(0,-r.top/tot)):0;
    st.style.setProperty('--p',P.toFixed(4));
    var f=String(ph(P));if(st.dataset.ph!==f)st.dataset.ph=f;
    if(SVN){var q=Math.max(0,Math.min(SVN-1,Math.floor((P-SV[0])/(SV[1]-SV[0])*SVN))),qs=String(q);if(st.dataset.sv!==qs)st.dataset.sv=qs}
    body.classList.toggle('past',r.bottom<vh*0.9)}
  function req(){if(!raf)raf=requestAnimationFrame(upd)}
  addEventListener('scroll',req,{passive:true});addEventListener('resize',req);upd();
  window.__p3=function(){return P};
  cards.forEach(function(c){c.addEventListener('click',function(){if(!c.classList.contains('is-front'))return;var o=c.classList.toggle('open');if(o)c.scrollTop=0})});
  var started=false;
  function go(){if(started||!window.__sgp3d)return;started=true;
    try{window.__sgp3d.start({canvas:cv,images:IMGS,url:st.dataset.model,services:(st.dataset.svk||'').split(',').filter(Boolean),cards:cards,getP:function(){return P},maxDpr:1.5,
      onReady:function(){window.__w3=1;st.classList.add('ready');cv.classList.add('on')},
      onFront:function(i){if(cn)cn.textContent=i+1},
      onSel:function(i){st.classList.toggle('is-sel',i>=0)},
      onCard:function(){cards.forEach(function(c){c.classList.remove('open')})},
      onFail:function(){window.__fb3&&window.__fb3()}}).catch(function(e){try{console.warn('sgp3d',e)}catch(_){}window.__fb3&&window.__fb3()})}
    catch(e){try{console.warn('sgp3d',e)}catch(_){}window.__fb3&&window.__fb3()}}
  if(window.__sgp3d)go();else addEventListener('sgp3d',go);
})();
