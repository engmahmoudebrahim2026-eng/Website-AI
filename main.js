// ── NAVBAR SCROLL ──
const nav = document.getElementById('nexusNav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ── ACTIVE NAV LINK ──
const pg = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(a => {
  if (a.getAttribute('href') === pg) a.classList.add('active');
});

// ── HERO CANVAS ──
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = canvas.offsetWidth || innerWidth; canvas.height = canvas.offsetHeight || innerHeight }
  resize(); window.addEventListener('resize', resize);
  const pts = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
    r: Math.random() * 1.4 + .3, a: Math.random() * .4 + .1
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
        if (d < 155) { ctx.beginPath(); ctx.strokeStyle = `rgba(37,99,235,${.07 * (1 - d / 155)})`; ctx.lineWidth = .6; ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke() }
      }
      const p = pts[i];
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(37,99,235,${p.a})`; ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ── SCROLL ANIMATIONS ──
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show') });
}, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.aup,.aleft,.aright').forEach(el => obs.observe(el));

// ── COUNTER ANIMATION ──
function counter(el, target, dur = 2000) {
  const s = Date.now();
  const run = () => {
    const t = Math.min((Date.now() - s) / dur, 1);
    const e = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * e).toLocaleString() + (el.dataset.sfx || '');
    if (t < 1) requestAnimationFrame(run);
  }; run();
}
const cobs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.done) {
      e.target.dataset.done = 1;
      counter(e.target, +e.target.dataset.val);
    }
  });
}, { threshold: .5 });
document.querySelectorAll('[data-val]').forEach(el => cobs.observe(el));

// ── SKILL BARS ──
const skobs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(b => b.style.width = b.dataset.w || '0%');
    }
  });
}, { threshold: .3 });
document.querySelectorAll('.skill-wrap').forEach(el => skobs.observe(el));

// ── QUIZ ──
const QS = [
  { q: "Who coined the term 'Artificial Intelligence' at Dartmouth 1956?", o: ["Alan Turing", "John McCarthy", "Geoffrey Hinton", "Norbert Wiener"], a: 1, exp: "John McCarthy organized the Dartmouth Conference and coined 'AI'." },
  { q: "The Turing Test (1950) was proposed by which scientist?", o: ["John McCarthy", "Claude Shannon", "Alan Turing", "Marvin Minsky"], a: 2, exp: "Alan Turing published 'Computing Machinery and Intelligence' in 1950." },
  { q: "Which architecture powers ChatGPT, Claude, and modern LLMs?", o: ["Recurrent Neural Network", "CNN", "Transformer", "LSTM"], a: 2, exp: "The Transformer (Google, 2017) — 'Attention Is All You Need'." },
  { q: "AlphaFold solved the 50-year protein folding problem. Who built it?", o: ["OpenAI", "Meta", "Google DeepMind", "Microsoft"], a: 2, exp: "DeepMind's AlphaFold — creators won Nobel Prize in Chemistry 2024." },
  { q: "What % of US stock market trades are AI/algorithm driven?", o: ["20%", "40%", "60%", "70%+"], a: 3, exp: "Over 70% of US trades execute via AI algorithms in microseconds." },
  { q: "The First AI Winter (1974) was triggered mainly by:", o: ["Lack of good data", "Insufficient compute & broken promises", "A major AI safety incident", "Government bans"], a: 1, exp: "Limited compute power and overpromised results caused funding to collapse." },
  { q: "IBM's Deep Blue defeated chess World Champion Garry Kasparov in:", o: ["1993", "1997", "2001", "2005"], a: 1, exp: "Deep Blue defeated Kasparov 3.5-2.5 in May 1997 — historic milestone." },
  { q: "How quickly did ChatGPT reach 100 million users after launch?", o: ["6 months", "1 year", "2 months", "3 weeks"], a: 2, exp: "ChatGPT: 1M users in 5 days, 100M in 2 months — fastest ever." },
  { q: "What is AI 'hallucination'?", o: ["AI overheating", "Generating false info confidently", "AI refusing to answer", "Slow response time"], a: 1, exp: "Hallucination = AI confidently outputs plausible but factually wrong content." },
  { q: "AGI (Artificial General Intelligence) refers to:", o: ["Narrow task AI", "AI that matches human ability in any domain", "Super AI beyond humans", "Autonomous robots"], a: 1, exp: "AGI can perform any intellectual task a human can — doesn't exist yet." }
];

let qi = 0, sc = 0, ans = false;

function initQuiz() {
  qi = 0; sc = 0; ans = false;
  const c = document.getElementById('qContent');
  const r = document.getElementById('qResult');
  if (c) c.style.display = 'block';
  if (r) r.style.display = 'none';
  renderQ();
}
function renderQ() {
  ans = false;
  const q = QS[qi];
  const qEl = document.getElementById('qQuestion');
  const oEl = document.getElementById('qOpts');
  const ctr = document.getElementById('qCounter');
  const pf = document.getElementById('qProgFill');
  const fb = document.getElementById('qFb');
  const exp = document.getElementById('qExp');
  const nb = document.getElementById('qNext');
  if (!qEl) return;
  qEl.textContent = (qi + 1) + '. ' + q.q;
  ctr.textContent = 'Question ' + (qi + 1) + ' of ' + QS.length;
  if (pf) pf.style.width = ((qi + 1) / QS.length * 100) + '%';
  fb.textContent = ''; if (exp) exp.style.display = 'none'; if (nb) nb.style.display = 'none';
  oEl.innerHTML = '';
  q.o.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className = 'quiz-opt'; b.textContent = opt;
    b.onclick = () => pick(i, b); oEl.appendChild(b);
  });
}
function pick(i, btn) {
  if (ans) return; ans = true;
  const q = QS[qi];
  document.querySelectorAll('.quiz-opt').forEach((b, idx) => {
    b.classList.add('dim');
    if (idx === q.a) b.classList.remove('dim'), b.classList.add('correct');
    else if (idx === i) b.classList.remove('dim'), b.classList.add('wrong');
  });
  const fb = document.getElementById('qFb');
  const exp = document.getElementById('qExp');
  const nb = document.getElementById('qNext');
  if (i === q.a) { sc++; fb.innerHTML = '<span style="color:#6ee7b7;font-weight:700">✅ Correct!</span>'; }
  else { fb.innerHTML = '<span style="color:#fca5a5;font-weight:700">❌ Incorrect.</span>'; }
  if (exp) { exp.textContent = q.exp; exp.style.display = 'block'; }
  if (qi < QS.length - 1) { if (nb) nb.style.display = 'inline-flex'; }
  else { setTimeout(showResult, 800); }
}
function nextQ() { qi++; renderQ(); }
function showResult() {
  const c = document.getElementById('qContent');
  const r = document.getElementById('qResult');
  if (c) c.style.display = 'none';
  if (r) r.style.display = 'block';
  const sf = document.getElementById('qScore');
  const sm = document.getElementById('qMsg');
  if (sf) sf.textContent = sc + ' / ' + QS.length;
  const p = sc / QS.length;
  const msg = p >= .9 ? '🏆 Outstanding — AI expert level!' : p >= .7 ? '🎯 Great work! Strong AI knowledge.' : p >= .5 ? '📚 Good start! Explore more sections.' : '🌱 Keep learning — everything is here!';
  if (sm) sm.textContent = msg;
}
function restartQuiz() { initQuiz(); }
window.nextQ = nextQ; window.restartQuiz = restartQuiz;
if (document.getElementById('qQuestion')) initQuiz();

// ── BACK TO TOP ──
const backTop = document.getElementById('backToTop');
if (backTop) {
    window.addEventListener('scroll', function () {
        backTop.classList.toggle('show', window.scrollY > 300);
    });
    backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ── EMAIL SUBSCRIBE (DEMO) ──
document.querySelectorAll('.sub-form').forEach(f => {
  f.addEventListener('submit', e => {
    e.preventDefault();
    const inp = f.querySelector('input');
    if (inp && inp.value) { inp.value = ''; alert('Subscribed! ✅'); }
  });
});

// ══════════════════════════════
// CURSOR
// ══════════════════════════════
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX - 4 + 'px';
    cursor.style.top = e.clientY - 4 + 'px';
    cursorRing.style.left = e.clientX - 16 + 'px';
    cursorRing.style.top = e.clientY - 16 + 'px';
});
document.querySelectorAll('a,button,.card,.card-sm,.micro-app,.pioneer-card,.prediction,.quiz-opt').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.transform = 'scale(2)'; cursorRing.style.transform = 'scale(1.5)'; cursorRing.style.borderColor = 'rgba(34,211,238,0.6)'; });
    el.addEventListener('mouseleave', () => { cursor.style.transform = 'scale(1)'; cursorRing.style.transform = 'scale(1)'; cursorRing.style.borderColor = 'rgba(34,211,238,0.4)'; });
});