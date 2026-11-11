export function Arrow({ direction = 'right' }: { direction?: 'left' | 'right' | 'diagonal' }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: direction === 'left' ? 'rotate(180deg)' : direction === 'diagonal' ? 'rotate(-45deg)' : undefined }}><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
