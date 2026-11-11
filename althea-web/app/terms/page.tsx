import type { Metadata } from 'next';
import { InformationPage } from '@/components/pages/InformationPage';
export const metadata: Metadata = { title: 'Preview terms — Althea Escapes', description: 'Understand the escape concepts, planning tools and booking status in this preview.' };
export default function TermsPage() { return <InformationPage title="A clear starting point." description="What this preview offers, and what is still taking shape. Booking terms will be published with the confirmed collection." sections={[
  { title: 'An invitation to explore', copy: 'The adventures, landscape collections and suggested day plans describe experience concepts. They are intended to help you explore an idea. They are not confirmed itineraries or offers to book a specific trip.' },
  { title: 'No reservations or payments', copy: 'This preview does not accept reservations, deposits or payments. Creating or downloading an escape brief does not hold a place, confirm availability or send an enquiry.' },
  { title: 'Details before a decision', copy: 'Confirmed dates, locations, operators, prices, inclusions and participation requirements will be shared before trips become available to book. Cancellation, refund and other booking conditions will be provided at that time.' },
  { title: 'Photography and editorial content', copy: 'Images convey the character of the collection and may not show a future trip location or operator. Field notes offer general inspiration, not activity-specific instructions. Refer to confirmed trip information when making travel arrangements.' },
  { title: 'Keeping your brief', copy: 'Your downloaded brief is a personal planning document. You can change it, keep it or share it with your group. It does not create a booking relationship.' },
]} />; }
