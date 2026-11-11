'use client';
import { useState } from 'react';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle } from '@base-ui/react/toggle';
import { categories, escapes } from '@/data/escapes';
import { EscapeCards } from './EscapeCards';
export function AdventureCollection() {
  const [value, setValue] = useState<string[]>(['All escapes']);
  const selected = value[0] || 'All escapes';
  const items = selected === 'All escapes' ? escapes : escapes.filter(item => item.category === selected);
  return <div className="page-section collection-section"><div className="collection-toolbar"><ToggleGroup value={value} onValueChange={next => setValue(next.length ? next : ['All escapes'])} className="collection-filters" aria-label="Filter adventures">{categories.map(category => <Toggle key={category} value={category}>{category}</Toggle>)}</ToggleGroup><span className="small-label" aria-live="polite">{items.length} {items.length === 1 ? 'escape' : 'escapes'} to discover</span></div><EscapeCards items={items} /><p className="collection-note">Explore the concepts now. Confirmed dates, locations and prices will be shared before booking opens.</p></div>;
}
