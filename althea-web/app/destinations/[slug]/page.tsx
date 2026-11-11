import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { destinations, escapes } from '@/data/escapes';
import { PageShell, ImageHero, PageCTA } from '@/components/site/PageParts';
import { EscapeCards } from '@/components/pages/EscapeCards';
export function generateStaticParams() { return destinations.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const place = destinations.find(item => item.slug === slug); return { title: `${place?.name || 'Landscape not found'} — Althea Escapes`, description: place?.intro }; }
export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const place = destinations.find(item => item.slug === slug); if (!place) notFound();
  return <PageShell><ImageHero image={place.image} alt={place.alt} eyebrow={place.eyebrow} title={place.name} description={place.headline} backHref="/destinations" backLabel="All landscapes" /><section className="page-section landscape-intro"><div><p className="landing-kicker">A DIFFERENT KIND OF PLACE</p><h2>{place.headline}</h2></div><div><p className="lead-copy">{place.intro}</p>{place.paragraphs.map(p => <p key={p}>{p}</p>)}</div></section><section className="landscape-moments"><Image src={place.image2} alt={place.alt} fill sizes="100vw" /><div><p className="landing-kicker">STAY FOR THE SMALL THINGS</p>{place.moments.map(moment => <h2 key={moment}>{moment}.</h2>)}</div></section><section className="page-section"><div className="landing-heading"><div><p className="landing-kicker">{place.category.toUpperCase()}</p><h2>Find your way into it.</h2></div></div><EscapeCards items={escapes.filter(item => item.region === slug)} /></section><PageCTA title="Bring this landscape into your plans." /></PageShell>;
}
