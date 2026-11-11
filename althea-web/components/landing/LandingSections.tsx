import Image from 'next/image';
import Link from 'next/link';
import { Questions } from '@/components/site/Questions';
import { SiteFooter } from '@/components/site/SiteFooter';
import { commonQuestions } from '@/data/escapes';
import { heroSlides } from '@/data/heroSlides';

const escapes = [
  { slide: heroSlides[1], name: 'Follow the whitewater', category: 'Water', detail: 'For the ones who go with the flow. And sometimes against it.' },
  { slide: heroSlides[2], name: 'Take the higher trail', category: 'Land', detail: 'A little further uphill. A whole new perspective.' },
  { slide: heroSlides[3], name: 'Stay a little wilder', category: 'Wilderness', detail: 'Trade the city lights for a slower night outside.' },
];


function SectionHeading({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return <div className="landing-heading"><div><p className="landing-kicker">{kicker}</p><h2>{title}</h2></div>{description && <p>{description}</p>}</div>;
}

export function LandingSections() {
  return <>
    <section id="escape-collection" className="landing-section featured-escapes" aria-label="Featured escapes">
      <SectionHeading kicker="THE NEXT STORY STARTS HERE" title="Make room for a little wild." description="A first look at the escapes we’re dreaming up. Pick the one that feels like you." />
      <div className="escape-grid">{escapes.map(({ slide, name, category, detail }) => <Link key={slide.slug} href={slide.cta.href} className="escape-card" aria-label={`View escape: ${name}`}>
        <div className="escape-photo"><Image src={slide.image.src} alt={slide.image.alt} fill sizes="(max-width: 767px) 90vw, 30vw" /><span className="escape-category">{category}</span><span className="escape-card-arrow" aria-hidden="true">↗</span></div>
        <div className="escape-copy"><h3>{name}</h3><p>{detail}</p><span className="escape-link">Discover this escape <span aria-hidden="true">↗</span></span></div>
      </Link>)}</div>
      <p className="collection-note">A preview of what’s ahead. Full itineraries and dates coming at launch.</p>
    </section>

    <section id="our-story" className="landing-section althea-story" aria-labelledby="althea-story-title">
      <div className="story-photo"><Image src="/images/camping.jpg" alt="A quiet mountain campsite beneath misty cliffs" fill sizes="(max-width: 767px) 90vw, 45vw" /><span className="photo-note">LESS SIGNAL. MORE CONNECTION.</span></div>
      <div className="story-copy"><p className="landing-kicker">THE ALTHEA WAY</p><h2 id="althea-story-title">Some things<br />you have to<br /><span>feel for yourself.</span></h2><p>The cold river. The last steps to the ridge. That first deep breath when the city feels far away.</p><p>Althea Escapes is taking shape around those moments. A place to find experiences that get you outside, bring you closer to your people, and leave you with a story of your own.</p><Link href="/about" className="landing-text-link">Find your way outside <span aria-hidden="true">↗</span></Link></div>
    </section>

    <section id="places" className="landing-section destination-section" aria-label="Destinations preview">
      <SectionHeading kicker="LET THE LANDSCAPE LEAD" title="A change of scenery. A change of pace." description="From wide-open horizons to the places where the trail disappears. Follow your curiosity." />
      <div className="destination-grid"><Link href="/destinations/highlands" className="destination-photo destination-wide"><Image src="/images/mountain.jpg" alt="Rocky mountain ridges stretching into the distance" fill sizes="(max-width: 767px) 90vw, 60vw" /><div><span>TAKE THE SCENIC ROUTE</span><h3>Above the everyday.</h3><p>Ridges, open skies & a different point of view.</p></div><span className="destination-arrow" aria-hidden="true">↗</span></Link><Link href="/destinations/river-country" className="destination-photo"><Image src="/images/rafting.jpg" alt="Rafters navigating a river through a green gorge" fill sizes="(max-width: 767px) 90vw, 35vw" /><div><span>FOLLOW SOMETHING UNTAMED</span><h3>Into the current.</h3><p>Wild water. A little more alive.</p></div><span className="destination-arrow" aria-hidden="true">↗</span></Link></div>
    </section>

    <section id="planning-guide" className="landing-section planning-guide" aria-label="How to plan your escape">
      <div><p className="landing-kicker">FROM “ONE DAY” TO OUT THERE</p><h2>Your next escape<br />starts with a feeling.</h2><Link href="#explore-adventures-title" className="landing-text-link">Choose your element <span aria-hidden="true">↗</span></Link></div>
      <ol className="planning-steps"><li><span className="step-number">01</span><div><h3>Find your kind of wild.</h3><p>Air, water, land or wilderness. Start with whatever makes you lean in.</p></div></li><li><span className="step-number">02</span><div><h3>Make it your story.</h3><p>Solo time, a weekend with friends, or something you’ve never tried. Imagine your escape.</p></div></li><li><span className="step-number">03</span><div><h3>Get ready to get out there.</h3><p>Explore the previews now. Dates, trip details and booking options are coming at launch.</p></div></li></ol>
    </section>

    <section className="landing-section escape-faq" aria-label="Adventure questions">
      <div><p className="landing-kicker">BEFORE YOU HEAD OUT</p><h2>A few things<br />you might wonder.</h2><p>Good adventures start with a little curiosity.</p></div>
      <div className="faq-list"><Questions items={commonQuestions.slice(0, 4)} /></div>
    </section>

    <section id="start-planning" className="closing-escape" aria-labelledby="closing-title"><Image src="/images/skydiving-coast.jpg" alt="A skydiver above a sweeping coastline and blue horizon" fill sizes="100vw" /><div className="closing-copy"><p className="landing-kicker">GO BEYOND THE ORDINARY</p><h2 id="closing-title">You’ll never wish<br />you stayed in.</h2><p>Find the escape that makes you feel something.</p><Link href="/plan" className="landing-pill">Plan an escape <span aria-hidden="true">↗</span></Link></div></section>

    <SiteFooter />
  </>;
}
