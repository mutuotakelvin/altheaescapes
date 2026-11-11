'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { HeroSlide } from '@/types/hero';
import { useHeroCarousel } from './useHeroCarousel';
import { HeroBackground } from './HeroBackground';
import { HeroStory } from './HeroStory';
import { HeroPreviewRail } from './HeroPreviewRail';
import { HeroControls } from './HeroControls';
import { HeroDialog } from './HeroDialog';

gsap.registerPlugin(useGSAP);
type Origin = { index: number; direction: number };

export function CinematicHero({ slides }: { slides: HeroSlide[] }) {
  const root = useRef<HTMLElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const keyboardNavigation = useRef(false);
  const entered = useRef(false);
  const intent = useRef(0);
  const origin = useRef<Origin | null>(null);
  const stack = useRef(0);
  const [panel, setPanel] = useState<string | null>(null);
  const { active, previous, select: requestSlide } = useHeroCarousel(slides, root);

  const select = (index: number, direction = 1) => {
    const next = (index + slides.length) % slides.length;
    intent.current = next;
    origin.current = { index: next, direction };
    requestSlide(next);
  };
  const move = (delta: number) => select(intent.current + delta, delta);
  const open = (id: string) => { history.pushState(null, '', `#${id}`); setPanel(id); };
  const close = () => { history.replaceState(null, '', location.pathname + location.search); setPanel(null); };
  useEffect(() => {
    const sync = () => {
      const hash = location.hash.slice(1);
      setPanel(['menu', 'adventures', 'destinations', 'about', 'contact', 'plan', ...slides.map(s => `adventure-${s.slug}`)].includes(hash) ? hash : null);
    };
    sync(); window.addEventListener('popstate', sync); window.addEventListener('hashchange', sync);
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync); };
  }, [slides]);

  useGSAP(() => {
    const section = root.current!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const first = !entered.current;
    entered.current = true;
    timeline.current?.kill();
    section.dataset.transitioning = reduced ? 'false' : 'true';
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { section.dataset.transitioning = 'false'; } });
    timeline.current = tl;
    const incoming = section.querySelector<HTMLElement>('.background-current')!;
    const outgoing = [...section.querySelectorAll<HTMLElement>('.background-layer')].filter(layer => layer !== incoming);
    const photograph = incoming.querySelector('img');
    gsap.set(photograph, { clearProps: 'transform' });
    // The departing scene pushes toward the viewer as the next scene opens.
    // Start from its current frame so quick selections never restart the zoom.
    if (!first && !reduced) outgoing.forEach(layer => {
      if (Number(gsap.getProperty(layer, 'opacity')) > 0.001) {
        tl.to(layer.querySelector('img'), { scale: 1.12, duration: 1.35, ease: 'sine.inOut', force3D: true }, 0);
      }
    });
    gsap.set(incoming, { zIndex: ++stack.current });
    const source = origin.current;
    tl.fromTo(incoming, { opacity: reduced ? 1 : 0 }, { opacity: 1, duration: reduced ? 0 : 1.2, ease: 'sine.inOut' }, 0);
    // Keep the departing scene opaque behind the dissolve; fading both layers
    // simultaneously darkens the middle of the transition.
    if (reduced || first) gsap.set(outgoing, { opacity: 0 });
    else tl.set(outgoing, { opacity: 0 }, 1.35);
    // The outgoing copy inherits the interrupted frame, rather than flashing fully revealed.
    const copyItems = section.querySelectorAll<HTMLElement>('.current-copy .story-item');
    section.querySelectorAll<HTMLElement>('.outgoing-copy .story-item').forEach((item, index) => {
      const source = copyItems[index];
      if (source) gsap.set(item, { opacity: gsap.getProperty(source, 'opacity'), y: gsap.getProperty(source, 'y') });
    });
    const lines = section.querySelectorAll<HTMLElement>('.current-copy .title-line-inner');
    section.querySelectorAll<HTMLElement>('.outgoing-copy .title-line-inner').forEach((line, index) => {
      const source = lines[index];
      if (source) gsap.set(line, { opacity: gsap.getProperty(source, 'opacity'), yPercent: gsap.getProperty(source, 'yPercent') });
    });
    if (previous !== active) tl.fromTo('.outgoing-copy', { opacity: reduced ? 0 : 1, y: 0 }, { opacity: 0, y: reduced ? 0 : -18, duration: reduced ? 0 : 0.25 }, 0);
    tl.fromTo('.current-copy .story-item', { y: reduced ? 0 : 14, opacity: reduced ? 1 : 0 }, { y: 0, opacity: 1, duration: reduced ? 0 : 0.6, stagger: reduced ? 0 : 0.08 }, reduced ? 0 : 0.15);
    tl.fromTo('.current-copy .title-line-inner', { yPercent: reduced ? 0 : 110, opacity: reduced ? 1 : 0 }, { yPercent: 0, opacity: 1, duration: reduced ? 0 : 0.75, stagger: reduced ? 0 : 0.11 }, reduced ? 0 : 0.18);
    tl.to('.progress-track > span', { scaleX: (active + 1) / slides.length, duration: reduced ? 0 : 0.95 }, 0);
    const cards = gsap.utils.toArray<HTMLElement>('.preview-card', section);
    const width = cards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(section).getPropertyValue('--card-gap'));
    const backward = source?.index === active && source.direction < 0;
    const distance = backward ? (previous - active + slides.length) % slides.length : (active - previous + slides.length) % slides.length;
    cards.forEach(card => {
      const x = Number(card.dataset.rank) * (width + gap);
      if (first || reduced) { gsap.set(card, { x }); return; }
      const oldRank = (Number(card.dataset.index) - previous + slides.length) % slides.length;
      if (backward && oldRank + distance >= slides.length) {
        gsap.set(card, { x: (oldRank - slides.length) * (width + gap) });
      }
      const leaving = !backward && oldRank < distance;
      // Wrapped cards leave through the clipped edge before returning at their final rank.
      tl.to(card, { x: leaving ? (oldRank - distance) * (width + gap) : x, duration: 0.85, ease: 'power3.inOut', overwrite: true,
        onComplete: leaving ? () => { gsap.set(card, { x }); } : undefined,
      }, 0);
    });
    if (keyboardNavigation.current) {
      section.querySelector<HTMLButtonElement>('.preview-card[aria-pressed="true"]')?.focus({ preventScroll: true });
      keyboardNavigation.current = false;
    }
  }, { scope: root, dependencies: [active] });

  useGSAP(() => {
    const section = root.current!;
    let width = section.clientWidth;
    let height = section.clientHeight;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    // Its own tween keeps the entrance alive when a selection interrupts the slide timeline.
    const entrance = gsap.fromTo('.rail-window', { opacity: reduced.matches ? 1 : 0, x: reduced.matches ? 0 : 38 }, { opacity: 1, x: 0, duration: reduced.matches ? 0 : 0.8, delay: reduced.matches ? 0 : 0.15, ease: 'power3.out' });
    const finish = () => { timeline.current?.progress(1); entrance.progress(1); };
    const observer = new ResizeObserver(() => {
      if (section.clientWidth === width && section.clientHeight === height) return;
      width = section.clientWidth; height = section.clientHeight;
      // Finish the image reveal before changing its geometry mid-transition.
      finish();
      const cards = gsap.utils.toArray<HTMLElement>('.preview-card', section);
      const gap = parseFloat(getComputedStyle(section).getPropertyValue('--card-gap'));
      cards.forEach(card => gsap.set(card, { x: Number(card.dataset.rank) * (card.offsetWidth + gap), overwrite: true }));
    });
    const reduce = () => {
      if (!reduced.matches) return;
      finish();
      gsap.set(section.querySelectorAll('.background-layer img'), { clearProps: 'transform' });
    };
    reduced.addEventListener('change', reduce);
    observer.observe(section);
    return () => { observer.disconnect(); reduced.removeEventListener('change', reduce); entrance.kill(); timeline.current?.kill(); };
  }, { scope: root });

  const slide = slides[active];
  return <section ref={root} className="cinematic-hero" data-transitioning="false" aria-roledescription="carousel" aria-label="Adventure collection" onKeyDown={event => {
    if (panel || event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    if (!(event.target as HTMLElement).closest('.hero-carousel')) return;
    event.preventDefault(); keyboardNavigation.current = (event.target as HTMLElement).classList.contains('preview-card'); move(event.key === 'ArrowRight' ? 1 : -1);
  }}>
    <HeroBackground slides={slides} active={active} />
    <HeroStory slide={slide} previous={slides[previous]} />
    <div className="hero-carousel" aria-label="Choose an adventure"><div className="rail-heading">CHOOSE YOUR ESCAPE</div><HeroPreviewRail slides={slides} active={active} select={select} move={move} /><HeroControls active={active} total={slides.length} move={move} /></div>
    <div className="sr-only" aria-live="polite" aria-atomic="true">{active + 1} of {slides.length}: {slide.title}. {slide.eyebrow}.</div>
    <HeroDialog panel={panel} slides={slides} close={close} select={select} open={open} />
  </section>;
}
