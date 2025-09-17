import React from "react";
import { Link } from "react-router-dom";
import { Heart, ExternalLink } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @interface RestaurantOSPromoProps
 * @property {'free' | 'starter' | 'premium'} plan - The current subscription plan of the restaurant.
 * @property {string} [className] - Optional additional CSS classes to apply to the component.
 */
interface RestaurantOSPromoProps {
  plan: 'free' | 'starter' | 'premium';
  className?: string;
}

/**
 * A promotional banner for the RestaurantOS platform, displayed for non-premium users.
 */
export const RestaurantOSPromo: React.FC<RestaurantOSPromoProps> = ({ 
  plan, 
  className = "" 
}) => {
  const { isRTL } = useTranslation();

  if (plan === 'premium') return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-muted/95 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 py-2">
          <div className={`flex items-center justify-center gap-2 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="flex items-center gap-1">
              {isRTL ? 'مدعوم بواسطة' : 'Powered by'}
              <Heart className="w-3 h-3 text-destructive fill-current" />
            </span>
            <Link 
              to="https://restaurantos.qobouli.com" 
              target="_blank"
              className="font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              RestaurantOS
              <ExternalLink className="w-3 h-3" />
            </Link>
            {plan === 'free' && (
              <>
                <span className="mx-1">•</span>
                <Link 
                  to="/pricing" 
                  className="text-accent hover:text-accent/80 transition-colors font-medium"
                >
                  {isRTL ? 'ترقية للحصول على المزيد' : 'Upgrade for more features'}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
