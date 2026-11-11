import { SiteHeader } from '@/components/site/SiteHeader';
import { CinematicHero } from '@/components/hero/CinematicHero';
import { ExploreByAdventure } from '@/components/adventure/ExploreByAdventure';
import { EscapeIntroduction } from '@/components/landing/EscapeIntroduction';
import { LandingSections } from '@/components/landing/LandingSections';
import { heroSlides } from '@/data/heroSlides';

export default function Home() {
  return <><a href="#home-content" className="skip-link">Skip to content</a><SiteHeader /><main id="home-content" className="home-main"><CinematicHero slides={heroSlides} /><EscapeIntroduction /><ExploreByAdventure /><LandingSections /></main></>;
}
