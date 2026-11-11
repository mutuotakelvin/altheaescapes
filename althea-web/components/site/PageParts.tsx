import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export function PageShell({ children }: { children: ReactNode }) {
  return <><a href="#page-content" className="skip-link">Skip to content</a><SiteHeader /><main id="page-content">{children}</main><SiteFooter /></>;
}
export function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <div className="page-intro"><p className="landing-kicker">{eyebrow}</p><h1>{title}</h1><div className="page-intro-bottom"><p>{description}</p>{children}</div></div>;
}
export function ImageHero({ image, alt, eyebrow, title, description, backHref, backLabel }: { image: string; alt: string; eyebrow: string; title: string; description: string; backHref: string; backLabel: string }) {
  return <section className="detail-hero"><Image src={image} alt={alt} fill sizes="100vw" loading="eager" /><div className="detail-hero-shade" /><div className="detail-hero-content"><Link href={backHref} className="detail-back">← {backLabel}</Link><div><p className="landing-kicker">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div><span className="detail-scroll" aria-hidden="true">SCROLL TO DISCOVER ↓</span></div></section>;
}
export function PageCTA({ title = 'A good story starts with a yes.' }: { title?: string }) {
  return <section className="page-cta"><p className="landing-kicker">MAKE IT YOUR OWN</p><h2>{title}</h2><Link href="/plan" className="landing-pill">Build my escape <span aria-hidden="true">↗</span></Link><p>No dates to commit to. Just a place to start.</p></section>;
}
