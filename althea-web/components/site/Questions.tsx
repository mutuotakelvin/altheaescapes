import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
export type Question = { question: string; answer: string };
export function Questions({ items, defaultValue = [] }: { items: Question[]; defaultValue?: string[] }) {
  return <Accordion defaultValue={defaultValue}>{items.map((item, index) => <AccordionItem key={item.question} value={`question-${index}`}><AccordionTrigger>{item.question}</AccordionTrigger><AccordionContent><p>{item.answer}</p></AccordionContent></AccordionItem>)}</Accordion>;
}
