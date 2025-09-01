<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BELITZMEDIA – Landing</title>
  <style>
    :root{
      --bg:#0A0A0A;
      --text:#ffffff;
      --muted:rgba(255,255,255,.7);
      --border:rgba(255,255,255,.12);
      --primary:#FFD400;
      --p:255,212,0; /* rgb of --primary */
    }
    *,*:before,*:after{box-sizing:border-box}
    html,body{height:100%}
    body{
      margin:0; background:var(--bg); color:var(--text);
      font:400 16px/1.5 system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
      -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
    }
    a{color:inherit; text-decoration:none}
    .container{max-width:1120px; margin:0 auto; padding:0 24px}
    /* texture */
    .texture{position:fixed; inset:0; pointer-events:none; opacity:.9; z-index:0;
      background:
        radial-gradient(1200px 800px at 80% -10%, rgba(255,255,255,.03), transparent 60%),
        radial-gradient(900px 600px at -10% 110%, rgba(255,255,255,.02), transparent 60%),
        repeating-linear-gradient(0deg, rgba(255,255,255,.02), rgba(255,255,255,.02) 1px, transparent 1px, transparent 3px),
        radial-gradient(1200px 1200px at 50% 50%, rgba(255,255,255,.02), transparent 60%);
    }
    /* spotlight */
    .spot{position:fixed; inset:0; z-index:1; pointer-events:none; mix-blend-mode:screen}
    /* header */
    .nav{position:relative; z-index:2; padding:16px 0}
    .nav-row{display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap}
    .brand{display:flex; align-items:center; gap:10px}
    .brand-spin{height:36px; width:36px; display:grid; place-items:center; overflow:hidden; border:1px solid var(--border); border-radius:12px; background:rgba(0,0,0,.4)}
    .spin{height:24px; width:24px; border:2px solid rgba(var(--p), .2); border-top-color:var(--primary); border-radius:999px; animation:spin 6s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .links{display:flex; align-items:center; gap:18px; flex-wrap:wrap}
    .nav a.link{opacity:.8} .nav a.link:hover{opacity:1}
    .btn{display:inline-flex; align-items:center; gap:8px; border:1px solid var(--primary); color:var(--primary); background:transparent; padding:8px 12px; border-radius:999px; font-size:12px; cursor:pointer}
    .badge{display:inline-flex; align-items:center; border:1px solid var(--primary); padding:2px 8px; border-radius:999px; font:700 10px/1.6 system-ui; letter-spacing:.08em}
    .badge.on{background:var(--primary); color:#111}
    .range{height:6px; width:120px}
    .range input{width:100%}
    @media (max-width:768px){ .range{width:84px} }
    /* hero */
    .hero{position:relative; z-index:2; padding:0 0 48px 0}
    .panel{overflow:hidden; border:1px solid rgba(var(--p), .3); border-radius:24px; background:rgba(0,0,0,.3); box-shadow:inset 0 0 0 1px rgba(var(--p), .15), 0 0 28px rgba(var(--p), .20)}
    .panel .video-wrap{position:relative; height:400px}
    .panel video{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transform:scale(1.02); transition:transform .7s cubic-bezier(.22,1,.36,1)}
    .panel.zoom video{transform:scale(1.35)}
    .panel .vignette{position:absolute; inset:0; pointer-events:none; background:radial-gradient(110% 80% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,.15) 60%, rgba(0,0,0,.35) 100%)}
    .panel .glow{position:absolute; inset:0; pointer-events:none; transition:box-shadow .5s}
    .panel:hover .glow{box-shadow:inset 0 0 0 2px rgba(var(--p), .4), 0 0 28px rgba(var(--p), .35)}
    .h1{font-weight:900; letter-spacing:-.02em; margin:24px 0 0; font-size:42px; line-height:1.1}
    @media (min-width:900px){ .h1{font-size:64px} }
    .muted{color:var(--muted)}
    .cta{display:flex; gap:12px; flex-wrap:wrap; margin-top:24px}
    .primary{background:var(--primary); color:#111; border-radius:16px; padding:12px 20px; display:inline-flex; align-items:center; gap:8px; font-weight:600}
    .ghost{border:1px solid var(--primary); border-radius:16px; padding:12px 20px}
    /* grid */
    .work{padding:0 0 72px}
    .grid{display:grid; gap:16px}
    @media (min-width:720px){ .grid{grid-template-columns:repeat(2,1fr)} }
    @media (min-width:1024px){ .grid{grid-template-columns:repeat(3,1fr)} }
    .card{position:relative; overflow:hidden; border:1px solid rgba(var(--p), .3); border-radius:18px; background:rgba(0,0,0,.3); box-shadow:inset 0 0 0 1px rgba(var(--p), .15), 0 0 18px rgba(var(--p), .20)}
    .card-media{aspect-ratio:4/3; background:linear-gradient(135deg, rgba(var(--p), .15), rgba(255,255,255,.06) 50%, #000 100%)}
    .card h3{margin:8px 0 0; font-size:18px}
    .card .tag{font-size:13px; color:var(--primary)}
    .card .body{position:absolute; inset:0; display:flex; flex-direction:column; justify-content:end; padding:12px}
    /* footer */
    .footer{border-top:1px solid var(--border); color:rgba(255,255,255,.7); padding:24px 0; font-size:14px}
    /* modal */
    .modal{position:fixed; inset:0; z-index:60; display:none}
    .modal.open{display:block}
    .backdrop{position:absolute; inset:0; background:rgba(0,0,0,.7); backdrop-filter:blur(3px); opacity:0; transition:opacity .3s}
    .modal.open .backdrop{opacity:1}
    .sheet{position:absolute; left:50%; top:8vh; transform:translate(-50%, 0); width:92vw; max-width:1100px; border:1px solid rgba(var(--p), .4); background:rgba(0,0,0,.8); border-radius:22px; overflow:hidden; box-shadow:0 20px 80px rgba(0,0,0,.6)}
    .sheet-inner{display:grid; gap:16px; padding:16px}
    @media(min-width:900px){ .sheet-inner{grid-template-columns:3fr 2fr} }
    .thumbs{display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:12px}
    .aspect-video{aspect-ratio:16/9}
    .aspect-4-3{aspect-ratio:4/3}
    .btn-close{border:1px solid var(--primary); color:var(--primary); background:transparent; padding:10px 14px; border-radius:12px; cursor:pointer}
    .hidden{display:none}
  </style>
</head>
<body>
  <div class="texture"></div>
  <div class="spot" id="spot"></div>

  <header class="nav">
    <div class="container nav-row">
      <div class="brand">
        <div class="brand-spin"><div class="spin"></div></div>
        <div style="font-weight:700; letter-spacing:.02em">BELITZMEDIA</div>
      </div>
      <div class="links">
        <a class="link" href="#work">Work</a>
        <a class="link" href="#contact">Contact</a>
        <button id="btnStorm" class="btn">
          <svg id="icoVol" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9v6h4l5 4V5l-5 4H6z"/></svg>
          <span style="letter-spacing:.08em;text-transform:uppercase">Storm</span>
        </button>
        <span id="badge" class="badge">OFF</span>
        <div class="range"><input id="volume" type="range" min="0" max="100" value="60"></div>
      </div>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <div id="heroPanel" class="panel">
          <div class="video-wrap" id="heroVideoWrap">
            <video id="heroVideo" autoplay muted playsinline loop preload="metadata"
              src="https://video.wixstatic.com/video/87dcf7_97cef957558045dd8f28a3295cdc443c/1080p/mp4/file.mp4"></video>
            <div class="vignette"></div>
            <div class="glow"></div>
          </div>
        </div>
        <h1 class="h1">Cutting‑Edge Creative &<br>High‑Impact Editing</h1>
        <p class="muted" style="max-width:680px">Belitzmedia baut dir die Show, die hängen bleibt: kompromissloses Editing, starke Markeninszenierung, schnelles Storytelling.</p>
        <div class="cta">
          <a href="#work" class="primary">Showreel ansehen
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111"><path d="M7 17L17 7M8 7h9v9"/></svg>
          </a>
          <a id="contact" href="mailto:hello@belitz.media" class="ghost">hello@belitz.media</a>
        </div>
      </div>
    </section>

    <section id="work" class="work">
      <div class="container">
        <h2 style="font-size:28px; margin:0 0 16px; font-weight:700">Selected Work</h2>
        <div class="grid">
          <!-- Mall of Berlin (modal trigger) -->
          <a href="#" class="card" data-project="mall">
            <div class="card-media"></div>
            <div class="body">
              <div class="tag">Editor</div>
              <h3>Mall of Berlin</h3>
            </div>
          </a>
          <a href="#" class="card"><div class="card-media"></div><div class="body"><div class="tag">Cut und Edit</div><h3>SugarGang</h3></div></a>
          <a href="#" class="card"><div class="card-media"></div><div class="body"><div class="tag">Imagefilme & Reels</div><h3>SPD Gütersloh</h3></div></a>
          <a href="#" class="card"><div class="card-media"></div><div class="body"><div class="tag">Youtube Video Cut und Edit</div><h3>Nicflex</h3></div></a>
          <a href="#" class="card"><div class="card-media"></div><div class="body"><div class="tag">Tutorials, Reels</div><h3>VegaHappy</h3></div></a>
          <a href="#" class="card"><div class="card-media"></div><div class="body"><div class="tag">Musikvideos, Reels</div><h3>SpyViral</h3></div></a>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container" style="display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap">
      <div>© <span id="year"></span> Belitzmedia. All rights reserved.</div>
      <div style="display:flex; gap:16px">
        <a href="#">Impressum</a>
        <a href="#">Datenschutz</a>
      </div>
    </div>
  </footer>

  <!-- Modal -->
  <div id="modal" class="modal" aria-hidden="true">
    <div class="backdrop" id="backdrop"></div>
    <div class="sheet" id="sheet">
      <div class="sheet-inner">
        <div>
          <div class="aspect-video" style="overflow:hidden; border:1px solid var(--border); border-radius:12px; background:rgba(0,0,0,.4)">
            <img id="imgBig" src="" alt="Mall of Berlin – groß" style="width:100%; height:100%; object-fit:cover">
          </div>
          <div class="thumbs">
            <div class="aspect-4-3" style="overflow:hidden; border:1px solid var(--border); border-radius:10px; background:rgba(0,0,0,.4)"><img id="img1" src="" alt="" style="width:100%; height:100%; object-fit:cover"></div>
            <div class="aspect-4-3" style="overflow:hidden; border:1px solid var(--border); border-radius:10px; background:rgba(0,0,0,.4)"><img id="img2" src="" alt="" style="width:100%; height:100%; object-fit:cover"></div>
            <div class="aspect-4-3" style="overflow:hidden; border:1px solid var(--border); border-radius:10px; background:rgba(0,0,0,.4)"><img id="img3" src="" alt="" style="width:100%; height:100%; object-fit:cover"></div>
          </div>
        </div>
        <div>
          <div style="color:var(--primary); font-size:14px; margin-bottom:6px">Editor</div>
          <h3 style="margin:0 0 10px; font-size:22px">Mall of Berlin</h3>
          <p class="muted" style="font-size:14px">
            Hochverdichteter Social‑Cut für Retail. Rhythmische Montagen, schnelle Transitions, harte Impacts – optimiert
            für 9:16 &amp; 1:1. Color‑Grading im Black/Yellow Look, Sounddesign mit Weather‑Atmos und Punch‑Impacts.
          </p>
          <ul class="muted" style="font-size:14px; margin:12px 0 0 18px">
            <li>Format: 9:16, 1:1, 16:9</li>
            <li>Leistungen: Schnitt, Sounddesign, Grading, Titel</li>
            <li>Tools: Premiere Pro, After Effects</li>
          </ul>
          <div style="display:flex; gap:10px; margin-top:16px">
            <button id="btnClose" class="btn-close">Schließen</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Audio elements (no autoplay) -->
  <audio id="dry" src="https://static.wixstatic.com/mp3/87dcf7_5f1422684fd742fdb18491a909df11c7.mp3" preload="none" loop crossorigin="anonymous"></audio>
  <audio id="wet" src="https://static.wixstatic.com/mp3/87dcf7_92cafbf4cd64462bb721fb79c01c31ac.mp3" preload="none" loop crossorigin="anonymous"></audio>

  <script>
    const yearEl = document.getElementById('year'); yearEl.textContent = new Date().getFullYear();

    // Spotlight follows cursor
    const spot = document.getElementById('spot');
    window.addEventListener('mousemove', (e)=>{
      spot.style.background = `radial-gradient(520px circle at ${e.clientX}px ${e.clientY}px, rgba(255,212,0,0.18), transparent 60%)`;
    }, {passive:true});

    // Hero zoom on hover/tap
    const heroPanel = document.getElementById('heroPanel');
    const heroWrap = document.getElementById('heroVideoWrap');
    heroWrap.addEventListener('mouseenter', ()=>heroPanel.classList.add('zoom'));
    heroWrap.addEventListener('mouseleave', ()=>heroPanel.classList.remove('zoom'));
    heroWrap.addEventListener('touchstart', ()=>{
      heroPanel.classList.add('zoom');
      setTimeout(()=>heroPanel.classList.remove('zoom'), 1200);
    }, {passive:true});

    // Audio logic (no WebAudio, simple media elements)
    const btnStorm = document.getElementById('btnStorm');
    const badge = document.getElementById('badge');
    const vol = document.getElementById('volume');
    const dry = document.getElementById('dry');
    const wet = document.getElementById('wet');
    let master = 0.6;
    let audioOn = false;

    function eqPower(r){ r=Math.min(1,Math.max(0,r)); return { dry: Math.cos((Math.PI/2)*r), wet: Math.sin((Math.PI/2)*r) }; }
    function applyVolumes(){
      const maxS = Math.max(1, document.body.scrollHeight - innerHeight);
      const r = Math.min(1, Math.max(0, scrollY / maxS));
      const x = eqPower(r);
      dry.volume = Math.max(0, Math.min(1, x.dry * master));
      wet.volume = Math.max(0, Math.min(1, x.wet * master));
    }
    let rafScroll = 0;
    function onScroll(){ if (rafScroll) return; rafScroll = requestAnimationFrame(()=>{ rafScroll = 0; applyVolumes(); }); }
    window.addEventListener('scroll', onScroll, {passive:true});

    vol.addEventListener('input', (e)=>{ master = Math.max(0, Math.min(1, (e.target.value|0)/100 )); applyVolumes(); });

    async function startAudio(){
      try{
        await Promise.all([ dry.play().catch(()=>{}), wet.play().catch(()=>{}) ]);
      }catch(e){ /* ignore */ }
      audioOn = true; badge.textContent = 'ON'; badge.classList.add('on');
      applyVolumes();
    }
    function stopAudio(){
      dry.pause(); wet.pause();
      audioOn = false; badge.textContent = 'OFF'; badge.classList.remove('on');
    }
    btnStorm.addEventListener('click', ()=> audioOn ? stopAudio() : startAudio());

    // Modal (Mall of Berlin) with FLIP — keep centered by always including translate(-50%,0)
    const modal = document.getElementById('modal');
    const sheet = document.getElementById('sheet');
    const backdrop = document.getElementById('backdrop');
    const btnClose = document.getElementById('btnClose');

    // Placeholder images (replace with your own if you like)
    const imgBig = document.getElementById('imgBig');
    const img1 = document.getElementById('img1');
    const img2 = document.getElementById('img2');
    const img3 = document.getElementById('img3');
    const placeholders = [
      'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496307639047-41a84b299059?q=80&w=1200&auto=format&fit=crop'
    ];
    function setImages(arr){
      imgBig.src = arr[0] || ''; img1.src = arr[1] || ''; img2.src = arr[2] || ''; img3.src = arr[3] || '';
    }
    setImages(placeholders);

    function openModalFrom(card){
      const r0 = card.getBoundingClientRect();
      modal.classList.add('open');
      document.documentElement.style.overflow='hidden';
      sheet.style.willChange = 'transform';
      // ensure base centering is preserved
      sheet.style.transformOrigin = 'top left';
      // measure end rect after modal open
      const r1 = sheet.getBoundingClientRect();
      const sx = Math.max(.01, r0.width / Math.max(1, r1.width));
      const sy = Math.max(.01, r0.height / Math.max(1, r1.height));
      const dx = r0.left - r1.left;
      const dy = r0.top - r1.top;
      // Start from card -> to centered sheet
      sheet.style.transition = 'transform 560ms cubic-bezier(.22,1,.36,1)';
      sheet.style.transform = `translate(-50%, 0) translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      requestAnimationFrame(()=>{ sheet.style.transform = 'translate(-50%, 0) translate(0,0) scale(1,1)'; });
    }
    function closeModal(){
      const trigger = document.querySelector('.card[data-project="mall"]');
      if (trigger){
        const r0 = trigger.getBoundingClientRect();
        const r1 = sheet.getBoundingClientRect();
        const sx = Math.max(.01, r0.width / Math.max(1, r1.width));
        const sy = Math.max(.01, r0.height / Math.max(1, r1.height));
        const dx = r0.left - r1.left;
        const dy = r0.top - r1.top;
        sheet.style.transform = `translate(-50%, 0) translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
        sheet.addEventListener('transitionend', handleEnd, {once:true});
      }else{
        handleEnd();
      }
      function handleEnd(){
        modal.classList.remove('open');
        sheet.style.transform='translate(-50%, 0)'; sheet.style.transition=''; sheet.style.willChange='';
        document.documentElement.style.overflow='';
      }
    }
    document.querySelector('.card[data-project="mall"]').addEventListener('click', (e)=>{ e.preventDefault(); openModalFrom(e.currentTarget); });
    backdrop.addEventListener('click', closeModal);
    btnClose.addEventListener('click', closeModal);

  </script>
</body>
</html>
