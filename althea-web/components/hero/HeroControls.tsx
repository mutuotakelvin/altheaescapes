import { Arrow } from './Arrow';
export function HeroControls({ active, total, move }: { active: number; total: number; move: (delta: number) => void }) {
  return <div className="hero-controls"><div className="arrow-pair"><button type="button" className="round-arrow" aria-label="Previous adventure" onClick={() => move(-1)}><Arrow direction="left" /></button><button type="button" className="round-arrow" aria-label="Next adventure" onClick={() => move(1)}><Arrow /></button></div><div className="progress-track" aria-hidden="true"><span style={{ transform: `scaleX(${1 / total})` }} /></div><div className="slide-counter" aria-hidden="true">{String(active + 1).padStart(2, '0')}<span> / {String(total).padStart(2, '0')}</span></div></div>;
}
