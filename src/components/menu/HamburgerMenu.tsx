import { ChevronDown, Phone, MessageSquare, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "../LanguageSwitcher";

/**
 * @interface HamburgerMenuProps
 * @property {string} [phoneNumber] - The phone number of the restaurant.
 * @property {() => void} [onFeedbackClick] - A callback function to be called when the feedback button is clicked.
 * @property {() => void} [onReviewsClick] - A callback function to be called when the reviews button is clicked.
 */
interface HamburgerMenuProps {
  phoneNumber?: string;
  onFeedbackClick?: () => void;
  onReviewsClick?: () => void;
}

/**
 * A dropdown menu component that provides mobile-friendly navigation options.
 * It includes a language switcher, a call button, and a feedback button.
 */
export const HamburgerMenu = ({ phoneNumber, onFeedbackClick, onReviewsClick }: HamburgerMenuProps) => {
  const { t, isRTL } = useTranslation();

  const handleCall = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2 h-8 w-8 hover:bg-muted/50"
          aria-label={t('common.menu')}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        side="bottom" 
        align="end" 
        className="w-56 bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg z-[60]"
      >
        {/* Language Switcher */}
        <div className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-sm">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t('header.language')}</span>
          </div>
          <LanguageSwitcher />
        </div>
        
        <DropdownMenuSeparator />

        {/* Call Button */}
        {phoneNumber && (
          <DropdownMenuItem
            onClick={handleCall}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Phone className="h-4 w-4" />
            {t('common.callUs')}
          </DropdownMenuItem>
        )}

        {/* Customer Reviews */}
        <DropdownMenuItem
          onClick={onReviewsClick}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Star className="h-4 w-4" />
          {t('menu.customerReviews')}
        </DropdownMenuItem>

        {/* Feedback Button */}
        <DropdownMenuItem
          onClick={onFeedbackClick}
          className="flex items-center gap-3 cursor-pointer"
        >
          <MessageSquare className="h-4 w-4" />
          {t('common.feedback')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};