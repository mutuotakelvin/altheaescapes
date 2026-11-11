export type HeroSlide = {
  _id: string;
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  image: { src: string; alt: string; desktopPosition?: string; mobilePosition?: string };
  cardImage?: { src: string; alt: string };
  cta: { label: string; href: string };
};
