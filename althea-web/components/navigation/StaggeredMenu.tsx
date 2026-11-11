'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

export interface StaggeredMenuItem { label: string; ariaLabel: string; link: string }
export interface StaggeredMenuSocialItem { label: string; link: string }
export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  isFixed?: boolean;
  changeMenuColorOnOpen?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}
const DEFAULT_COLORS = ['#C7FF3D', '#FFFFFF'];
gsap.registerPlugin(useGSAP);

function ToggleVisual() {
  return <><span className="sm-toggle-textWrap" aria-hidden="true"><span className="sm-toggle-textInner">{['Menu', 'Close', 'Menu', 'Close'].map((line, index) => <span className="sm-toggle-line" key={index}>{line}</span>)}</span></span><span className="sm-icon" aria-hidden="true"><span className="sm-icon-line sm-toggle-h" /><span className="sm-icon-line sm-toggle-v" /></span></>;
}

/** React Bits StaggeredMenu, with Althea styling and modal focus/scroll management. */
export default function StaggeredMenu({
  position = 'right', colors = DEFAULT_COLORS, items = [], socialItems = [],
  displaySocials = true, displayItemNumbering = true, className, logoUrl,
  menuButtonColor = '#FFFFFF', openMenuButtonColor = '#C7FF3D', accentColor = '#C7FF3D',
  isFixed = false, changeMenuColorOnOpen = true, closeOnClickAway = true,
  onMenuOpen, onMenuClose,
}: StaggeredMenuProps) {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const scope = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const actions = useRef<{ unmount: () => void; close: () => void } | null>(null);
  const palette = colors.length ? colors.slice(0, 4) : DEFAULT_COLORS;
  const configuration = [position, palette.join(','), items.map(item => `${item.label}:${item.link}`).join(','), socialItems.map(item => `${item.label}:${item.link}`).join(','), displaySocials, displayItemNumbering, menuButtonColor, openMenuButtonColor, changeMenuColorOnOpen].join('|');
  const lastConfiguration = useRef('');
  const variables = { '--sm-accent': accentColor, '--sm-button-color': menuButtonColor } as CSSProperties;

  useGSAP(() => {
    const surface = panel.current;
    const viewport = popup.current;
    if (!surface || !viewport) return;
    if (lastConfiguration.current !== configuration) {
      timeline.current?.kill(); timeline.current = null;
      lastConfiguration.current = configuration;
    }
    if (!timeline.current) {
      const layers = viewport.querySelectorAll<HTMLElement>('.sm-prelayer');
      const labels = surface.querySelectorAll<HTMLElement>('.sm-panel-itemLabel');
      const numbered = surface.querySelectorAll<HTMLElement>('.sm-panel-item');
      const socials = surface.querySelectorAll<HTMLElement>('.sm-socials-link');
      const socialTitle = surface.querySelector<HTMLElement>('.sm-socials-title');
      const both = (selector: string) => [...new Set([...viewport.querySelectorAll(selector), ...scope.current!.querySelectorAll(selector)])];
      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([surface, ...layers], { xPercent: offscreen });
      gsap.set(both('.sm-toggle-h'), { rotation: 0 });
      gsap.set(both('.sm-toggle-v'), { rotation: 90 });
      const tl = gsap.timeline({ paused: true, onReverseComplete: () => { if (!openRef.current) actions.current?.unmount(); } });
      layers.forEach((layer, index) => tl.to(layer, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, index * 0.07));
      const panelStart = Math.max(0, layers.length - 1) * 0.07 + 0.08;
      tl.to(surface, { xPercent: 0, duration: 0.65, ease: 'power4.out' }, panelStart);
      tl.fromTo(labels, { yPercent: 140, rotation: 10 }, { yPercent: 0, rotation: 0, duration: 0.85, ease: 'power4.out', stagger: 0.08 }, panelStart + 0.1);
      if (displayItemNumbering) tl.fromTo(numbered, { '--sm-num-opacity': 0 }, { '--sm-num-opacity': 1, duration: 0.6, stagger: 0.07, ease: 'power2.out' }, panelStart + 0.2);
      if (socialTitle) tl.fromTo(socialTitle, { opacity: 0 }, { opacity: 1, duration: 0.45 }, panelStart + 0.3);
      if (socials.length) tl.fromTo(socials, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out' }, panelStart + 0.35);
      tl.to(both('.sm-toggle-h'), { rotation: 45, duration: 0.5, ease: 'power4.out' }, 0);
      tl.to(both('.sm-toggle-v'), { rotation: -45, duration: 0.5, ease: 'power4.out' }, 0);
      tl.to(both('.sm-toggle-textInner'), { yPercent: -75, duration: 0.7, ease: 'power4.out' }, 0);
      if (changeMenuColorOnOpen) tl.fromTo([trigger.current, closeButton.current], { color: menuButtonColor }, { color: openMenuButtonColor, duration: 0.3 }, 0.18);
      timeline.current = tl;
    }
    const tl = timeline.current;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tl.pause().progress(open ? 1 : 0, true);
      if (!open) actions.current?.unmount();
    } else if (open) tl.timeScale(1).play();
    else if (tl.progress() > 0) tl.timeScale(4.5).reverse();
    else actions.current?.unmount();
  }, { scope, dependencies: [open, configuration] });

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => {
      if (!reduced.matches) return;
      timeline.current?.pause().progress(openRef.current ? 1 : 0, true);
      if (!openRef.current) actions.current?.unmount();
    };
    reduced.addEventListener('change', finish);
    return () => { reduced.removeEventListener('change', finish); timeline.current?.kill(); };
  }, []);

  return <div ref={scope} className={['sm-scope', className].filter(Boolean).join(' ')} data-fixed={isFixed} style={variables}>
    <Dialog.Root open={open} actionsRef={actions} disablePointerDismissal={!closeOnClickAway} onOpenChange={(next, details) => {
      if (!next) details.preventUnmountOnClose();
      if (openRef.current === next) return;
      openRef.current = next; setOpen(next);
      if (next) onMenuOpen?.(); else onMenuClose?.();
    }}>
      <Dialog.Trigger ref={trigger} className="sm-toggle" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}><ToggleVisual /></Dialog.Trigger>
      <Dialog.Portal keepMounted container={isFixed ? undefined : scope}>
        <Dialog.Backdrop className="sm-menu-backdrop" style={{ position: isFixed ? 'fixed' : 'absolute' }} />
        <Dialog.Popup ref={popup} className="sm-viewport" data-position={position} style={{ ...variables, position: isFixed ? 'fixed' : 'absolute' }} initialFocus={closeButton} finalFocus={trigger}>
          <Dialog.Title className="sr-only">Explore Althea Escapes</Dialog.Title>
          <Dialog.Description className="sr-only">Find your next adventure, discover destinations and plan an escape.</Dialog.Description>
          <div className="sm-prelayers" aria-hidden="true">{palette.map((color, index) => <div key={`${index}-${color}`} className="sm-prelayer" style={{ background: color }} />)}</div>
          <div ref={panel} className="staggered-menu-panel">
            <div className="sm-panel-header"><Link href="/" className="wordmark" aria-label="Althea Escapes home" onClick={() => actions.current?.close()}>{logoUrl ? <Image src={logoUrl} alt="Althea Escapes" width={110} height={32} unoptimized={!logoUrl.startsWith('/')} /> : <>althea<span>ESCAPES</span></>}</Link><Dialog.Close ref={closeButton} className="sm-toggle sm-close" aria-label="Close navigation menu"><ToggleVisual /></Dialog.Close></div>
            <div className="sm-panel-inner"><p className="sm-panel-kicker">A LITTLE FURTHER. A LITTLE WILDER.</p><nav aria-label="Mobile navigation"><ul className="sm-panel-list" data-numbering={displayItemNumbering || undefined}>{items.map((item, index) => <li className="sm-panel-itemWrap" key={`${item.link}-${index}`}><Link href={item.link} className="sm-panel-item" aria-label={item.ariaLabel} data-index={String(index + 1).padStart(2, '0')} onClick={() => actions.current?.close()}><span className="sm-panel-itemLabel">{item.label}</span></Link></li>)}</ul></nav>
              {displaySocials && socialItems.length > 0 && <div className="sm-socials"><h3 className="sm-socials-title">Find us outside</h3><ul>{socialItems.map(item => <li key={item.link}><a className="sm-socials-link" href={item.link} target="_blank" rel="noopener noreferrer">{item.label}</a></li>)}</ul></div>}
              <div className="sm-panel-footer"><span>GO BEYOND THE ORDINARY.</span><span aria-hidden="true">↗</span></div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  </div>;
}
export { StaggeredMenu };
