'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { escapes } from '@/data/escapes';
const steps = ['Your element', 'Your people', 'Your kind of day', 'Your escape'];
export function EscapePlanner() {
  const [step, setStep] = useState(0);
  const [elements, setElements] = useState<string[]>([]);
  const [crew, setCrew] = useState('Friends');
  const [size, setSize] = useState('2');
  const [timing, setTiming] = useState('A long weekend');
  const [pace, setPace] = useState('A little of both');
  const [notes, setNotes] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const urls = useRef<string[]>([]);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [step]);
  useEffect(() => () => { urls.current.forEach(url => URL.revokeObjectURL(url)); }, []);
  function advance(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (step === 0 && elements.length === 0) return; setStep(current => Math.min(3, current + 1)); }
  function download() {
    const text = `MY ALTHEA ESCAPE\n\nMy elements: ${elements.join(', ')}\nMy crew: ${crew}\nGroup size: ${size} people\nTime away: ${timing}\nThe pace: ${pace}\n\nWhat would make it mine:\n${notes || 'A little further. A little wilder.'}\n\nThis is a personal planning brief, not a reservation or an enquiry. Dates, availability and prices are not confirmed.\n\nAlthea Escapes`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    urls.current.forEach(previous => URL.revokeObjectURL(previous)); urls.current = [url];
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'my-althea-escape.txt'; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setDownloaded(true);
  }
  return <div className="planner-layout page-section"><div className="planner-main"><ol className="planner-progress" aria-label="Planning progress">{steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} data-complete={step > index}><span>{step > index ? '✓' : index + 1}</span><small>{label}</small></li>)}</ol>
    <form onSubmit={advance} className="planner-form">
      <p className="landing-kicker">{step === 3 ? 'A STARTING POINT, MADE BY YOU' : `STEP ${step + 1} OF 3`}</p>
      <h2 ref={heading} tabIndex={-1}>{['What calls you outside?', 'Who’s coming with you?', 'How do you want it to feel?', 'This could be the start.'][step]}</h2>
      {step === 0 && <FieldSet><FieldLegend>Choose one or more elements.</FieldLegend><div className="element-choices">{escapes.map(escape => <label className="element-choice" key={escape.slug} data-checked={elements.includes(escape.category)}><input type="checkbox" aria-label={escape.category} checked={elements.includes(escape.category)} onChange={event => setElements(current => event.target.checked ? [...current, escape.category] : current.filter(item => item !== escape.category))} /><span><strong>{escape.category}</strong><small>{escape.mood}</small></span><span className="choice-mark" aria-hidden="true">{elements.includes(escape.category) ? '✓' : '+'}</span></label>)}</div></FieldSet>}
      {step === 1 && <FieldGroup><Field><FieldLabel htmlFor="crew">Your crew</FieldLabel><select id="crew" value={crew} onChange={event => setCrew(event.target.value)}><option>Friends</option><option>Just me</option><option>My partner and me</option><option>Family</option><option>Our team</option></select></Field><Field><FieldLabel htmlFor="group-size">Group size</FieldLabel><input id="group-size" type="number" required min="1" max="50" value={size} onChange={event => setSize(event.target.value)} /><FieldDescription>A rough number is fine. This doesn’t reserve any places.</FieldDescription></Field></FieldGroup>}
      {step === 2 && <FieldGroup><Field><FieldLabel htmlFor="timing">When would you like to go?</FieldLabel><select id="timing" value={timing} onChange={event => setTiming(event.target.value)}><option>A day outside</option><option>A long weekend</option><option>A few days away</option><option>I’m still dreaming</option></select></Field><Field><FieldLabel htmlFor="pace">Your ideal pace</FieldLabel><select id="pace" value={pace} onChange={event => setPace(event.target.value)}><option>Slow and spacious</option><option>Full of energy</option><option>A little of both</option></select></Field><Field><FieldLabel htmlFor="notes">Anything that would make it yours?</FieldLabel><textarea id="notes" rows={4} maxLength={1200} value={notes} onChange={event => setNotes(event.target.value)} placeholder="A birthday, a first adventure, time with your people…" /><FieldDescription>Keep personal or sensitive information out of your brief.</FieldDescription></Field></FieldGroup>}
      {step === 3 && <section className="brief-result" aria-label="Your escape brief"><dl><div><dt>YOUR ELEMENTS</dt><dd>{elements.join(' + ')}</dd></div><div><dt>YOUR PEOPLE</dt><dd>{crew} · {size} {size === '1' ? 'person' : 'people'}</dd></div><div><dt>TIME AWAY</dt><dd>{timing}</dd></div><div><dt>THE PACE</dt><dd>{pace}</dd></div></dl>{notes && <div className="brief-notes"><span className="small-label">THE DETAILS THAT MATTER</span><p>{notes}</p></div>}<p className="brief-status">A personal idea, not a reservation. Download it and share it with your people. Nothing is sent to Althea.</p><button type="button" onClick={download} className="landing-pill">Download my brief <span aria-hidden="true">↓</span></button><p className="download-feedback" role="status">{downloaded ? 'Your brief is ready to keep. Find it in your downloads.' : ''}</p></section>}
      <div className="planner-actions">{step > 0 && step < 3 && <button type="button" onClick={() => setStep(current => current - 1)} className="planner-back">← Back</button>}{step < 3 ? <button key="continue" type="submit" disabled={step === 0 && elements.length === 0} className="landing-pill">{step === 2 ? 'Review my escape' : 'Continue'} <span aria-hidden="true">→</span></button> : <button key="edit" type="button" className="planner-back" onClick={event => { event.preventDefault(); setDownloaded(false); setStep(0); }}>Edit my brief</button>}</div>
    </form></div><aside className="planner-aside"><span className="small-label">A LITTLE ROOM TO DREAM</span><h3>No perfect plan required.</h3><p>Start with a feeling. The details can follow.</p><ul><li>Choose what interests you.</li><li>Bring your people into the idea.</li><li>Keep a brief you can come back to.</li></ul><p>The collection is in development. Your brief stays in this tab until you download it. It won’t make a booking or send an enquiry.</p><Link href="/faqs" className="landing-text-link">A few good answers <span aria-hidden="true">↗</span></Link></aside></div>;
}
