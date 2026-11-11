'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { HeroSlide } from '@/types/hero';
import { Arrow } from './Arrow';
export function HeroDialog({ panel, slides, close, select, open }: { panel: string | null; slides: HeroSlide[]; close: () => void; select: (index: number) => void; open: (id: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const isOpen = panel !== null;
  useEffect(() => {
    if (!isOpen) return;
    const dialog = ref.current!;
    const trigger = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = old; trigger?.focus({ preventScroll: true }); };
  }, [isOpen]);
  const slide = slides.find(item => panel === `adventure-${item.slug}`);
  const selector = panel === 'adventures' || panel === 'destinations';
  const title = slide?.title ?? (panel === 'menu' ? 'Your next escape.' : selector ? 'Find your kind of adventure.' : panel === 'about' ? 'Go beyond the ordinary.' : 'A great story starts here.');
  return <dialog ref={ref} className="hero-dialog" aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div className="dialog-content"><button type="button" className="dialog-close round-arrow" aria-label="Close overlay" onClick={close}>×</button><p className="dialog-eyebrow">ALTHEA ESCAPES · {panel === 'menu' ? 'EXPLORE' : 'PREVIEW'}</p><h2 id="dialog-title">{title}</h2>
      {panel === 'menu' ? <nav className="dialog-menu" aria-label="Mobile navigation">{['Adventures', 'Destinations', 'About', 'Contact', 'Plan an escape'].map(label => <a key={label} href={`#${label === 'Plan an escape' ? 'plan' : label.toLowerCase()}`} onClick={event => { event.preventDefault(); open(label === 'Plan an escape' ? 'plan' : label.toLowerCase()); }}>{label}<Arrow direction="diagonal" /></a>)}</nav> : selector ? <><p>Four ways to leave the everyday behind. Choose an experience to explore.</p><div className="dialog-options">{slides.map((item, index) => <button type="button" key={item._id} onClick={() => { select(index); close(); }}><span><small>{item.eyebrow}</small>{item.title}</span><Arrow direction="diagonal" /></button>)}</div>{panel === 'destinations' && <p className="prototype-note">Destinations will be shared when the collection launches.</p>}</> : <><p>{slide?.description ?? (panel === 'about' ? 'Althea Escapes is about stepping outside the familiar and finding your next great story.' : 'We’re putting the finishing touches on our adventure collection. Come back soon to plan your escape.')}</p><p className="prototype-note">Discover the full story, explore the landscape and start your own escape brief.</p><Link className="landing-text-link" href={slide ? `/adventures/${slide.slug}` : `/${panel === 'plan' ? 'plan' : panel === 'about' ? 'about' : 'contact'}`}>Read the full details <span aria-hidden="true">↗</span></Link><button type="button" className="dialog-action" onClick={close}>Keep exploring<Arrow /></button></>}
    </div>
  </dialog>;
}
