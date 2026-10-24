/* fx3d.js - effetti allo scroll (solo codice nostro). Con prefers-reduced-motion non fa nulla: la pagina resta statica. */
(function(){
  var d=document,root=d.documentElement,mq=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)');
  if(mq&&mq.matches)return;
  var els=[].slice.call(d.querySelectorAll('[data-fx]'));if(!els.length)return;
  root.classList.add('fx-on');
  var vh=innerHeight,ticking=false;
  function clamp(x,a,b){return x<a?a:x>b?b:x}
  function upd(){
    ticking=false;
    els.forEach(function(el){
      var t=el.getAttribute('data-fx'),r=el.getBoundingClientRect();
      if(r.bottom<-vh*.5||r.top>vh*1.5)return;
      var s=el.style;
      if(t==='hero'){s.setProperty('--p',clamp(-r.top/Math.max(1,r.height),0,1).toFixed(4))}
      else if(t==='view'){
        s.setProperty('--p',clamp((vh-r.top)/(vh+r.height),0,1).toFixed(4));
        s.setProperty('--e',clamp((vh-r.top)/(vh*.85),0,1).toFixed(4));
      }else if(t==='stage'){
        var p=clamp(-r.top/Math.max(1,r.height-vh),0,1);
        s.setProperty('--p',p.toFixed(4));
        s.setProperty('--a',clamp(p/.3,0,1).toFixed(4));
        s.setProperty('--b',clamp((p-.2)/.8,0,1).toFixed(4));
        var caps=el.querySelectorAll('.fx-cap'),n=caps.length,i=clamp(Math.floor((p-.22)/(.78/n)),-1,n-1);
        if(p<.22)i=-1;
        for(var k=0;k<n;k++){caps[k].classList.toggle('on',k===i);caps[k].classList.toggle('past',k<i)}
      }
    });
  }
  function req(){if(!ticking){ticking=true;requestAnimationFrame(upd)}}
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',function(){vh=innerHeight;req()});
  upd();
  // Inclinazione 3D di schede e recensioni col mouse (solo dispositivi con puntatore preciso)
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    d.querySelectorAll('.rev,.strip-card').forEach(function(c){
      c.addEventListener('pointermove',function(e){var b=c.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;
        c.style.setProperty('--ry',(x*10).toFixed(2)+'deg');c.style.setProperty('--rx',(-y*10).toFixed(2)+'deg');c.classList.add('tilting')});
      c.addEventListener('pointerleave',function(){c.classList.remove('tilting');c.style.removeProperty('--rx');c.style.removeProperty('--ry')});
    });
  }
})();
