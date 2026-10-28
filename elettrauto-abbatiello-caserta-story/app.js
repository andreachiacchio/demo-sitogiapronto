/* Sito Già Pronto 3D (modulo template/3d): orari/aperto-chiuso, scroll -> --p, fasi, carte recensioni, avvio scena (bundle del tema, three.js).
   Legge dal .stage: data-imgs (foto, separate da virgola), data-cuts (soglie delle 4 fasi), data-load (testo di attesa), data-svr="a,b" + data-svn="n" (servizi a passi, facoltativo). */
(function(){
  var d=document.documentElement;
  /* ---- orari (Europe/Rome) ---- */
  function romeNow(){try{var f=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()),o={};f.forEach(function(x){o[x.type]=x.value});var wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[o.weekday];return{d:wd,m:(+o.hour%24)*60+(+o.minute)}}catch(e){var n=new Date();return{d:n.getDay(),m:n.getHours()*60+n.getMinutes()}}}
  function tm(s){var a=s.split(':');return(+a[0])*60+(+a[1])}
  var H={};try{H=JSON.parse(document.getElementById('hrs-data').textContent)}catch(e){}
  var DN=['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
  /* Intervalli [apertura,chiusura] in minuti dall'inizio del giorno. Se la chiusura e' <= apertura (es. 18:00-01:00, 20:00-00:00)
     l'intervallo attraversa la mezzanotte: la chiusura vale +1440 e l'orario "avanza" nel giorno dopo. "24:00" = mezzanotte. */
  function ivs(h){var r=[];(h||[]).forEach(function(x){var a=tm(x[0]),b=tm(x[1]);if(b<=a)b+=1440;r.push({a:a,b:b,ta:x[0],tb:x[1]})});r.sort(function(p,q){return p.a-q.a});return r}
  function hoursState(H,wd,m){
    var today=ivs(H[wd]),yest=ivs(H[(wd+6)%7]),tom=ivs(H[(wd+1)%7]),i,x;
    for(i=0;i<yest.length;i++){x=yest[i];if(x.b>1440&&m<x.b-1440)return{open:true,until:x.tb}}   /* residuo di ieri dopo mezzanotte */
    for(i=0;i<today.length;i++){x=today[i];
      if(m>=x.a&&m<x.b){var u=x.tb;
        if(x.b===1440&&tom.length&&tom[0].a===0)u=tom[0].tb;      /* chiude a mezzanotte e domani riapre subito: continuo */
        return{open:true,until:u}}}
    for(i=0;i<today.length;i++)if(today[i].a>m)return{open:false,k:0,at:today[i].ta};
    for(var k=1;k<=7;k++){var dd=(wd+k)%7,l=ivs(H[dd]);
      if(l.length)return{open:false,k:k,at:l[0].ta,dd:dd}}
    return{open:false,k:-1}}
  function badgeText(st){
    if(st.open)return'Aperto ora · fino alle '+st.until;
    if(st.k===0)return'Chiuso ora · apre oggi alle '+st.at;
    if(st.k>0)return'Chiuso ora · apre '+(st.k===1?'domani':DN[st.dd])+' alle '+st.at;
    return'Chiuso ora'}
  window.__sgpHours={state:hoursState,text:badgeText,ivs:ivs};
  function badge(){if(!Object.keys(H).length)return;var n=romeNow(),st=hoursState(H,n.d,n.m),t=badgeText(st),cls=st.open?'is-open':'is-closed';
    [].forEach.call(document.querySelectorAll('.open-badge'),function(b){b.classList.add(cls);var s=b.querySelector('.ob-t')||b.querySelector('span');if(s)s.textContent=t});
    var tr=document.querySelector('.hrs tr[data-d="'+((n.d+6)%7)+'"]');if(tr)tr.classList.add('today')}
  try{badge()}catch(e){}
})();

/* Sito Già Pronto – scroll-story (modulo template/3d): scroll -> progresso p (0..1) -> capitoli (titolo enorme, foto, testo) + scena three.js.
   La pagina HTML è già completa: qui si promuove soltanto (st2 = comparsa leggera, st3 = scena). Tutto il testo resta HTML vero. */
(function(){
  var d=document.documentElement,st=document.querySelector('.story');
  function clamp(v,a,b){return v<a?a:v>b?b:v}
  function sm(t){t=clamp(t,0,1);return t*t*(3-2*t)}
  function revealInit(){
    var els=[].slice.call(document.querySelectorAll('.chap,.rv'));
    if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    els.forEach(function(e){io.observe(e)})}
  window.__storyInit=function(){ /* fallback st3 -> st2 */
    if(st){st.removeAttribute('data-ph');st.style.removeProperty('--p');[].forEach.call(st.querySelectorAll('.chap'),function(c){c.removeAttribute('style');c.classList.remove('on')})}
    revealInit()};
  if(d.classList.contains('st2'))revealInit();
  var PH=!!st&&st.classList.contains('ph');
  if(!st||!(d.classList.contains('st3')||(PH&&d.classList.contains('sp'))))return;
  var tb=document.querySelector('.topbar');
  function hdr(){var h=tb?Math.round(tb.getBoundingClientRect().bottom+scrollY):0;d.style.setProperty('--hdr',h+'px')}
  hdr();
  var cv=st.querySelector('.r3d'),pin=st.querySelector('.pin'),body=document.body,raf=0,P=0;
  var CH=(st.dataset.ch||'.12-.33,.33-.55,.55-.77,.77-1').split(',').map(function(x){return x.split('-').map(Number)});
  var DUR=+st.dataset.dur||24,chaps=[].slice.call(st.querySelectorAll('.chap')),hero=st.querySelector('.hero');
  var hc=st.querySelector('.hud-c'),ht=st.querySelector('.hud-t');
  function mmss(s){s=Math.round(s);return '00:'+(s<10?'0':'')+s}
  function upd(){raf=0;var r=st.getBoundingClientRect(),vh=innerHeight,tot=st.offsetHeight-vh;
    P=window.__po!=null?window.__po:(tot>0?clamp(-r.top/tot,0,1):0);
    st.style.setProperty('--p',P.toFixed(4));
    var ph=0,E=.02;
    if(PH){ /* foto a tutto schermo: ogni capitolo entra con una tendina dal basso sopra il precedente; zoom/parallasse con --k */
      hero.style.setProperty('--hk',clamp(P/.14,0,1).toFixed(3));
      var top=-1;
      chaps.forEach(function(c,i){var a=CH[i][0],b=CH[i][1],last=i===chaps.length-1;
        var e=sm((P-(a-.02))/.06),k=clamp((P-(a-.04))/((b-a)+.08),0,1);
        c.style.setProperty('--e',e.toFixed(3));c.style.setProperty('--k',k.toFixed(3));c.classList.toggle('on',e>.001);
        if(e>.995)top=i; if(P>=a)ph=i+1});
      chaps.forEach(function(c,i){c.setAttribute('aria-hidden',i===top?'false':'true');c.classList.toggle('top',i===top)});
      hero.style.visibility=top>=0?'hidden':'visible';
      var f0=String(ph);if(st.dataset.ph!==f0)st.dataset.ph=f0;
      if(hc)hc.textContent=(ph<1?'01':'0'+ph)+' / '+('0'+chaps.length);
      if(ht)ht.textContent=mmss(P*DUR)+' / '+mmss(DUR);
      body.classList.toggle('past',r.bottom<vh*.9);return}
    chaps.forEach(function(c,i){var a=CH[i][0],b=CH[i][1],last=i===chaps.length-1;
      var o=sm((P-a)/(2*E))*(last?1:1-sm((P-(b-2*E))/(2*E)));
      c.style.setProperty('--o',o.toFixed(3));c.classList.toggle('on',o>.04);c.setAttribute('aria-hidden',o>.5?'false':'true');
      if(P>=a)ph=i+1});
    var h=1-sm((P-.015)/.07);hero.style.setProperty('--ho',h.toFixed(3));hero.style.visibility=h<.01?'hidden':'visible';
    var f=String(ph);if(st.dataset.ph!==f)st.dataset.ph=f;
    if(hc)hc.textContent=(ph<1?'01':'0'+ph)+' / '+('0'+chaps.length);
    if(ht)ht.textContent=mmss(P*DUR)+' / '+mmss(DUR);
    body.classList.toggle('past',r.bottom<vh*.9)}
  function req(){if(!raf)raf=requestAnimationFrame(upd)}
  addEventListener('scroll',req,{passive:true});addEventListener('resize',function(){hdr();req()});upd();
  window.__p3=function(){return P};
  if(PH){window.__w3=1;st.classList.add('ready');window.__story={snap:function(p){window.__po=p;upd()}};return}
  var started=false;
  function go(){if(started||!window.__sgp3d)return;started=true;
    try{window.__sgp3d.start({canvas:cv,url:st.dataset.model,getP:function(){return P},maxDpr:1.5,
      onReady:function(){window.__w3=1;st.classList.add('ready');cv.classList.add('on')},
      onFail:function(){window.__fb3&&window.__fb3()}})}
    catch(e){try{console.warn('story',e)}catch(_){}window.__fb3&&window.__fb3()}}
  if(window.__sgp3d)go();else addEventListener('sgp3d',go);
})();
