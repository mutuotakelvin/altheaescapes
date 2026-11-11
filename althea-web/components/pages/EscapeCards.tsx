import Image from 'next/image';
import Link from 'next/link';
import type { Escape } from '@/data/escapes';
export function EscapeCards({ items }: { items: Escape[] }) {
  return <div className="collection-grid">{items.map(item => <Link key={item.slug} href={`/adventures/${item.slug}`} className="collection-card" aria-label={`Discover ${item.name}`}><div className="collection-card-image"><Image src={item.image.src} alt={item.image.alt} fill sizes="(max-width: 767px) 90vw, 45vw" /><span className="escape-category">{item.category}</span><span className="escape-card-arrow" aria-hidden="true">↗</span></div><div className="collection-card-copy"><span className="small-label">{item.place} · {item.pace}</span><h2>{item.name}</h2><p>{item.mood}</p></div></Link>)}</div>;
}
