import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { articles } from '@/data/journal';
import { PageShell, PageIntro, PageCTA } from '@/components/site/PageParts';
export const metadata: Metadata = { title: 'Field notes — Althea Escapes', description: 'Ideas for time outside: first adventures, slower weekends and finding your element.' };
export default function JournalPage() { return <PageShell><PageIntro eyebrow="FIELD NOTES" title="A little inspiration for the way out." description="Thoughts on first steps, slower days and making a little more room for the outside." /><section className="page-section journal-grid">{articles.map(article => <Link href={`/journal/${article.slug}`} key={article.slug} className="journal-card"><div className="journal-photo"><Image src={article.image} alt={article.alt} fill sizes="(max-width: 767px) 90vw, 45vw" /></div><div><span className="small-label">{article.category} · {article.minutes}</span><h2>{article.title}</h2><p>{article.excerpt}</p><span className="landing-text-link">Read the field note <span aria-hidden="true">↗</span></span></div></Link>)}</section><PageCTA title="Turn a good idea into time outside." /></PageShell>; }
