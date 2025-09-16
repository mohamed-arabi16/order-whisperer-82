import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { HamburgerMenu } from "./HamburgerMenu";

interface Tenant {
  name: string;
  logo_url?: string;
  address?: string;
  phone_number?: string;
  primary_color?: string;
  branch_name?: string;
  description?: string;
  logo_position?: string;
}

interface RestaurantBrandingHeaderProps {
  tenant: Tenant;
  onFeedbackClick?: () => void;
}

/**
 * Non-sticky restaurant branding header with logo, name, and hamburger menu.
 * This section scrolls away as the user scrolls down.
 */
export const RestaurantBrandingHeader = ({ 
  tenant, 
  onFeedbackClick 
}: RestaurantBrandingHeaderProps) => {
  const { t, isRTL } = useTranslation();

  const logoAlignment = tenant.logo_position || 'center';
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className="bg-gradient-to-b from-background to-background/80 px-4 py-6 border-b border-border/50">
      <div className="container mx-auto max-w-4xl">
        {/* Header with Restaurant Info and Hamburger Menu */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center flex-1 ${alignmentClasses[logoAlignment]}`}>
            {tenant.logo_url && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <img
                  src={tenant.logo_url}
                  alt={t("publicMenu.restaurantLogo")}
                  className="h-14 w-14 object-contain rounded-lg shadow-sm"
                />
              </motion.div>
            )}
            {(tenant.name || tenant.branch_name) && (
              <div className={`${tenant.logo_url ? isRTL ? 'mr-4' : 'ml-4' : ''} flex-1`}>
                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  مرحباً بكم في {tenant.name}
                  {tenant.branch_name && (
                    <span className="block text-lg text-muted-foreground font-medium mt-1">
                      {tenant.branch_name}
                    </span>
                  )}
                </h1>
              </div>
            )}
          </div>

          {/* Hamburger Menu */}
        <HamburgerMenu 
          phoneNumber={tenant.phone_number}
          onFeedbackClick={onFeedbackClick}
          onReviewsClick={() => {
            const element = document.getElementById('customer-reviews');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
        </div>

        {/* Optional Description */}
        {tenant.description && (
          <div className="mt-4 text-center">
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              {tenant.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};