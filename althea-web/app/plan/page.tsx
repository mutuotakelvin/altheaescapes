import type { Metadata } from 'next';
import { PageShell, PageIntro } from '@/components/site/PageParts';
import { EscapePlanner } from '@/components/pages/EscapePlanner';
export const metadata: Metadata = { title: 'Plan your escape — Althea Escapes', description: 'Turn a feeling into an escape brief. Choose your elements, your people and your pace, then download your own plan.' };
export default function PlanPage() { return <PageShell><PageIntro eyebrow="FROM ONE DAY TO OUT THERE" title="Let’s make it feel like you." description="A few small choices. The beginning of a bigger story. Build a personal escape brief to keep, share and come back to." /><EscapePlanner /></PageShell>; }
