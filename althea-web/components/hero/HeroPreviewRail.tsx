import Image from 'next/image';
import type { CSSProperties, PointerEvent } from 'react';
import { useEffect, useRef } from 'react';
import type { HeroSlide } from '@/types/hero';
import { Arrow } from './Arrow';
export function HeroPreviewRail({ slides, active, select, move }: { slides: HeroSlide[]; active: number; select: (index: number) => void; move: (delta: number) => void }) {
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = rail.current!;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        (entry.target as HTMLElement).dataset.contentVisible = String(entry.intersectionRatio >= 0.97);
      });
    }, { root: element, threshold: [0, 0.97, 1] });
    element.querySelectorAll('.preview-card').forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [slides]);
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const end = (event: PointerEvent) => {
    if (!start.current) return;
    const dx = event.clientX - start.current.x, dy = event.clientY - start.current.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) { swiped.current = true; move(dx < 0 ? 1 : -1); }
    start.current = null;
  };
  return <div ref={rail} className="rail-window" onPointerDown={event => { if (event.pointerType === 'mouse') return; start.current = { x: event.clientX, y: event.clientY }; swiped.current = false; }} onPointerUp={end} onPointerCancel={() => { start.current = null; }} onClickCapture={event => { if (swiped.current) { event.stopPropagation(); event.preventDefault(); swiped.current = false; } }}>
    <div className="preview-track">{slides.map((slide, index) => {
      const rank = (index - active + slides.length) % slides.length;
      return <button type="button" className="preview-card" key={slide._id} data-index={index} data-rank={rank} data-content-visible="false" style={{ '--rank': rank } as CSSProperties} aria-label={`Show ${slide.title}`} aria-pressed={index === active} tabIndex={index === active ? 0 : -1} onClick={() => select(index)}>
        <Image src={slide.cardImage?.src ?? slide.image.src} alt={slide.cardImage?.alt ?? slide.image.alt} fill sizes="(max-width: 767px) 126px, 175px" draggable={false} />
        <span className="card-top"><span className="card-number">{String(index + 1).padStart(2, '0')}</span><span className="card-arrow"><Arrow direction="diagonal" /></span></span>
        <span className="card-copy"><span className="card-rule" /><span className="card-category">{slide.eyebrow}</span><span className="card-title">{slide.title}</span></span>
      </button>;
    })}</div>
  </div>;
}
