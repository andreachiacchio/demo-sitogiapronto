/* Assistente demo Sito Già Pronto: regole locali, nessun server. Dati solo da #chat-data. */
(function(){
var d=document,el=d.getElementById('chat-data');if(!el)return;
var D;try{D=JSON.parse(el.textContent)}catch(x){return}
var css=d.createElement('link');css.rel='stylesheet';css.href='chat.css';d.head.appendChild(css);
var GG=['dom','lun','mar','mer','gio','ven','sab'],GN={lun:'lunedì',mar:'martedì',mer:'mercoledì',gio:'giovedì',ven:'venerdì',sab:'sabato',dom:'domenica'};
var RIST=D.tipo=='ristorante',st=null,bk={},hist=[];
function h(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function norm(t){return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9: ]+/g,' ')}
function tel(){return '<a href="'+h(D.tel_href)+'">'+h(D.telefono)+'</a>'}
function call(p){return (p||'Per questo meglio chiamarci')+': '+tel()+'.'}
function fasce(k){var f=D.orari[k]||[];return f.length?f.map(function(x){return x[0]+'–'+x[1]}).join(' e '):null}
// --- UI ---
var b=d.createElement('button');b.className='cb';b.type='button';b.setAttribute('aria-label','Chiedi a '+D.nome+': apri la chat');b.setAttribute('aria-expanded','false');
b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg><span>Chiedi a '+h(D.nome)+'</span>';
var p=d.createElement('div');p.className='cp';p.id='chat-panel';p.setAttribute('role','dialog');p.setAttribute('aria-label','Assistente di '+D.nome);p.hidden=true;
p.innerHTML='<div class="ch"><b>'+h(D.nome)+'</b><span>Assistente</span><button type="button" class="cx" aria-label="Chiudi la chat">×</button></div>'+
'<div class="cl" aria-live="polite"></div><form class="cf"><label for="chat-in" class="sr">Scrivi la tua domanda</label>'+
'<input id="chat-in" autocomplete="off" placeholder="Scrivi una domanda…" maxlength="200"><button aria-label="Invia">➤</button></form>'+
'<p class="cn">Assistente automatico di prova · Sito Già Pronto</p>';
b.setAttribute('aria-controls','chat-panel');d.body.appendChild(p);d.body.appendChild(b);
var L=p.querySelector('.cl'),F=p.querySelector('form'),IN=p.querySelector('input');
function add(who,html,qr){var m=d.createElement('div');m.className='cm '+who;m.innerHTML=html;L.appendChild(m);
 if(qr&&qr.length){var q=d.createElement('div');q.className='cq';qr.forEach(function(t){var x=d.createElement('button');x.type='button';x.textContent=t;x.onclick=function(){T('risposta-rapida-'+norm(t).trim().replace(/ +/g,'-').slice(0,20));send(t)};q.appendChild(x)});L.appendChild(q)}
 L.scrollTop=L.scrollHeight}
var QR=['Orari','Dove siamo',RIST?'Menu':'Servizi','Prenota'];
function T(n){window.sgpTrack&&window.sgpTrack(n)}
function open(){T('chat-aperta');p.hidden=false;b.setAttribute('aria-expanded','true');d.body.classList.add('chat-on');
 if(!L.children.length)add('bot','Ciao! Sono l’assistente di '+h(D.nome)+'. Chiedimi orari, indirizzo, '+(RIST?'menu':'servizi')+' o prenota.',QR);setTimeout(function(){IN.focus()},30)}
function close(){p.hidden=true;b.setAttribute('aria-expanded','false');d.body.classList.remove('chat-on');b.focus()}
b.onclick=function(){p.hidden?open():close()};p.querySelector('.cx').onclick=close;
d.addEventListener('keydown',function(e){if(e.key=='Escape'&&!p.hidden)close()});
F.onsubmit=function(e){e.preventDefault();var v=IN.value.trim();if(v){IN.value='';send(v)}};
// visibile su mobile insieme alla barra azioni (non copre i pulsanti dell'hero)
var mb=d.querySelector('.mbar');function vis(){d.body.classList.toggle('cb-show',!mb||mb.classList.contains('show')||matchMedia('(min-width:900px)').matches)}
addEventListener('scroll',vis,{passive:true});addEventListener('resize',vis);vis();
if(/[?&]chat=1/.test(location.search))open();
// --- risposte ---
function has(t,ws){return ws.some(function(w){return new RegExp('(^| )'+w).test(t)})}
function giorno(t){var m={lun:/lunedi/,mar:/martedi/,mer:/mercoledi/,gio:/giovedi/,ven:/venerdi/,sab:/sabato/,dom:/domenica/};for(var k in m)if(m[k].test(t))return k;
 if(/\boggi\b|stasera|stamattina/.test(t))return GG[new Date().getDay()];if(/domani/.test(t))return GG[(new Date().getDay()+1)%7];return null}
function orari(t){var g=giorno(t);
 if(!D.orari)return (D.orari_testo?h(D.orari_testo)+' ':'')+call(D.orari_testo?'Per gli orari esatti meglio chiamarci':'');
 if(g){var f=fasce(g);return (f?'Di '+GN[g]+' siamo aperti '+f+'.':'Di '+GN[g]+' siamo chiusi.')+(D.orari_nota?' <small>'+h(D.orari_nota)+'</small>':'')}
 return 'I nostri orari:<br>'+['lun','mar','mer','gio','ven','sab','dom'].map(function(k){return GN[k]+': '+(fasce(k)||'chiuso')}).join('<br>')+(D.orari_nota?'<br><small>'+h(D.orari_nota)+'</small>':'')}
function dove(t){var r='Siamo in '+h(D.indirizzo)+'. <a href="'+h(D.dir_href)+'" target="_blank" rel="noopener">Indicazioni su Google Maps →</a>';
 if(has(t,['parchegg','posteggi','auto','macchina','metro','bus','autobus']))r+='<br>'+call('Per parcheggio e mezzi meglio chiamarci');return r}
function voci(t){var w=t.split(' ').filter(function(x){return x.length>3&&!/^(avete|quanto|costa|costano|prezzo|prezzi|fate|fare|vorrei|della|delle|degli|sono|anche|menu|servizi|servizio)$/.test(x)}),out=[];
 (D.menu||[]).forEach(function(c){c.voci.forEach(function(v){var n=norm(v.nome+' '+(v.descrizione||'')+' '+c.categoria);if(w.some(function(x){return n.indexOf(x.replace(/[ie]$/,''))>-1}))out.push(v)})});return [out,w]}
function menu(t,prezzo){var r=voci(t),hit=r[0],w=r[1];
 if(hit.length)return hit.slice(0,6).map(function(v){return '<b>'+h(v.nome)+'</b>'+(v.prezzo?' · € '+h(v.prezzo):'')+(v.descrizione?'<br><small>'+h(v.descrizione)+'</small>':'')}).join('<br>')+(prezzo&&!hit.some(function(v){return v.prezzo})?'<br>'+call('Per i prezzi meglio chiamarci'):'');
 var s=(D.servizi||[]).filter(function(x){var n=norm(x.titolo+' '+x.testo);return w.some(function(y){return n.indexOf(y.replace(/[ie]$/,''))>-1})});
 if(s.length)return s.map(function(x){return '<b>'+h(x.titolo)+'</b>: '+h(x.testo)}).join('<br>')+'<br>'+call(prezzo?'Per i prezzi meglio chiamarci':'Per i dettagli meglio chiamarci');
 if(w.length&&(prezzo||D.menu||D.servizi))return call();
 if(D.menu)return (RIST?'Il nostro menu: ':'I nostri servizi: ')+D.menu.map(function(c){return h(c.categoria)}).join(', ')+'. <a href="#menu">Guardalo sul sito →</a>';
 if(D.servizi)return (RIST?'Cosa trovi da noi:<br>':'I nostri servizi:<br>')+D.servizi.map(function(x){return '<b>'+h(x.titolo)+'</b>: '+h(x.testo)}).join('<br>')+'<br>'+call(RIST?'Per il menu e i prezzi meglio chiamarci':'Per i prezzi meglio chiamarci');
 return call()}
var STEPS=[['giorno','Per che giorno?',['Oggi','Domani','Sabato','Domenica']],['ora','A che ora?',RIST?['13:00','20:00','21:00']:['10:00','15:00','17:00']],
 RIST?['chi','Per quante persone?',['2','4','6']]:['chi','Per quale servizio?',(D.servizi||[]).map(function(x){return x.titolo})],['nome','A che nome?',[]]];
function wa(){var chi=RIST?(bk.chi+(/^\d+$/.test(bk.chi)?(bk.chi=='1'?' persona':' persone'):'')):bk.chi;
 var g=bk.giorno.toLowerCase(),txt='Ciao, vorrei prenotare da '+D.nome+' per '+g+' alle '+bk.ora+', '+chi+', a nome '+bk.nome+'. (dal sito demo di '+D.nome+')';
 return ['Riepilogo: <b>'+h(g)+'</b> alle <b>'+h(bk.ora)+'</b>, '+h(chi)+', a nome <b>'+h(bk.nome)+'</b>.<br><a class="cwa" href="https://wa.me/'+h(D.wa_prenota)+'?text='+encodeURIComponent(txt)+'" target="_blank" rel="noopener">Prenota su WhatsApp</a><br><small>La prenotazione è confermata solo dopo la risposta su WhatsApp.</small>',null]}
function flow(v){bk[STEPS[st][0]]=v;st++;if(st<STEPS.length)return [STEPS[st][1],STEPS[st][2]];st=null;return wa()}
function rules(q){var t=norm(q);
 if(st!==null){if(/^(annulla|stop|basta)/.test(t)){st=null;return ['Ok, prenotazione annullata.',QR]}return flow(q.trim().slice(0,60))}
 if(has(t,['prenot','tavolo','appuntament','posto','riserv'])){if(!D.wa_prenota)return [call('Per prenotare chiamaci'),null];st=0;bk={};T('prenotazione-iniziata');return [STEPS[0][1]+' <small>(scrivi “annulla” per uscire)</small>',STEPS[0][2]]}
 var prezzo=has(t,['prezz','cost','quanto','listino','euro']);
 if(has(t,['orari','orario','aper','chius','chiude','apre','lunedi','martedi','mercoledi','giovedi','venerdi','sabato','domenica','oggi','domani','stasera','festiv','quando']))return [orari(t),null];
 if(has(t,['dove','indirizz','parchegg','arriv','raggiung','mappa','posizione','zona','via ','strada']))return [dove(t),null];
 if(has(t,['telefon','chiama','numero','cellulare','contatt']))return ['Chiamaci al '+tel()+'.',null];
 if(prezzo||has(t,['menu','servizi','servizio','piatt','pizz','mangi','cucin','taglio','colore','piega','capelli','tinta','trattament','cosa fate','avete','fate','specialit','bere','caffe','colazion']))return [menu(t,prezzo),null];
 if(has(t,['ciao','salve','buongiorno','buonasera']))return ['Ciao! Come posso aiutarti?',QR];
 if(has(t,['grazie']))return ['Grazie a te! A presto da '+h(D.nome)+'.',null];
 return ['Non sono sicuro di aver capito. Posso aiutarti con queste cose:',QR]}
function send(q){add('me',h(q));hist.push(q);
 if(D.endpoint&&st===null){fetch(D.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:D.slug,domanda:q,storia:hist.slice(-8)})})
  .then(function(r){return r.json()}).then(function(j){if(!j||!j.risposta)throw 0;add('bot',h(j.risposta))}).catch(function(){var r=rules(q);add('bot',r[0],r[1])});return}
 var r=rules(q);setTimeout(function(){add('bot',r[0],r[1])},250)}
})();
