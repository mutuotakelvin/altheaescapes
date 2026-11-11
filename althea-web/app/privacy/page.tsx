import type { Metadata } from 'next';
import { InformationPage } from '@/components/pages/InformationPage';
export const metadata: Metadata = { title: 'Privacy — Althea Escapes', description: 'How your escape brief works in this preview.' };
export default function PrivacyPage() { return <InformationPage title="Your plans are yours." description="A simple explanation of the personal planning tools in this preview. A full privacy notice will be published before enquiry or booking services open." sections={[
  { title: 'Your escape brief', copy: 'The planner keeps your choices in memory while the page is open. It does not submit your brief to Althea or save it to an Althea account. Leaving or refreshing the page clears those choices.' },
  { title: 'Your download', copy: 'Choosing Download my brief creates a text file in your browser. That file is saved to your device through your browser’s download feature. You decide whether to keep it or share it.' },
  { title: 'What to leave out', copy: 'The planner does not need your contact information, payment details or sensitive personal information. Keep your notes focused on the kind of experience you want.' },
  { title: 'Browsing the preview', copy: 'Page requests are handled by the service hosting this site. Hosting services may process technical request information to deliver pages. Details about the operator, hosting providers, retention and applicable privacy rights will be included in the full notice before public services launch.' },
  { title: 'Future services', copy: 'If enquiry forms, accounts or bookings are introduced, their data handling will be explained before you use them. This preview does not collect payments or accept booking enquiries.' },
]} />; }
