'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import type { HeroSlide } from '@/types/hero';

/** A request token makes image loading latest-intent-wins, including slow/failed media. */
export function useHeroCarousel(slides: HeroSlide[], root: RefObject<HTMLElement | null>) {
  const [requested, setRequested] = useState(0);
  const [frame, setFrame] = useState({ active: 0, previous: 0 });
  const current = useRef(0);
  const request = useRef(0);
  useEffect(() => {
    if (requested === current.current) return;
    let cancelled = false;
    const image = root.current?.querySelectorAll<HTMLImageElement>('.background-layer img')[requested];
    if (!image) return;
    const commit = () => {
      if (cancelled) return;
      cancelled = true;
      clearTimeout(timeout);
      const previous = current.current;
      current.current = requested;
      setFrame({ active: requested, previous });
    };
    const timeout = setTimeout(commit, 4000);
    if (image.complete) commit();
    else image.decode().catch(() => {}).then(commit);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [requested, slides, root]);
  const select = (index: number) => {
    const next = (index + slides.length) % slides.length;
    request.current = next;
    setRequested(next);
  };
  const move = (delta: number) => select(request.current + delta);
  return { ...frame, select, move };
}
