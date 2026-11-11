import type { Metadata } from 'next';
import { PageShell, PageIntro, PageCTA } from '@/components/site/PageParts';
import { Questions } from '@/components/site/Questions';
import { commonQuestions } from '@/data/escapes';
export const metadata: Metadata = { title: 'Your questions — Althea Escapes', description: 'Answers about the Althea collection, trip planning, experience levels and future bookings.' };
export default function FAQPage() { return <PageShell><PageIntro eyebrow="BEFORE YOU HEAD OUT" title="A little clarity goes a long way." description="Good questions are part of a good adventure. Here’s what to know about the collection and where we are today." /><section className="page-section faq-page"><Questions items={commonQuestions} defaultValue={['question-0']} /></section><PageCTA title="Still finding your kind of wild?" /></PageShell>; }
