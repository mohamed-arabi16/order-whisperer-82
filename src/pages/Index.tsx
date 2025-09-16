import FeaturesCarousel from "@/components/FeaturesCarousel";
import Hero from "@/components/Hero";
import MenuDemo from "@/components/MenuDemo";
import Parallax from "@/components/Parallax";
import StaggeredFadeIn from "@/components/StaggeredFadeIn";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * The main landing page of the application.
 * It assembles several components to create the homepage layout.
 *
 * @returns {JSX.Element} The rendered index page.
 */
const Index = (): JSX.Element => {
  const { t, isRTL } = useTranslation();

  return (
    <div className="min-h-screen">
      <Parallax speed={0.5}>
        <StaggeredFadeIn>
          <Hero />
        </StaggeredFadeIn>
      </Parallax>
      <div className="relative z-10 bg-background">
        <StaggeredFadeIn>
          <FeaturesCarousel />
        </StaggeredFadeIn>
        <StaggeredFadeIn>
          <MenuDemo />
        </StaggeredFadeIn>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
