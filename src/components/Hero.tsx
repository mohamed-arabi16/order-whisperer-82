import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import heroImage from "@/assets/hero-restaurant.jpg";

/**
 * The main hero section of the landing page.
 * It includes a title, subtitle, call-to-action buttons, and a hero image.
 *
 * @returns {JSX.Element} The rendered hero section.
 */
const Hero = (): JSX.Element => {
  const { t, isRTL } = useTranslation();

  return (
    <section className="pt-24 pb-16 px-4 bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => window.location.href = '/auth?tab=signup'}
            >
              {t('hero.getStarted')}
              <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.open('https://drive.google.com/file/d/1aOBVdQ7BoVMxg9riTJdayDiWIoXvdBWK/view?usp=sharing', '_blank')}
            >
              <Play className="h-5 w-5 mr-2" />
              {t('hero.watchDemo')}
            </Button>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="mt-16 relative">
          <div className="relative mx-auto max-w-4xl">
            <img
              src={heroImage}
              alt="Restaurant digital menu preview"
              className="rounded-2xl shadow-glow w-full object-cover max-h-96"
            />
            <div className="absolute inset-0 bg-background/10 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;