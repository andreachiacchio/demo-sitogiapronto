(function(){
  var d=document,root=d.documentElement;root.classList.remove('no-js');
  if(/[?&]capture=1/.test(location.search)){root.classList.add('capture');d.querySelectorAll('[loading=lazy]').forEach(function(x){x.loading='eager'})}
  // Header solido + barra mobile dopo l'hero
  var tb=d.querySelector('.topbar'),mb=d.querySelector('.mbar'),hero=d.querySelector('.hero');
  function onScroll(){var y=scrollY;tb&&tb.classList.toggle('solid',y>40);
    mb&&mb.classList.toggle('show',y>(hero?hero.offsetHeight*0.55:300));}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  // Comparsa allo scroll
  var els=d.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});els.forEach(function(e){io.observe(e)})}
  else els.forEach(function(e){e.classList.add('in')});
  // Orari: oggi + aperto ora (fuso Europe/Rome)
  var hs=d.getElementById('orari-data');
  if(hs){try{var H=JSON.parse(hs.textContent),keys=['dom','lun','mar','mer','gio','ven','sab'];
    var p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    var wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[p.find(function(x){return x.type==='weekday'}).value];
    var mins=+p.find(function(x){return x.type==='hour'}).value%24*60+ +p.find(function(x){return x.type==='minute'}).value;
    var row=d.querySelector('tr[data-day="'+keys[wd]+'"]');row&&row.classList.add('today');
    function m(t){var a=t.split(':');return +a[0]*60+ +a[1]}
    var open=false,next='';
    (H[keys[wd]]||[]).forEach(function(r){var s=m(r[0]),e=m(r[1]);if(e<=s)e+=1440;if(mins>=s&&mins<e){open=true;next=r[1]}});
    var prev=H[keys[(wd+6)%7]]||[];prev.forEach(function(r){var s=m(r[0]),e=m(r[1]);if(e<=s&&mins<e){open=true;next=r[1]}});
    d.querySelectorAll('.open-badge').forEach(function(b){b.classList.toggle('is-open',open);b.querySelector('span').textContent=open?('Aperto ora · chiude alle '+next):'Chiuso ora · guarda gli orari'});
  }catch(e){}}
  // Tab menu
  var tabs=d.querySelectorAll('.tab');
  tabs.forEach(function(t){t.addEventListener('click',function(){tabs.forEach(function(x){x.setAttribute('aria-selected',x===t)});
    d.querySelectorAll('.menu-panel').forEach(function(pn){pn.hidden=pn.id!==t.getAttribute('aria-controls')})})});
  // Lightbox galleria
  var lb=d.querySelector('.lightbox');
  if(lb){var li=lb.querySelector('img');d.querySelectorAll('.gallery a').forEach(function(a){a.addEventListener('click',function(ev){ev.preventDefault();li.src=a.getAttribute('href');li.alt=a.querySelector('img').alt;lb.classList.add('on')})});
    lb.addEventListener('click',function(){lb.classList.remove('on')});addEventListener('keydown',function(e){if(e.key==='Escape')lb.classList.remove('on')})}
})();
