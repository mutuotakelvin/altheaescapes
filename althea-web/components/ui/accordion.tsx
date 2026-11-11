'use client';

import { Accordion as Primitive } from '@base-ui/react/accordion';
import type { ComponentProps } from 'react';

export function Accordion({ className, ...props }: ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root data-slot="accordion" className={['ui-accordion', className].filter(Boolean).join(' ')} {...props} />;
}
export function AccordionItem({ className, ...props }: ComponentProps<typeof Primitive.Item>) {
  return <Primitive.Item data-slot="accordion-item" className={['ui-accordion-item', className].filter(Boolean).join(' ')} {...props} />;
}
export function AccordionTrigger({ children, className, ...props }: ComponentProps<typeof Primitive.Trigger>) {
  return <Primitive.Header className="ui-accordion-header"><Primitive.Trigger data-slot="accordion-trigger" className={['ui-accordion-trigger', className].filter(Boolean).join(' ')} {...props}>{children}<svg className="ui-accordion-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></Primitive.Trigger></Primitive.Header>;
}
export function AccordionContent({ children, className, ...props }: ComponentProps<typeof Primitive.Panel>) {
  return <Primitive.Panel data-slot="accordion-content" className={['ui-accordion-panel', className].filter(Boolean).join(' ')} {...props}><div className="ui-accordion-content">{children}</div></Primitive.Panel>;
}
