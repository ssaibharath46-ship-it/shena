(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  const photos = [
    ['images/sneha-01.jpg','A beautiful memory to celebrate 💖','MEMORY 01'],
    ['images/sneha-02.jpg','Smiles, friendship and unforgettable moments ✨','MEMORY 02'],
    ['images/sneha-03.jpg','A special smile that makes every moment brighter 🌸','MEMORY 03'],
    ['images/sneha-04.jpg','Another beautiful memory to keep forever 💜','MEMORY 04']
  ];
  const wishes = [
    'May this year surprise you with something beautiful you never expected. ✨',
    'May every month give you at least one memory worth keeping forever. 💗',
    'May your dreams move one step closer, one small win at a time. 🌸',
    'May you always have people around you who make ordinary days better. 🫶',
    'May your next chapter be peaceful, exciting and full of reasons to smile. 🌙'
  ];
  const fortunes = [
    'A happy message is going to brighten one of your ordinary days. 📩',
    'One of your favorite memories is going to become even more special. ✨',
    'A small opportunity may turn into a big story later. 🌟',
    'This year is for trying something you kept saying “someday” about. 🎯',
    'Your best surprise may arrive when you are not looking for it. 💫'
  ];

  const toast = (msg) => {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2400);
  };
  const scrollToId = id => document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
  $$('[data-scroll]').forEach(b => b.addEventListener('click', () => scrollToId(b.dataset.scroll)));

  // Music — browser-safe: starts only after a user gesture.
  const audio = $('#music'), musicBtn=$('#musicBtn'), panelPlay=$('#panelPlay'), musicIcon=$('#musicIcon'), volume=$('#volume'), muteBtn=$('#muteBtn');
  audio.volume = 0.6;
  let playing = false;
  const syncMusic = () => {
    musicIcon.textContent = playing ? '⏸' : '▶';
    panelPlay.textContent = playing ? '⏸' : '▶';
  };
  async function startMusic(){
    try { await audio.play(); playing=true; syncMusic(); toast('Music started 🎵'); }
    catch { toast('Tap the music button to start 🎵'); }
  }
  function stopMusic(){ audio.pause(); playing=false; syncMusic(); }
  function toggleMusic(){ playing ? stopMusic() : startMusic(); }
  musicBtn.addEventListener('click', toggleMusic); panelPlay.addEventListener('click', toggleMusic);
  volume.addEventListener('input', () => { audio.volume=Number(volume.value); audio.muted=false; muteBtn.textContent='🔊'; });
  muteBtn.addEventListener('click', () => { audio.muted=!audio.muted; muteBtn.textContent=audio.muted?'🔇':'🔊'; });
  audio.addEventListener('play', () => {playing=true;syncMusic();}); audio.addEventListener('pause', () => {playing=false;syncMusic();});

  // Welcome screen unlocks audio and the full page. The inline handler in HTML is a fallback.
  const welcome=$('#welcome');
  async function enter(){
    if (window.unlockBirthday) window.unlockBirthday();
    if (welcome) { welcome.classList.add('hide'); welcome.setAttribute('aria-hidden','true'); welcome.style.pointerEvents='none'; }
    await startMusic();
  }
  const enterBtn = $('#enterBtn');
  if (enterBtn) enterBtn.addEventListener('click', enter);

  $('#startBtn').addEventListener('click', async () => { await startMusic(); scrollToId('gift'); });
  $('#heroHeart').addEventListener('click', () => { confetti(28); toast('You found a tiny secret heart 💗'); });

  // Gift.
  let opened=false;
  $('#giftBox').addEventListener('click', () => {
    if(opened) return; opened=true; $('#giftBox').classList.add('opened'); $('#giftResult').hidden=false; confetti(45); toast('First surprise unlocked 🎁');
  });

  // Gallery.
  let index=0, autoTimer=null, slideshowOn=false, busy=false;
  const photo=$('#mainPhoto'), caption=$('#caption'), tag=$('#tag'), counter=$('#counter'), miniLeft=$('#miniLeft'), miniRight=$('#miniRight'), dots=$('#dots'), card=$('#photoCard');
  photos.forEach((_,i)=>{
    const b=document.createElement('button'); b.setAttribute('aria-label',`Show memory ${i+1}`); b.addEventListener('click',()=>showPhoto(i,i>index?'next':'prev')); dots.appendChild(b);
  });
  function refreshGallery(){
    const p=photos[index]; photo.src=p[0]; photo.alt=`Sneha memory ${index+1}`; caption.textContent=p[1]; tag.textContent=p[2]; counter.textContent=`${index+1} / ${photos.length}`;
    $$('#dots button').forEach((b,i)=>b.classList.toggle('active',i===index));
    miniLeft.style.backgroundImage=`url("${photos[(index-1+photos.length)%photos.length][0]}")`;
    miniRight.style.backgroundImage=`url("${photos[(index+1)%photos.length][0]}")`;
    $('#lightCounter').textContent=`${index+1} / ${photos.length}`;
    $('#largePhoto').src=p[0]; $('#largePhoto').alt=`Sneha memory ${index+1} enlarged`;
  }
  function showPhoto(nextIndex, direction='next'){
    if(busy) return;
    busy=true; index=(nextIndex+photos.length)%photos.length;
    card.classList.remove('shift-left','shift-right'); void card.offsetWidth; card.classList.add(direction==='prev'?'shift-right':'shift-left');
    setTimeout(()=>{refreshGallery(); busy=false;},170);
    if(slideshowOn) restartSlideshow();
  }
  refreshGallery();
  $('#next').addEventListener('click',()=>showPhoto(index+1,'next')); $('#prev').addEventListener('click',()=>showPhoto(index-1,'prev'));
  let downX=0,downY=0;
  $('#gallery').addEventListener('touchstart',e=>{downX=e.touches[0].clientX;downY=e.touches[0].clientY;},{passive:true});
  $('#gallery').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-downX,dy=e.changedTouches[0].clientY-downY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))showPhoto(index+(dx<0?1:-1),dx<0?'next':'prev');},{passive:true});
  function restartSlideshow(){ clearInterval(autoTimer); if(slideshowOn) autoTimer=setInterval(()=>showPhoto(index+1,'next'),4500); }
  $('#slideshow').addEventListener('click',()=>{slideshowOn=!slideshowOn; $('#slideshow').textContent=slideshowOn?'⏸ Pause slideshow':'▶ Auto slideshow'; $('#slideStatus').textContent=slideshowOn?'Memories are moving automatically':'Tap the arrows or swipe'; restartSlideshow(); });

  // Lightbox.
  const lightbox=$('#lightbox');
  function openLight(){refreshGallery();lightbox.classList.add('show');lightbox.setAttribute('aria-hidden','false');}
  function closeLight(){lightbox.classList.remove('show');lightbox.setAttribute('aria-hidden','true');}
  $('#expand').addEventListener('click',openLight); photo.addEventListener('click',openLight);
  $('#lightNext').addEventListener('click',()=>showPhoto(index+1,'next')); $('#lightPrev').addEventListener('click',()=>showPhoto(index-1,'prev'));

  // Typewriter letter.
  const message='Wishing you endless happiness, beautiful memories, new adventures and a year filled with reasons to smile. Happy Birthday, Sneha! ❤️';
  let typeTimer;
  function typeMessage(){ clearInterval(typeTimer); let i=0; const el=$('#typed'); el.innerHTML='<span class="caret"></span>'; typeTimer=setInterval(()=>{ i++; el.innerHTML=message.slice(0,i)+'<span class="caret"></span>'; if(i>=message.length) clearInterval(typeTimer); },24); }
  $('#replay').addEventListener('click',typeMessage); typeMessage();

  // Surprise cards.
  let huntActive=false;
  function showOutput(icon,title,text){ $('#output').innerHTML=`<span>${icon}</span><h4>${title}</h4><p>${text}</p>`; }
  function random(arr){return arr[Math.floor(Math.random()*arr.length)];}
  function startHunt(){
    if(huntActive){toast('The hearts are already hiding 💗');return;}
    huntActive=true; const layer=$('#heartLayer'); layer.innerHTML=''; const positions=[[8,20],[82,24],[20,58],[78,62],[50,84]]; let found=0;
    positions.forEach((pos,i)=>{const b=document.createElement('button');b.className='hunt-heart';b.textContent='♥';b.style.left=pos[0]+'%';b.style.top=pos[1]+'%';b.setAttribute('aria-label',`Hidden heart ${i+1}`);b.addEventListener('click',()=>{if(b.disabled)return;b.disabled=true;b.style.opacity='.15';found++;if(found<5)toast(`Found ${found}/5 hearts 💗`);else{showOutput('💖','Heart Hunt complete!','You found all five. Your extra wish is: may this year hold more beautiful surprises than expected.');confetti(70);setTimeout(()=>{layer.innerHTML='';huntActive=false;},700);}});layer.appendChild(b);});
    toast('Five hearts are hiding around the screen 👀');
  }
  $$('.surprise').forEach(btn=>btn.addEventListener('click',()=>{
    const type=btn.dataset.type;
    if(type==='wish'){showOutput('🌙','A wish for Sneha',random(wishes));confetti(24);}
    if(type==='memory'){showOutput('📷','Memory Magic','The memory card is getting some extra sparkle.');$('#photoCard').animate([{transform:'rotate(0) scale(1)'},{transform:'rotate(-2deg) scale(1.04)'},{transform:'rotate(2deg) scale(1.04)'},{transform:'none'}],{duration:1100,iterations:2});scrollToId('memories');confetti(28);}
    if(type==='hunt'){showOutput('💗','Heart Hunt started!','Find all five hearts hidden around the screen.');startHunt();}
    if(type==='fortune'){showOutput('🔮','Birthday Fortune',random(fortunes));}
  }));

  // Wishes reveal.
  const wishObserver=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.18});
  $$('.wish-list article').forEach((el,i)=>{el.style.transitionDelay=`${i*90}ms`;wishObserver.observe(el);});

  // Cake + celebration.
  $('#blow').addEventListener('click',()=>{const sec=$('#cake');sec.classList.add('blown');$('#blow').disabled=true;$('#blow').textContent='🎉 Wish sent!';$('#wishSent').hidden=false;confetti(90);fireworks();toast('Your wish is on its way ✨');setTimeout(()=>scrollToId('finale'),900);});
  function fireworks(){const finale=$('#finale');for(let n=0;n<10;n++){setTimeout(()=>{const x=15+Math.random()*70,y=18+Math.random()*45;for(let i=0;i<18;i++){const s=document.createElement('i');s.className='confetti';s.style.left=x+'%';s.style.top=y+'%';s.style.background=random(['#ff5fa2','#8b6cff','#ffd86b','#fff']);const a=Math.PI*2*i/18,d=60+Math.random()*100;s.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(.3)`,opacity:0}],{duration:900});finale.appendChild(s);setTimeout(()=>s.remove(),1000);}},n*140);}}

  // Modals.
  function openModal(id){const el=$('#'+id);el.classList.add('show');el.setAttribute('aria-hidden','false');}
  function closeModal(id){const el=$('#'+id);el.classList.remove('show');el.setAttribute('aria-hidden','true');}
  $('#secretBtn').addEventListener('click',()=>openModal('letterModal'));
  $$('[data-close="letter"]').forEach(el=>el.addEventListener('click',()=>closeModal('letterModal')));
  $$('[data-close="lightbox"]').forEach(el=>el.addEventListener('click',()=>closeModal('lightbox')));

  // Share.
  $('#shareBtn').addEventListener('click',async()=>{const data={title:'Happy Birthday Sneha 💖',text:'A little birthday surprise for Sneha ✨',url:location.href};try{if(navigator.share){await navigator.share(data);}else{await navigator.clipboard.writeText(location.href);toast('Page link copied 📋');}}catch{toast('Share cancelled');}});

  // Celebrate again.
  $('#again').addEventListener('click',()=>{index=0;refreshGallery();slideshowOn=false;clearInterval(autoTimer);$('#slideshow').textContent='▶ Auto slideshow';$('#slideStatus').textContent='Tap the arrows or swipe';opened=false;$('#giftBox').classList.remove('opened');$('#giftResult').hidden=true;$('#cake').classList.remove('blown');$('#blow').disabled=false;$('#blow').textContent='Blow the candles 🎂';$('#wishSent').hidden=true;closeModal('letterModal');closeModal('lightbox');window.scrollTo({top:0,behavior:'smooth'});toast('Celebration reset 💖');});

  function confetti(count=40){const colors=['#ff5fa2','#8b6cff','#ffd86b','#ffffff'];for(let i=0;i<count;i++){const c=document.createElement('i');c.className='confetti';c.style.left='50%';c.style.top='45%';c.style.background=colors[i%colors.length];const a=Math.random()*Math.PI*2,d=70+Math.random()*260;c.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d+160}px) rotate(${Math.random()*720}deg)`,opacity:0}],{duration:900+Math.random()*900,easing:'cubic-bezier(.2,.75,.25,1)'});document.body.appendChild(c);setTimeout(()=>c.remove(),2100);}}

  // Small finale fireflies.
  const ff=$('#fireflies'); for(let i=0;i<24;i++){const s=document.createElement('i');s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.animationDelay=(Math.random()*4)+'s';s.style.animationDuration=(4+Math.random()*4)+'s';ff.appendChild(s);}

  // Escape closes all overlays.
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal('letterModal');closeModal('lightbox');}});
})();
