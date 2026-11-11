'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import StaggeredMenu from '@/components/navigation/StaggeredMenu';
const links = [['Adventures', '/adventures'], ['Destinations', '/destinations'], ['About', '/about'], ['Journal', '/journal'], ['Contact', '/contact']];
export function SiteHeader({ hero = false }: { hero?: boolean }) {
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    if (pathname !== '/') return;
    const hero = document.querySelector('.cinematic-hero');
    if (!hero) return;
    const height = header.current?.offsetHeight ?? 78;
    const observer = new IntersectionObserver(([entry]) => {
      setPastHero(!entry.isIntersecting);
    }, { rootMargin: `-${height}px 0px 0px 0px`, threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);
  return <header ref={header} data-home={pathname === '/' ? 'true' : undefined} data-hero-past={pastHero} className={hero ? 'hero-nav' : 'site-header'}>
    <Link href="/" className="wordmark" aria-label="Althea Escapes home">althea<span>ESCAPES</span></Link>
    <nav aria-label="Main navigation" className="desktop-nav">{links.map(([name, href]) => <Link key={href} href={href} aria-current={pathname.startsWith(href) ? 'page' : undefined} className={pathname.startsWith(href) ? 'nav-current' : undefined}>{name}</Link>)}</nav>
    <Link className="plan-cta" href="/plan">Plan an escape <span aria-hidden="true">↗</span></Link>
    <StaggeredMenu isFixed className="site-staggered-menu" displaySocials={false} items={[["Home", "/"], ...links, ["Plan an escape", "/plan"]].map(([label, link]) => ({ label, link, ariaLabel: label }))} />
  </header>;
}
