'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import AccordionGallery from './AccordionGallery';

export function ExploreByAdventure() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = root.current!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let animation: gsap.core.Tween | undefined;
    let entered = false;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting) || entered) return;
      entered = true;
      observer.disconnect();
      if (!reduced.matches) animation = gsap.fromTo(section, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'opacity,transform' });
    }, { threshold: 0.1 });
    const finish = () => { if (reduced.matches) animation?.progress(1); };
    reduced.addEventListener('change', finish);
    observer.observe(section);
    return () => { observer.disconnect(); reduced.removeEventListener('change', finish); animation?.kill(); gsap.set(section, { clearProps: 'opacity,transform' }); };
  }, []);

  return <section ref={root} className="explore-adventures" aria-labelledby="explore-adventures-title">
    <div className="explore-heading"><div><p className="explore-kicker">FIND YOUR ELEMENT</p><h2 id="explore-adventures-title">Explore by adventure</h2></div><p>Four ways out of the everyday.<br />Where will you go next?</p></div>
    <AccordionGallery orientation="horizontal" />
  </section>;
}
