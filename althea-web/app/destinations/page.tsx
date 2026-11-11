import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { destinations } from '@/data/escapes';
import { PageShell, PageIntro, PageCTA } from '@/components/site/PageParts';
export const metadata: Metadata = { title: 'Destinations — Althea Escapes', description: 'Explore the landscapes behind our escape collection: highlands, river country and coastal horizons.' };
export default function DestinationsPage() {
  return <PageShell><PageIntro eyebrow="LET THE LANDSCAPE LEAD" title="Somewhere that feels different." description="Choose a landscape before you choose a date. A wide horizon, a winding river, a night a little further from everything." /><div className="page-section landscape-list">{destinations.map((place, index) => <Link href={`/destinations/${place.slug}`} className="landscape-row" key={place.slug}><div className="landscape-photo"><Image src={place.image} alt={place.alt} fill sizes="(max-width: 767px) 90vw, 60vw" /></div><div className="landscape-copy"><span className="small-label">{place.eyebrow}</span><h2>{place.name}</h2><p>{place.intro}</p><span className="landing-text-link">Explore the landscape <span aria-hidden="true">↗</span></span><span className="landscape-index" aria-hidden="true">0{index + 1}</span></div></Link>)}<p className="collection-note">These are landscape collections. Confirmed locations and meeting points will be shared with the final trips.</p></div><PageCTA title="Let a place become a story." /></PageShell>;
}
