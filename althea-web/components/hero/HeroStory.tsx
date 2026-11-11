import Link from 'next/link';
import type { HeroSlide } from '@/types/hero';
import { Arrow } from './Arrow';

function StoryContent({ slide, outgoing = false }: { slide: HeroSlide; outgoing?: boolean }) {
  const words = slide.title.split(' ');
  const lines = [words.slice(0, -1).join(' '), words.at(-1)];
  const Heading = outgoing ? 'div' : 'h1';
  return <>
    <div className="eyebrow story-item"><span />{slide.eyebrow}</div>
    <Heading className="hero-title story-item" aria-label={slide.title}>{lines.map((line, i) => <span className="title-line" key={i}><span className="title-line-inner">{line}{i === 0 ? ' ' : ''}</span></span>)}</Heading>
    <p className="hero-description story-item">{slide.description}</p>
    <Link className="adventure-cta story-item" href={slide.cta.href}><span>{slide.cta.label}</span><span className="cta-icon"><Arrow direction="diagonal" /></span></Link>
  </>;
}

export function HeroStory({ slide, previous }: { slide: HeroSlide; previous: HeroSlide }) {
  return <div className="hero-story">
    {previous._id !== slide._id && <div className="outgoing-copy" aria-hidden="true" inert><StoryContent slide={previous} outgoing /></div>}
    <div className="current-copy"><StoryContent slide={slide} /></div>
  </div>;
}
