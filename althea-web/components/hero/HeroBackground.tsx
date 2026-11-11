import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { HeroSlide } from '@/types/hero';

/** Keep layers mounted so interrupted transitions can dissolve from their actual frame. */
export function HeroBackground({ slides, active }: { slides: HeroSlide[]; active: number }) {
  return <div className="hero-background" aria-hidden="true">
    <div className="background-layers">{slides.map((slide, index) => <div key={slide._id} data-slide={slide.slug}
      className={`background-layer${index === active ? ' background-current' : ''}`}
      style={{ '--desktop-position': slide.image.desktopPosition ?? 'center', '--mobile-position': slide.image.mobilePosition ?? 'center', opacity: index === 0 ? 1 : 0 } as CSSProperties}>
      <Image src={slide.image.src} alt="" fill sizes="100vw" preload={index === 0} loading={index === 0 ? undefined : 'eager'} />
    </div>)}</div>
    <div className="hero-shade" />
  </div>;
}
