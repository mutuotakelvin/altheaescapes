import Link from 'next/link';

export function EscapeIntroduction() {
  return <section className="escape-introduction" aria-labelledby="escape-introduction-title">
    <div className="introduction-body"><div><p className="introduction-kicker"><span aria-hidden="true" /> THE ALTHEA WAY</p><h2 id="escape-introduction-title">The everyday<br />can wait.</h2></div><div className="introduction-copy"><p>A first leap. A river shared with friends. A trail that takes you a little further than you expected.</p><p>We’re creating escapes around the moments you have to feel for yourself. Come for a change of scenery. Bring back a story of your own.</p><Link href="/about" className="introduction-link">Meet Althea <span aria-hidden="true">↗</span></Link></div></div>
    <div className="introduction-footer"><span>FOUR ELEMENTS. YOUR OWN WAY OUTSIDE.</span><nav aria-label="Find your element"><Link href="/adventures/skydiving">Air</Link><Link href="/adventures/rafting">Water</Link><Link href="/adventures/mountain">Land</Link><Link href="/adventures/camping">Wilderness</Link></nav></div>
  </section>;
}
