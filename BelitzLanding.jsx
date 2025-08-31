import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, ArrowUpRight } from "lucide-react";

// ===== Minimal, self‑contained React file (no TS, no motion) =====
const DEFAULT_CONTENT = {
  heroTitle: "Cutting‑Edge Creative &\nHigh‑Impact Editing",
  heroCopy:
    "Belitzmedia baut dir die Show, die hängen bleibt: kompromissloses Editing, starke Markeninszenierung, schnelles Storytelling.",
  contactEmail: "hello@belitz.media",
  colorPrimary: "#FFD400",
  bg: "#0A0A0A",
  audioDataURL: "",
  audioDryURL: "https://static.wixstatic.com/mp3/87dcf7_5f1422684fd742fdb18491a909df11c7.mp3",
  audioWetURL: "https://static.wixstatic.com/mp3/87dcf7_92cafbf4cd64462bb721fb79c01c31ac.mp3",
  projects: [
    { title: "Mall of Berlin", tag: "Editor", href: "", img: "" },
    { title: "SugarGang", tag: "Cut und Edit", href: "", img: "" },
    { title: "SPD Gütersloh", tag: "Imagefilme & Reels", href: "", img: "" },
    { title: "Nicflex", tag: "Youtube Video Cut und Edit", href: "", img: "" },
    { title: "VegaHappy", tag: "Tutorials, Reels", href: "" },
    { title: "SpyViral", tag: "Musikvideos, Reels", href: "" },
  ],
};

function useContent() {
  const [content, setContent] = useState(() => {
    try {
      const raw = localStorage.getItem("belitzLandingContent");
      const stored = raw ? JSON.parse(raw) : {};
      // Merge with defaults, aber leere Strings überschreiben die festen Audio‑URLs nicht
      const merged = { ...DEFAULT_CONTENT, ...stored };
      if (!stored || !stored.audioDryURL) merged.audioDryURL = DEFAULT_CONTENT.audioDryURL;
      if (!stored || !stored.audioWetURL) merged.audioWetURL = DEFAULT_CONTENT.audioWetURL;
      return merged;
    } catch {
      return DEFAULT_CONTENT;
    }
  });
  useEffect(() => {
    try { localStorage.setItem("belitzLandingContent", JSON.stringify(content)); } catch {}
  }, [content]);
  return { content, setContent };
}

// ===== util: noise buffer for fallback rain =====
function createNoiseBuffer(ctx, seconds = 3.0) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const b = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = 0.98 * last + 0.02 * w; d[i] = (w + last) * 0.5; }
  return b;
}

// ===== pure helper (for tests): compute scroll‑dependent audio params =====
export function computeAudioParams(r){
  r = Math.min(1, Math.max(0, r||0));
  const cutoff = 12000 - r * 11000;     // 12k → ~1k
  const drive  = 1.0 + r * 1.0;         // 1.0 → 2.0
  const bass   = 3 + r * 4;             // +3dB → +7dB (lowshelf)
  const lvl    = (0.98 - r * 0.12) * 0.6; // global 60% scale
  return { cutoff, drive, bass, lvl };
}

// equal-power crossfade helper for tests + engine
export function computeCrossfade(r){
  r = Math.min(1, Math.max(0, r||0));
  const dry = Math.cos((Math.PI/2)*r);
  const wet = Math.sin((Math.PI/2)*r);
  return { dry, wet };
}

export default function BelitzLanding() {
  const { content, setContent } = useContent();
  const [audioOn, setAudioOn] = useState(false);
  
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [audioLevel, setAudioLevel] = useState(0);
  const [analyserNode, setAnalyserNode] = useState(null);
  const audioRef = useRef(null);
  const scrollRef = useRef(null);

  // spotlight bg follows cursor
  useEffect(() => {
    const m = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", m);
    return () => window.removeEventListener("mousemove", m);
  }, []);

  // ===== stronger storm audio with scroll‑reactive tone (no sidechain) =====
  function startStorm() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();

  // master
  const master = ctx.createGain(); master.gain.value = 0.0001; master.connect(ctx.destination);

  // tone/dynamics (no sidechain)
  const preGain = ctx.createGain(); preGain.gain.value = 1.05;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -22; comp.knee.value = 12; comp.ratio.value = 8; comp.attack.value = 0.006; comp.release.value = 0.25;
  const lowshelf = ctx.createBiquadFilter(); lowshelf.type='lowshelf'; lowshelf.frequency.value=120; lowshelf.gain.value=3;
  const lowpass = ctx.createBiquadFilter(); lowpass.type = 'lowpass'; lowpass.frequency.value = 12000; lowpass.Q.value = 0.7; // keep neutral

  // chain: (dry|wet|single|noise) -> preGain -> comp -> lowshelf -> lowpass -> master
  preGain.connect(comp); comp.connect(lowshelf); lowshelf.connect(lowpass); lowpass.connect(master);

  // analyser for visuals
  const analyser = ctx.createAnalyser(); analyser.fftSize = 256; lowpass.connect(analyser);
  setAnalyserNode(analyser);
  const data = new Uint8Array(analyser.frequencyBinCount);
  let raf; const tick = () => { analyser.getByteFrequencyData(data); let sum=0; for (let i=0;i<data.length;i++) sum+=data[i]; setAudioLevel(sum/(data.length*255)); raf=requestAnimationFrame(tick); }; tick();

  // Crossfade nodes
  const dryGain = ctx.createGain(); dryGain.gain.value = 1;
  const wetGain = ctx.createGain(); wetGain.gain.value = 0;

  let elDry=null, elWet=null, elSingle=null, src=null;

  if (content.audioDryURL || content.audioWetURL) {
    if (content.audioDryURL) { elDry = new Audio(content.audioDryURL); elDry.loop = true; elDry.crossOrigin = 'anonymous'; ctx.createMediaElementSource(elDry).connect(dryGain); elDry.play().catch(()=>{}); }
    if (content.audioWetURL) { elWet = new Audio(content.audioWetURL); elWet.loop = true; elWet.crossOrigin = 'anonymous'; ctx.createMediaElementSource(elWet).connect(wetGain); elWet.play().catch(()=>{}); }
    dryGain.connect(preGain); wetGain.connect(preGain);
  } else if (content.audioDataURL) {
    elSingle = new Audio(content.audioDataURL); elSingle.loop = true; elSingle.crossOrigin = 'anonymous';
    ctx.createMediaElementSource(elSingle).connect(preGain); elSingle.play().catch(()=>{});
  } else {
    src = ctx.createBufferSource(); src.buffer = createNoiseBuffer(ctx, 3.0); src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.9;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300;
    const g = ctx.createGain(); g.gain.value = 0.28;
    src.connect(bp).connect(hp).connect(g).connect(preGain); src.start();
  }

  // scroll reactivity — crossfade only
  const apply = () => {
    const maxS = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const r = Math.min(1, Math.max(0, window.scrollY / maxS));
    const x = computeCrossfade(r);
    if (elDry || elWet) {
      dryGain.gain.setTargetAtTime(x.dry, ctx.currentTime, 0.08);
      wetGain.gain.setTargetAtTime(x.wet, ctx.currentTime, 0.08);
    }
  };
  apply(); const onScroll=()=>apply(); window.addEventListener('scroll', onScroll); scrollRef.current = onScroll;

  master.gain.exponentialRampToValueAtTime(0.57, ctx.currentTime + 0.8);
  audioRef.current = { ctx, master, preGain, comp, lowshelf, lowpass, analyser, data, raf, elDry, elWet, elSingle, src, dryGain, wetGain };
  setAudioOn(true);
}

  function stopStorm() {
  const a = audioRef.current; if (!a) return;
  try {
    const t = a.ctx.currentTime; a.master.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    setTimeout(() => {
      if (scrollRef.current) window.removeEventListener('scroll', scrollRef.current);
      if (a.raf) cancelAnimationFrame(a.raf);
      if (a.elDry) { try { a.elDry.pause(); } catch {} }
      if (a.elWet) { try { a.elWet.pause(); } catch {} }
      if (a.elSingle) { try { a.elSingle.pause(); } catch {} }
      a.ctx.close();
      setAnalyserNode(null);
      setAudioLevel(0);
      audioRef.current = null;
      setAudioOn(false);
    }, 350);
  } catch {
    audioRef.current = null;
    setAudioOn(false);
  }
}

  const toggleAudio = () => { if (!audioRef.current) startStorm(); else stopStorm(); };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black text-white" style={{ backgroundColor: content.bg }}>
      <div className="bm-texture" />
      {/* HUD */}
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
        <button onClick={toggleAudio} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs hover:shadow" style={{ borderColor: content.colorPrimary, color: content.colorPrimary }}>
          {audioOn ? <Volume2 size={16}/> : <VolumeX size={16}/>} <span className="uppercase tracking-wider">Storm</span>
        </button>
      </div>

      {/* Spotlight */}
      <div className="pointer-events-none fixed inset-0 z-10" style={{ background: `radial-gradient(520px circle at ${mouse.x}px ${mouse.y}px, rgba(255,212,0,0.18), transparent 60%)`, mixBlendMode: "screen" }} />

      {/* NAV */}
      <nav className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <div className="h-6 w-6 animate-spin-slow rounded-full border-2" style={{ borderColor: `${content.colorPrimary}33`, borderTopColor: content.colorPrimary }} />
          </div>
          <span className="text-lg font-semibold tracking-wide">BELITZMEDIA</span>
        </div>
        <div className="hidden gap-6 text-sm md:flex">
          <a className="opacity-80 transition hover:opacity-100" href="#work">Work</a>
          <a className="opacity-80 transition hover:opacity-100" href="#contact">Contact</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-20 mx-auto max-w-6xl px-6 pb-12">
        <div className="relative mb-8 overflow-hidden rounded-3xl border bg-black/30" style={{borderColor: content.colorPrimary + '55', boxShadow: '0 0 0 1px ' + content.colorPrimary + '22 inset, 0 0 28px ' + content.colorPrimary + '22'}}>
          <div className="absolute left-4 top-4 z-10 rounded-full bg-black/60 px-3 py-1 text-xs" style={{color:content.colorPrimary,border:`1px solid ${content.colorPrimary}55`}}>Interactive Logo</div>
          {/* slow wipe overlay */}
          <div className="bm-wipe-slow" />
          <LogoLite color={content.colorPrimary} text="BELITZMEDIA" level={audioLevel} mouse={mouse}/>
          
        </div>
        <h1 className="whitespace-pre-line text-5xl font-black leading-tight tracking-tight md:text-7xl">{content.heroTitle}</h1>
        <p className="mt-6 max-w-2xl text-white/70">{content.heroCopy}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a href="#work" className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-medium transition hover:scale-[1.02]" style={{ background: content.colorPrimary, color: "#111" }}>
            Showreel ansehen <ArrowUpRight className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={18}/>
          </a>
          <a href={`mailto:${content.contactEmail}`} className="rounded-2xl border px-5 py-3 font-medium text-white/90 transition hover:bg-white/5" style={{ borderColor: content.colorPrimary }}>
            {content.contactEmail}
          </a>
        </div>
      </section>

      {/* WORK */}
      <section id="work" className="relative z-20 mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Selected Work</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(content.projects?.length ? content.projects : DEFAULT_CONTENT.projects).map((p, i) => (
            <ProjectCard key={i} {...p} color={content.colorPrimary} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="relative z-20 mx-auto max-w-6xl px-6 pb-20">
        <div className="flex flex-col justify-between gap-6 rounded-3xl border p-6 md:flex-row md:items-center" style={{ borderColor: content.colorPrimary }}>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">Bereit, aufzudrehen?</h3>
            <p className="mt-2 max-w-xl text-white/70">Ein Call, ein Plan, ein Schnitt – und deine Marke bekommt den Punch.</p>
          </div>
          <a href={`mailto:${content.contactEmail}`} className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-medium transition hover:scale-[1.02]" style={{ background: content.colorPrimary, color: "#111" }}>
            {content.contactEmail} <ArrowUpRight size={18}/>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-white/10 px-6 py-8 text-sm text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Belitzmedia. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-white" href="#">Impressum</a>
            <a className="hover:text-white" href="#">Datenschutz</a>
          </div>
        </div>
      </footer>

      {/* EDITOR */}
      

      {/* styles */}
      <style>{`
        @keyframes spin-slow{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .animate-spin-slow{animation:spin-slow 6s linear infinite}
        @keyframes bm-wipe{0%{transform:translateX(-160%)}100%{transform:translateX(160%)}}
        .bm-wipe-slow{position:absolute;inset:-25%;background:linear-gradient(80deg, transparent 35%, rgba(255,255,255,.38) 50%, transparent 65%);filter:blur(24px);pointer-events:none;animation:bm-wipe 8s ease-in-out infinite}
        .bm-card{position:relative}
        .bm-card-sweep{position:absolute;inset:-20%;background:linear-gradient(75deg, transparent 45%, rgba(255,255,255,.28) 50%, transparent 55%);filter:blur(10px);transform:translateX(-120%);pointer-events:none}
        .bm-card:hover .bm-card-sweep{animation:bm-wipe 2.6s ease-in-out infinite}
        /* Dark texture background */
        .bm-texture{position:fixed;inset:0;z-index:0;opacity:.9;pointer-events:none;background:
          radial-gradient(1200px 800px at 80% -10%, rgba(255,255,255,.03), transparent 60%),
          radial-gradient(900px 600px at -10% 110%, rgba(255,255,255,.02), transparent 60%),
          repeating-linear-gradient(0deg, rgba(255,255,255,.02), rgba(255,255,255,.02) 1px, transparent 1px, transparent 3px),
          radial-gradient(1200px 1200px at 50% 50%, rgba(255,255,255,.02), transparent 60%);
        }
      `}</style>
    </div>
  );
}

// ===== Simple 3D-ish Logo (mouse shadow + big halo) =====
function LogoLite({ color, text, level, mouse }){
  const box = useRef(null);
  const [rot, setRot] = useState({x:0,y:0});
  const [zoom, setZoom] = useState(1);
  const [shadow, setShadow] = useState({dx:0,dy:10,blur:36});
  const move = (e)=>{ const el = box.current; if(!el) return; const r = el.getBoundingClientRect(); const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height; setRot({x:(0.5-py)*14,y:(px-0.5)*20}); };
  useEffect(()=>{ const onScroll=()=>{ const y=window.scrollY||0; setZoom(1+Math.min(y/1400,0.06)); }; onScroll(); window.addEventListener('scroll',onScroll); return ()=>window.removeEventListener('scroll',onScroll); },[]);
  useEffect(()=>{ if(!box.current || !mouse) return; const r=box.current.getBoundingClientRect(); const cx=r.left+r.width/2, cy=r.top+r.height/2; const dx=(cx-mouse.x)/18, dy=(cy-mouse.y)/18; const blur=28+Math.min(80, Math.hypot(dx,dy)*2.2); setShadow({dx,dy,blur}); },[mouse]);
  const left = (text||'BELITZMEDIA').slice(0,6), right=(text||'BELITZMEDIA').slice(6);
  // Audio-reactive glow
  // Audio-reactive glow (smoothed & thresholded)
  const reactRef = useRef(0);
  const [react, setReact] = useState(0);
  useEffect(()=>{
    const lv = Math.max(0, Math.min(1, level || 0));
    const target = Math.max(0, (lv - 0.18) / 0.55); // floor + compression
    const sm = reactRef.current + (target - reactRef.current) * 0.12;
    reactRef.current = sm; setReact(sm);
  }, [level]);
  const haloA = 0.10 + 0.18 * react;
  const glowNear = 0.18 + 0.42 * react;
  const glowFar  = 0.10 + 0.32 * react;
  return (
    <div ref={box} onMouseMove={move} onMouseLeave={()=>setRot({x:0,y:0})} className="relative h-[400px] w-full select-none" style={{perspective:'1000px'}}>
      {/* big halo */}
      <div className="pointer-events-none absolute -inset-12" style={{background:`radial-gradient(45% 35% at 50% 55%, rgba(255,255,255,${haloA}), transparent 70%)`, filter:'blur(35px)'}}/>
      <div className="absolute inset-0 grid place-items-center will-change-transform" style={{transform:`rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${zoom})`, transformStyle:'preserve-3d', transition:'transform 160ms ease'}}>
        <div className="relative" style={{transform:'translateZ(40px)', filter:`drop-shadow(${shadow.dx}px ${shadow.dy}px ${shadow.blur}px rgba(0,0,0,0.6))`}}>
          {Array.from({length:8}).map((_,i)=> (
            <div key={i} className="absolute inset-0 select-none" aria-hidden style={{transform:`translateZ(${(i-7)*3}px)`, filter:`blur(${(7-i)*0.5}px)`, opacity:0.06+(i*0.035)}}>
              <div className="text-6xl md:text-8xl tracking-tight" style={{color:'#fff', fontWeight:900, textShadow:'0 2px 0 #000, 0 10px 24px rgba(0,0,0,0.65)'}}>
                <span style={{fontWeight:300, letterSpacing:'0.06em'}}>{left}</span>
                <span style={{fontWeight:900}}>{right}</span>
              </div>
            </div>
          ))}
          <div className="relative">
            <div className="text-6xl md:text-8xl tracking-tight" style={{color:'#fff', textShadow:`0 1px 0 #000, 0 2px 0 #000, 0 14px 30px rgba(0,0,0,0.7), 0 0 90px rgba(255,255,255,${glowNear}), 0 0 180px rgba(255,255,255,${glowFar})`}}>
              <span style={{fontWeight:300, letterSpacing:'0.06em'}}>{left}</span>
              <span style={{fontWeight:900}}>{right}</span>
            </div>
          </div>
          <div className="absolute left-1/2 top-full h-6 w-[60%] -translate-x-1/2 -translate-y-2 rounded-full opacity-60 blur-md" style={{background:'radial-gradient(60% 120% at 50% 0%, rgba(0,0,0,0.55), transparent 70%)'}}/>
        </div>
      </div>
    </div>
  );
}

// ===== Project Card (parallax zoom + glow icon) =====
function ProjectCard({ title, tag, img, href, color }){
  const ref = useRef(null);
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({x:0,y:0});
  const [shift, setShift] = useState({x:0,y:0});
  const move = (e)=>{ const el = ref.current; if(!el) return; const r = el.getBoundingClientRect(); const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height; setTilt({x:(0.5-py)*8,y:(px-0.5)*10}); setShift({x:(px-0.5)*16,y:(py-0.5)*-16}); };
  return (
    <a href={href||"#"} target={href?"_blank":undefined} rel={href?"noopener noreferrer":undefined}
       className="bm-card group relative block overflow-hidden rounded-2xl border bg-black/30" ref={ref} style={{borderColor: color + '55', boxShadow: '0 0 0 1px ' + color + '22 inset, 0 0 18px ' + color + '22'}}
       onMouseEnter={()=>setHover(true)} onMouseLeave={()=>{setHover(false);setTilt({x:0,y:0});setShift({x:0,y:0});}} onMouseMove={move}>
      <div className="bm-card-sweep" />
      <div className="aspect-[4/3] w-full will-change-transform" style={{transform:`rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hover?1.045:1})`,transition:"transform 180ms ease"}}>
        {img? <img src={img} alt={title} className="h-full w-full object-cover" style={{transform:`translate3d(${shift.x}px,${shift.y}px,0) scale(${hover?1.08:1})`,transition:"transform 240ms ease"}}/>
             : <div className="h-full w-full" style={{background:`linear-gradient(135deg, ${color}22, rgba(255,255,255,.06) 50%, #000 100%)`,transform:`translate3d(${shift.x}px,${shift.y}px,0) scale(${hover?1.05:1})`,transition:"transform 240ms ease"}}/>}
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-4 transition">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm" style={{color}}>{tag}</div>
            <div className="text-lg font-semibold">{title}</div>
          </div>
          <div className="rounded-full border p-2 opacity-0 transition group-hover:opacity-100" style={{borderColor:color,color,boxShadow:hover?`0 0 0 2px ${color}44,0 0 18px ${color}66,inset 0 0 8px ${color}55`:'none',background:hover?`${color}1a`:'transparent',transform:hover?"scale(1.06)":"scale(1)"}}>
            <ArrowUpRight size={18}/>
          </div>
        </div>
      </div>
    </a>
  );
}

// ===== Editor (compact) =====
function EditorPanel({ content, setContent }){
  const set = (patch)=> setContent({ ...content, ...patch });
  const onAudio = (e)=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>set({ audioDataURL:r.result }); r.readAsDataURL(f); };
  const onAudioDry = (e)=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>set({ audioDryURL:r.result }); r.readAsDataURL(f); };
  const onAudioWet = (e)=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>set({ audioWetURL:r.result }); r.readAsDataURL(f); };
  const onImg = (i,e)=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ const list=[...(content.projects||[])]; list[i]={...list[i], img:r.result}; set({ projects:list }); }; r.readAsDataURL(f); };
  const upd = (i,patch)=>{ const list=[...(content.projects||[])]; list[i]={...list[i],...patch}; set({ projects:list }); };

  return (
    <div className="fixed right-4 top-16 z-50 w-[360px] max-w-[92vw] rounded-2xl border border-white/15 bg-black/70 p-4 backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">Editor</div>
        <div className="flex gap-2">
          <button onClick={()=>{ localStorage.removeItem('belitzLandingContent'); setContent({ ...DEFAULT_CONTENT }); }} className="rounded-md border border-white/15 px-2 py-1 text-xs hover:bg-white/5">Reset</button>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <label className="mb-1 block opacity-80">Primärfarbe</label>
          <input type="color" value={content.colorPrimary} onChange={(e)=>set({ colorPrimary:e.target.value })} className="h-9 w-full rounded-md border border-white/20 bg-black/40"/>
        </div>
        <div>
          <label className="mb-1 block opacity-80">Hintergrund</label>
          <input type="color" value={content.bg} onChange={(e)=>set({ bg:e.target.value })} className="h-9 w-full rounded-md border border-white/20 bg-black/40"/>
        </div>
        <div>
          <label className="mb-1 block opacity-80">Hero Titel</label>
          <textarea value={content.heroTitle} onChange={(e)=>set({ heroTitle:e.target.value })} className="h-20 w-full rounded-md border border-white/20 bg-black/40 p-2"/>
        </div>
        <div>
          <label className="mb-1 block opacity-80">Hero Copy</label>
          <textarea value={content.heroCopy} onChange={(e)=>set({ heroCopy:e.target.value })} className="h-20 w-full rounded-md border border-white/20 bg-black/40 p-2"/>
        </div>
        <div>
          <label className="mb-1 block opacity-80">Kontakt‑E‑Mail</label>
          <input type="email" value={content.contactEmail} onChange={(e)=>set({ contactEmail:e.target.value })} className="h-9 w-full rounded-md border border-white/20 bg-black/40 p-2"/>
        </div>

        <div className="mt-2 rounded-lg border border-white/15 p-3">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-yellow-300/90">Audio</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/5">
                Dry (ohne FX)
                <input type="file" accept="audio/*" className="hidden" onChange={onAudioDry}/>
              </label>
              {content.audioDryURL && <button onClick={()=>set({ audioDryURL:"" })} className="rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/5">Entfernen</button>}
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/5">
                Wet (mit FX)
                <input type="file" accept="audio/*" className="hidden" onChange={onAudioWet}/>
              </label>
              {content.audioWetURL && <button onClick={()=>set({ audioWetURL:"" })} className="rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/5">Entfernen</button>}
            </div>
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/5">
                (Alt) Einzeldatei
                <input type="file" accept="audio/*" className="hidden" onChange={onAudio}/>
              </label>
              {content.audioDataURL && <button onClick={()=>set({ audioDataURL:"" })} className="rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/5">Entfernen</button>}
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-white/15 p-3">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-yellow-300/90">Selected Work</div>
          {(content.projects||[]).map((p,i)=> (
            <div key={i} className="mb-3 rounded-md border border-white/10 p-2">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <input placeholder="Titel" value={p.title||""} onChange={(e)=>upd(i,{ title:e.target.value })} className="h-9 flex-1 rounded-md border border-white/20 bg-black/40 p-2"/>
                  <input placeholder="Tag" value={p.tag||""} onChange={(e)=>upd(i,{ tag:e.target.value })} className="h-9 w-40 rounded-md border border-white/20 bg-black/40 p-2"/>
                </div>
                <div className="flex items-center gap-2">
                  <input placeholder="Link (https://...)" value={p.href||""} onChange={(e)=>upd(i,{ href:e.target.value })} className="h-9 flex-1 rounded-md border border-white/20 bg-black/40 p-2"/>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/5">
                    Bild
                    <input type="file" accept="image/*" className="hidden" onChange={(e)=>onImg(i,e)}/>
                  </label>
                </div>
                {p.img && <img src={p.img} alt="Preview" className="mt-1 h-24 w-full rounded object-cover"/>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== Development Smoke Tests ===== =====
   These tests run once in the browser and validate the pure helper used
   by the audio engine. They ensure numeric stability and expected ranges. */
(function runDevTests(){
  try{
    if (typeof window === 'undefined' || window.__BELITZ_TESTS__) return;
    window.__BELITZ_TESTS__ = true;
    const eps = 1e-6;
    // r=0 (top of page)
    let p = computeAudioParams(0);
    console.assert(Math.abs(p.cutoff - 12000) < eps, 'cutoff @r=0 should be 12000');
    console.assert(Math.abs(p.drive  - 1.0)   < eps, 'drive @r=0 should be 1.0');
    console.assert(Math.abs(p.bass   - 3.0)   < eps, 'bass  @r=0 should be +3dB');
    console.assert(p.lvl > 0 && p.lvl < 1, 'lvl @r=0 in (0,1)');
    // r=1 (bottom of page)
    p = computeAudioParams(1);
    console.assert(Math.abs(p.cutoff - 1000) < 1, 'cutoff @r=1 ≈ 1000Hz');
    console.assert(Math.abs(p.drive  - 2.0)   < eps, 'drive @r=1 should be 2.0');
    console.assert(Math.abs(p.bass   - 7.0)   < eps, 'bass  @r=1 should be +7dB');
    console.assert(p.lvl > 0 && p.lvl < 1, 'lvl @r=1 in (0,1)');
    // crossfade tests (equal-power)
    let x = computeCrossfade(0); console.assert(Math.abs(x.dry-1) < 1e-6 && Math.abs(x.wet-0) < 1e-6, 'xfade r=0: dry=1 wet=0');
    x = computeCrossfade(1); console.assert(Math.abs(x.dry-0) < 1e-6 && Math.abs(x.wet-1) < 1e-6, 'xfade r=1: dry=0 wet=1');
    x = computeCrossfade(0.5); console.assert(Math.abs(x.dry - Math.SQRT1_2) < 1e-6 && Math.abs(x.wet - Math.SQRT1_2) < 1e-6, 'xfade r=0.5: equal-power');

    // edge clamping
    p = computeAudioParams(-5); console.assert(p.cutoff === 12000, 'clamp r<0');
    p = computeAudioParams(5);  console.assert(Math.abs(p.cutoff-1000)<1, 'clamp r>1');
    console.log('%cBelitz dev tests passed', 'color:#0f0');
  }catch(err){ console.warn('Belitz dev tests failed:', err); }
})();
