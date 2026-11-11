import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { escapes } from '@/data/escapes';
import { PageShell, ImageHero } from '@/components/site/PageParts';
import { Questions } from '@/components/site/Questions';
import { EscapeCards } from '@/components/pages/EscapeCards';
export function generateStaticParams() { return escapes.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const escape = escapes.find(item => item.slug === slug);
  return { title: escape ? `${escape.name} — Althea Escapes` : 'Escape not found — Althea Escapes', description: escape?.intro };
}
export default async function EscapePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const escape = escapes.find(item => item.slug === slug);
  if (!escape) notFound();
  const questions = [
    { question: 'Is this escape available to book?', answer: 'This is an escape concept from our developing collection. Dates, prices, locations and the confirmed operator will be published before bookings open. You can start your personal escape brief now.' },
    { question: 'What experience will I need?', answer: 'Participation requirements depend on the confirmed activity and operator. The final trip page will explain experience levels and other requirements before you decide whether to join.' },
    { question: 'What will be included?', answer: 'The final itinerary will list all inclusions, equipment, transport arrangements and anything to organise separately. The suggested day below describes the feel of the escape, rather than a booked itinerary.' },
  ];
  return <PageShell><ImageHero image={escape.image.src} alt={escape.image.alt} eyebrow={`${escape.category.toUpperCase()} / THE ESCAPE COLLECTION`} title={escape.name} description={escape.mood} backHref="/adventures" backLabel="All escapes" />
    <div className="detail-facts"><div><span>THE ELEMENT</span><strong>{escape.category}</strong></div><div><span>THE FEELING</span><strong>{escape.pace}</strong></div><div><span>MADE FOR</span><strong>{escape.bestFor}</strong></div><Link href={`/destinations/${escape.region}`}><span>THE LANDSCAPE</span><strong>{escape.place} ↗</strong></Link></div>
    <div className="page-section detail-layout"><article className="detail-story"><p className="landing-kicker">THE EXPERIENCE</p><h2>{escape.quote}</h2><p className="lead-copy">{escape.intro}</p><p>{escape.story}</p><ul className="escape-highlights">{escape.highlights.map(item => <li key={item}><span aria-hidden="true">↗</span>{item}</li>)}</ul>
      <section className="detail-chapter"><p className="landing-kicker">AN IDEA OF WHAT’S AHEAD</p><h2>The shape of your day</h2><ol className="day-flow">{escape.day.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div></li>)}</ol></section>
      <figure className="detail-inline-photo"><Image src={escape.image.src} alt={escape.image.alt} fill sizes="(max-width: 900px) 90vw, 60vw" /></figure>
      <section className="detail-chapter"><p className="landing-kicker">A LITTLE PREPARATION</p><h2>Bring less. Feel more.</h2><p>Keep your plans light for now. A complete packing list will come with the confirmed escape, with equipment and personal essentials clearly separated.</p><ul className="packing-list">{escape.bring.map(item => <li key={item}>{item}</li>)}</ul></section>
      <section className="detail-chapter"><p className="landing-kicker">BEFORE YOU SAY YES</p><h2>A few good questions.</h2><Questions items={questions} /></section>
    </article><aside className="escape-sidebar"><p className="landing-kicker">YOUR NEXT STORY</p><h2>Make this<br />one yours.</h2><p>Tell your future self what you have in mind. Build a brief around the people, pace and feeling you want.</p><Link href="/plan" className="landing-pill">Build my escape <span aria-hidden="true">↗</span></Link><div className="sidebar-status"><span /> Collection in development</div><p className="sidebar-note">Your brief is a starting point, not a reservation. Confirmed trip details and booking options are coming soon.</p><Link href="/contact" className="sidebar-contact">Have a question? ↗</Link></aside></div>
    <section className="page-section related-escapes"><div className="landing-heading"><div><p className="landing-kicker">KEEP FOLLOWING YOUR CURIOSITY</p><h2>Another way outside.</h2></div><Link href="/adventures" className="landing-text-link">All escapes <span aria-hidden="true">↗</span></Link></div><EscapeCards items={escapes.filter(item => item.slug !== slug).slice(0, 2)} /></section>
  </PageShell>;
}
