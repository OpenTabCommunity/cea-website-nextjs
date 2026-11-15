'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { star, C } from '@/lib/carpet';

const faNum = (n) => Math.round(n).toLocaleString('fa-IR', { useGrouping: false });

/** Page-wide behaviour: scroll reveals, counters and the tilt on team panels. Re-armed on every navigation. */
export function Effects() {
  const pathname = usePathname();
  useEffect(() => {
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups = [];

    const count = (el) => {
      const n = Number(el.dataset.count);
      if (RM || !n) return;
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / 1600);
        el.textContent = faNum(n * (1 - Math.pow(1 - t, 4)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    // A clipped element reports no visible area to IntersectionObserver, so ".weave" blocks are
    // revealed when their parent comes into view, never by watching the clipped block itself.
    const reveal = (el) => {
      el.classList.add('in');
      el.querySelectorAll(':scope > .weave').forEach((w) => w.classList.add('in'));
      if (el.dataset.count) count(el);
      el.querySelectorAll('[data-count]').forEach(count);
    };
    const targets = new Set(document.querySelectorAll('.rise:not(.in)'));
    document.querySelectorAll('.weave:not(.in)').forEach((w) => w.parentElement && targets.add(w.parentElement));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            // tall containers (a long album) never reach 12%, so a visible strip of 120px also counts
            if (!en.isIntersecting || (en.intersectionRatio < 0.12 && en.intersectionRect.height < 120)) continue;
            reveal(en.target);
            io.unobserve(en.target);
          }
        },
        { threshold: [0, 0.04, 0.12], rootMargin: '0px 0px -6% 0px' },
      );
      targets.forEach((t) => io.observe(t));
      cleanups.push(() => io.disconnect());
    } else targets.forEach(reveal);

    if (!RM && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('.tilt').forEach((el) => {
        const move = (e) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `rotateY(${(x * 6).toFixed(2)}deg) rotateX(${(-y * 6).toFixed(2)}deg)`;
        };
        const leave = () => (el.style.transform = '');
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerleave', leave);
        });
      });
    }
    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);
  return null;
}

export function SiteNav({ brand, links, join }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const on = (href) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <header className={`nav${solid || open || pathname !== '/' ? ' solid' : ''}${open ? ' open' : ''}`}>
      <div className="in-w">
        <Link className="brand" href="/">{brand}</Link>
        <nav className="nav-links" aria-label="منوی اصلی">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={on(l.href) ? 'on' : ''} aria-current={on(l.href) ? 'page' : undefined}>{l.label}</Link>
          ))}
        </nav>
        <Link className="btn small nav-join" href={join}>عضویت</Link>
        <button type="button" className="burger" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
          <span className="sr">{open ? 'بستن فهرست' : 'باز کردن فهرست'}</span>
          <i /><i />
        </button>
      </div>
      <nav id="mobile-menu" className="menu" aria-label="فهرست" hidden={!open}>
        {links.map((l, k) => (
          <Link key={l.href} href={l.href} style={{ '--d': `${k * 40}ms` }}>{l.label}</Link>
        ))}
        <Link className="btn" href={join}>عضویت در انجمن</Link>
      </nav>
    </header>
  );
}

/** A small loom: knots warm up under the pointer and a shuttle keeps weaving on its own. */
export function Loom() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, x = c.getContext('2d');
    const LW = 64, LH = 22, LK = 10;
    const heat = new Float32Array(LW * LH);
    const sh = { i: 0, j: LH - 1 };
    let on = false, tick = 0, raf = 0;
    const base = (i, j) => {
      const v = star(Math.abs((i % 8) - 3.5), Math.abs((j % 8) - 3.5));
      return v < 1 ? C.CREAM : v < 2.4 ? C.NAVY : '#0E9E96';
    };
    const warm = (ci, cj, amt) => {
      for (let dj = -1; dj <= 1; dj++)
        for (let di = -1; di <= 1; di++) {
          const i = ci + di, j = cj + dj;
          if (i < 0 || j < 0 || i >= LW || j >= LH) continue;
          heat[j * LW + i] = Math.max(heat[j * LW + i], amt * (di || dj ? 0.6 : 1));
        }
    };
    const draw = () => {
      for (let j = 0; j < LH; j++)
        for (let i = 0; i < LW; i++) {
          const h = heat[j * LW + i];
          x.fillStyle = h > 0.6 ? C.CREAM : h > 0.3 ? C.GOLD : h > 0.1 ? C.LAKI : base(i, j);
          x.fillRect(i * LK, j * LK, LK - 1, LK - 1);
          heat[j * LW + i] = h * 0.95;
        }
    };
    x.fillStyle = '#0B7F79';
    x.fillRect(0, 0, c.width, c.height);
    draw();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!on) return;
      if (++tick % 2 === 0) {
        warm(sh.i, sh.j, 0.75);
        if (++sh.i >= LW) {
          sh.i = 0;
          if (--sh.j < 0) sh.j = LH - 1;
        }
      }
      draw();
    };
    const move = (e) => {
      const r = c.getBoundingClientRect();
      warm((((e.clientX - r.left) / r.width) * LW) | 0, (((e.clientY - r.top) / r.height) * LH) | 0, 1);
    };
    c.addEventListener('pointermove', move);
    const io = new IntersectionObserver((es) => (on = es[0].isIntersecting));
    io.observe(c);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      c.removeEventListener('pointermove', move);
    };
  }, []);
  return <canvas ref={ref} className="loom" width={640} height={220} aria-hidden="true" />;
}
