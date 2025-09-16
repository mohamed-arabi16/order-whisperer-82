import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Globe } from "lucide-react";

/**
 * A floating language switcher that appears on all pages
 * This ensures users can always access language switching functionality
 */
const FloatingLanguageSwitcher = (): JSX.Element => {
  const { language, setLanguage, t, isRTL } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className={`fixed bottom-4 z-50 ${isRTL ? 'left-4' : 'right-4'}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleLanguage}
        className="flex items-center gap-2 bg-background/95 backdrop-blur-sm shadow-lg border border-border/50 hover:bg-accent/50 transition-all duration-200"
        title={t('header.switchLanguage')}
      >
        <Globe size={16} />
        <span className="text-sm font-medium">
          {language === 'ar' ? 'EN' : 'عر'}
        </span>
      </Button>
    </div>
  );
};

export default FloatingLanguageSwitcher;