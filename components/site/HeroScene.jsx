'use client';

import { Fragment, useEffect, useRef } from 'react';
import Link from 'next/link';
import { knot, GW, GH, C } from '@/lib/carpet';

const K = 8; // canvas pixels per knot
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * The opening scene. A carpet is woven knot by knot on the floor, then, as the page scrolls,
 * it lifts until it faces the viewer and the association's statement lights up word by word.
 * With "reduce motion" on, everything is shown still.
 */
export default function HeroScene({ title, highlight, text, statement, primary, secondary }) {
  const scene = useRef(null), stage = useRef(null), floor = useRef(null), rug = useRef(null);
  const copy = useRef(null), fog = useRef(null), lamp = useRef(null), dim = useRef(null), line = useRef(null), hint = useRef(null);

  useEffect(() => {
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = scene.current;
    if (RM) el.classList.add('rm');

    // Paint the whole carpet once, off screen.
    const full = document.createElement('canvas');
    full.width = GW * K;
    full.height = GH * K;
    const fc = full.getContext('2d');
    fc.fillStyle = C.NIGHT;
    fc.fillRect(0, 0, full.width, full.height);
    for (let j = 0; j < GH; j++) {
      for (let i = 0; i < GW; i++) {
        fc.fillStyle = knot(i, j);
        fc.fillRect(i * K, j * K, K - 1, K - 1);
        const n = ((((i * 73856093) ^ (j * 19349663)) >>> 0) % 100) / 100; // wool takes dye unevenly
        fc.fillStyle = n > 0.5 ? `rgba(255,255,255,${(n - 0.5) * 0.16})` : `rgba(0,0,0,${(0.5 - n) * 0.22})`;
        fc.fillRect(i * K, j * K, K - 1, K - 1);
      }
    }

    const cv = rug.current, rx = cv.getContext('2d');
    const words = Array.from(line.current.querySelectorAll('.sw'));
    let W = 0, H = 0, vh = 0, p = 0, sp = 0, woven = RM ? 1 : 0, weaveStart = 0, raf = 0, visible = true;
    const twinkles = [];

    const drawWeave = (t) => {
      const rows = Math.floor(t * GH), y0 = (GH - rows) * K;
      rx.clearRect(0, 0, cv.width, cv.height);
      if (rows > 0) rx.drawImage(full, 0, y0, cv.width, rows * K, 0, y0, cv.width, rows * K);
      if (t < 1) {
        rx.fillStyle = C.GOLD;
        rx.fillRect(0, y0 - K, cv.width, K);
        rx.fillStyle = 'rgba(246,235,211,.5)';
        rx.fillRect(0, y0 - 3 * K, cv.width, K);
      }
    };
    const twinkle = () => {
      for (let n = 0; n < 5; n++) twinkles.push({ i: (Math.random() * GW) | 0, j: (Math.random() * GH) | 0, t: 26 });
      for (let k = twinkles.length - 1; k >= 0; k--) {
        const t = twinkles[k];
        t.t--;
        rx.drawImage(full, t.i * K, t.j * K, K, K, t.i * K, t.j * K, K, K);
        if (t.t <= 0) twinkles.splice(k, 1);
        else {
          rx.fillStyle = `rgba(255,236,170,${Math.sin((t.t / 26) * Math.PI) * 0.75})`;
          rx.fillRect(t.i * K, t.j * K, K - 1, K - 1);
        }
      }
    };

    const size = () => {
      vh = stage.current.clientHeight || window.innerHeight;
      W = Math.max(window.innerWidth, 900) * 1.12;
      H = W * 1.4;
      floor.current.style.width = `${W}px`;
      floor.current.style.height = `${H}px`;
      if (RM) floor.current.style.transform = `translateX(-50%) translateY(${H / 2 - vh * 0.7}px)`;
    };
    const readScroll = () => {
      const r = el.getBoundingClientRect(), total = el.offsetHeight - window.innerHeight;
      p = total > 0 ? clamp(-r.top / total) : 0;
      visible = r.bottom > -100;
    };
    let disposed = false;
    const frame = (now) => {
      if (disposed || !floor.current) return;
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      if (woven < 1) {
        if (!weaveStart) weaveStart = now;
        woven = clamp((now - weaveStart) / 2200);
        drawWeave(1 - Math.pow(1 - woven, 3));
      } else if (sp < 0.98) twinkle();
      sp += (p - sp) * 0.09;
      if (Math.abs(p - sp) < 0.0004) sp = p;
      const a = ease(clamp(sp / 0.58));
      floor.current.style.transform = `translateX(-50%) translateY(${(a * (H / 2 - vh * 0.7)).toFixed(1)}px) rotateX(${(64 * (1 - a)).toFixed(2)}deg)`;
      const ho = clamp(1 - sp / 0.16);
      copy.current.style.opacity = ho;
      copy.current.style.transform = `translateY(${(-sp * 260).toFixed(1)}px)`;
      copy.current.style.pointerEvents = ho < 0.3 ? 'none' : '';
      hint.current.style.opacity = clamp(1 - sp / 0.05) * 0.85;
      fog.current.style.opacity = 1 - a;
      lamp.current.style.opacity = 1 - clamp((sp - 0.5) / 0.15);
      const d = clamp((sp - 0.52) / 0.16);
      dim.current.style.opacity = d * 0.84;
      line.current.style.opacity = d;
      const q = clamp((sp - 0.6) / 0.3) * (words.length + 1);
      for (let k = 0; k < words.length; k++) words[k].style.opacity = 0.16 + 0.84 * clamp(q - k);
    };
    const onMove = (e) => {
      const r = stage.current.getBoundingClientRect();
      lamp.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
      lamp.current.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    const onResize = () => {
      size();
      readScroll();
    };

    size();
    readScroll();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', readScroll, { passive: true });
    const stageEl = stage.current;
    stageEl.addEventListener('pointermove', onMove);

    let started = false;
    const start = () => {
      if (started || disposed) return;
      started = true;
      el.classList.add('ready');
      if (RM) drawWeave(1);
      else raf = requestAnimationFrame(frame);
    };
    const timer = setTimeout(start, 1200);
    if (document.fonts?.ready) document.fonts.ready.then(start);
    else start();

    return () => {
      disposed = true;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', readScroll);
      stageEl.removeEventListener('pointermove', onMove);
    };
  }, []);

  const titleWords = [...title.split(/\s+/).filter(Boolean).map((w) => ({ w })), ...highlight.split(/\s+/).filter(Boolean).map((w) => ({ w, hl: true }))];
  const lineWords = statement.split(/\s+/).filter(Boolean);

  return (
    <section className="scene" ref={scene}>
      <div className="stage" ref={stage}>
        <div className="floor" ref={floor}>
          <canvas ref={rug} width={GW * K} height={GH * K} aria-hidden="true" />
        </div>
        <div className="fog" ref={fog} />
        <div className="lamp" ref={lamp} />
        <div className="dim" ref={dim} />
        <div className="hero-copy" ref={copy}>
          <h1>
            {titleWords.map((t, k) => (
              <Fragment key={k}>
                <span className="w">
                  <i className={t.hl ? 'hl' : undefined} style={{ transitionDelay: `${200 + k * 130}ms` }}>{t.w}</i>
                </span>{' '}
              </Fragment>
            ))}
          </h1>
          <p className="fade">{text}</p>
          <div className="cta fade">
            <Link className="btn" href={primary.href}>{primary.label}</Link>
            <Link className="btn ghost" href={secondary.href}>{secondary.label}</Link>
          </div>
        </div>
        <div className="hint" ref={hint} aria-hidden="true">اسکرول کنید</div>
        <div className="statement" ref={line}>
          <p>
            {lineWords.map((w, k) => (
              <span key={k} className={`sw${k === lineWords.length - 1 || k === lineWords.length - 2 ? ' gold' : ''}`}>{w} </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
