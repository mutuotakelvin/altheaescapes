import type { HeroSlide } from '@/types/hero';

export const heroSlides: HeroSlide[] = [
  {
    _id: 'skydiving', slug: 'skydiving', eyebrow: 'Air Adventure', title: 'TAKE THE LEAP',
    description: 'Experience the freedom of an unforgettable jump.',
    image: { src: '/images/skydiving-coast.jpg', alt: 'A skydiver in freefall above clouds and a sweeping coastline', desktopPosition: '50% 82%', mobilePosition: '55% 38%' },
    cardImage: { src: '/images/skydiving-coast-card.webp', alt: 'A skydiver tumbling above the coastline' },
    cta: { label: 'Explore adventure', href: '/adventures/skydiving' },
  },
  {
    _id: 'rafting', slug: 'rafting', eyebrow: 'Water Adventure', title: 'OWN THE RAPIDS',
    description: 'Feel the rush as the river takes you beyond the ordinary.',
    image: { src: '/images/rafting.jpg', alt: 'A team paddling a red raft through whitewater rapids', desktopPosition: '60% 50%', mobilePosition: '50% 45%' },
    cardImage: { src: '/images/rafting-card.webp', alt: 'Rafters paddling through rushing whitewater' },
    cta: { label: 'Explore adventure', href: '/adventures/rafting' },
  },
  {
    _id: 'mountain', slug: 'mountain', eyebrow: 'Land Adventure', title: 'RISE ABOVE LIMITS',
    description: 'Follow the trail to views and stories worth the climb.',
    image: { src: '/images/mountain.jpg', alt: 'A lone hiker on a rocky ridge overlooking an expansive mountain landscape', desktopPosition: '55% 50%', mobilePosition: '38% 40%' },
    cardImage: { src: '/images/mountain-card.webp', alt: 'Rugged mountain ridge and distant hills' },
    cta: { label: 'Explore adventure', href: '/adventures/mountain' },
  },
  {
    _id: 'camping', slug: 'camping', eyebrow: 'Wilderness', title: 'ANSWER THE WILD',
    description: 'Leave the familiar behind and find your next great story.',
    image: { src: '/images/camping.jpg', alt: 'A tent on a grassy mountain campsite beneath misty cliffs', desktopPosition: '50% 62%', mobilePosition: '50% 55%' },
    cardImage: { src: '/images/camping-card.webp', alt: 'Mountain tent at a misty campsite' },
    cta: { label: 'Explore adventure', href: '/adventures/camping' },
  },
];
