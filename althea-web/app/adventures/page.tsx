import type { Metadata } from 'next';
import { PageShell, PageIntro, PageCTA } from '@/components/site/PageParts';
import { AdventureCollection } from '@/components/pages/AdventureCollection';
export const metadata: Metadata = { title: 'The adventure collection — Althea Escapes', description: 'Find your element. Discover air, water, land and wilderness escape concepts and explore the details.' };
export default function AdventuresPage() {
  return <PageShell><PageIntro eyebrow="THE ADVENTURE COLLECTION" title="Find what moves you." description="Some days call for a leap. Others, a long walk and a quieter night. Follow the feeling and find your kind of wild."><span className="intro-counter">04 <small>WAYS TO GET OUTSIDE</small></span></PageIntro><AdventureCollection /><PageCTA /></PageShell>;
}
