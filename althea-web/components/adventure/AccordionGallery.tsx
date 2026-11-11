'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { gsap } from 'gsap';
import { heroSlides } from '@/data/heroSlides';

export interface AccordionGalleryItem {
  image: string;
  label?: string;
  link?: string;
  alt?: string;
}

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
}

const DEFAULT_ITEMS: AccordionGalleryItem[] = heroSlides.map((slide, index) => ({
  image: slide.image.src,
  label: ['Air', 'Water', 'Land', 'Wilderness'][index],
  link: slide.cta.href,
  alt: slide.image.alt,
}));

export default function AccordionGallery({
  items = DEFAULT_ITEMS, defaultIndex = 0, accentColor = '#C7FF3D',
  overlayColor = '#091111', textColor = '#FFFFFF', height = 520, gap = 12,
  radius = 16, expandRatio = 0.52, orientation = 'horizontal', duration = 0.6,
  ease = 'power3.out', parallax = 0.15, tilt = 0.5, stagger = 0.06,
  trigger = 'hover', showLabels = true, grayscale = false, className = '',
}: AccordionGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controls = useRef<(HTMLButtonElement | null)[]>([]);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const firstRun = useRef(true);
  const id = useId();
  const count = items.length;
  const [selected, setSelected] = useState(Math.max(0, defaultIndex));
  const active = Math.min(selected, Math.max(0, count - 1));
  const vertical = orientation === 'vertical';
  const ratio = Math.min(0.9, Math.max(0.2, expandRatio));
  const grow = count > 1 ? ratio * (count - 1) / (1 - ratio) : 1;

  const applyLayout = useCallback((animate: boolean) => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktop = matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches;
    timeline.current?.kill();
    const dur = animate && !reduced ? duration : 0;
    const tl = gsap.timeline({ defaults: { duration: dur, ease, overwrite: 'auto' } });
    root.querySelectorAll<HTMLElement>('.adventure-panel').forEach((panel, index) => {
      const expanded = index === active;
      // Dimming belongs to the panel so the overlay inherits it from a common ancestor.
      tl.to(panel, {
        flexGrow: expanded ? grow : 1,
        '--ag-dim': expanded ? 0 : 0.3,
        [vertical ? 'rotationX' : 'rotationY']: desktop && !reduced && !expanded ? (index < active ? tilt : -tilt) : 0,
      }, 0);
      const media = panel.querySelector('.ag-media');
      const drift = desktop && !reduced && !expanded ? Math.max(-1.5, Math.min(1.5, active - index)) * parallax * 6 : 0;
      tl.to(media, { xPercent: vertical ? 0 : drift, yPercent: vertical ? drift : 0, filter: `grayscale(${grayscale && !expanded ? 1 : 0})` }, 0);
      tl.to(panel.querySelector('.ag-caption-bar'), { opacity: expanded ? 1 : 0, scaleY: expanded ? 1 : 0.4, duration: dur, delay: dur ? stagger : 0 }, 0);
    });
    timeline.current = tl;
  }, [active, duration, ease, grayscale, grow, parallax, stagger, tilt, vertical]);

  useEffect(() => {
    applyLayout(!firstRun.current);
    firstRun.current = false;
    const root = rootRef.current!;
    let width = root.clientWidth;
    let height = root.clientHeight;
    const observer = new ResizeObserver(() => {
      if (root.clientWidth === width && root.clientHeight === height) return;
      width = root.clientWidth;
      height = root.clientHeight;
      applyLayout(false);
    });
    observer.observe(root);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
    const update = () => applyLayout(false);
    reduced.addEventListener('change', update);
    pointer.addEventListener('change', update);
    return () => {
      observer.disconnect();
      reduced.removeEventListener('change', update);
      pointer.removeEventListener('change', update);
      timeline.current?.kill();
    };
  }, [applyLayout]);

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLButtonElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next: number;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % count;
    else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    controls.current[next]?.focus({ preventScroll: true });
  }

  return <div ref={rootRef} className={`accordion-gallery ${className}`} data-orientation={orientation}
    role="list" aria-label="Adventure categories" style={{
      '--ag-accent': accentColor, '--ag-overlay': overlayColor, '--ag-text': textColor,
      '--ag-height': `${height}px`, '--ag-gap': `${gap}px`, '--ag-radius': `${radius}px`,
    } as CSSProperties}>
    {items.map((item, index) => {
      const expanded = index === active;
      const label = item.label || `Adventure ${index + 1}`;
      return <div key={`${item.image}-${index}`} className="adventure-panel" role="listitem"
        data-active={expanded} style={{ flexGrow: index === Math.min(Math.max(defaultIndex, 0), count - 1) ? grow : 1 }}>
        <div className="ag-media"><Image src={item.image} alt={item.alt || item.label || ''} fill sizes="(max-width: 767px) 60vw, 55vw" unoptimized={!item.image.startsWith('/')} draggable={false} /></div>
        <div className="ag-overlay" aria-hidden="true" />
        <button ref={el => { controls.current[index] = el; }} type="button" className="ag-control"
          aria-label={`Expand ${label}`} aria-expanded={expanded} aria-controls={`${id}-caption-${index}`}
          onPointerEnter={event => {
            if (trigger === 'hover' && event.pointerType === 'mouse' && !rootRef.current?.contains(document.activeElement) && matchMedia('(hover: hover) and (min-width: 768px)').matches) setSelected(index);
          }}
          onPointerMove={event => {
            // Layout changes can fire pointerenter beneath a stationary cursor.
            // Actual pointer movement can take over from keyboard selection.
            if (trigger === 'hover' && event.pointerType === 'mouse' && (event.movementX !== 0 || event.movementY !== 0) && matchMedia('(hover: hover) and (min-width: 768px)').matches) setSelected(index);
          }}
          onFocus={() => setSelected(index)} onClick={() => setSelected(index)} onKeyDown={event => handleKeyDown(index, event)}>
          {showLabels && <><span className="ag-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="ag-label" aria-hidden="true">{label}</span></>}
        </button>
        <div id={`${id}-caption-${index}`} className="ag-caption" hidden={!expanded}>
          <span className="ag-caption-bar" aria-hidden="true" />
          {item.link && <Link href={item.link} aria-label={`Explore ${label}`} className="ag-explore">Explore <span aria-hidden="true">↗</span></Link>}
        </div>
      </div>;
    })}
  </div>;
}
