import { useState } from "react";
import { Search, Phone, MoreVertical, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "../LanguageSwitcher";

interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

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

interface PublicMenuHeaderProps {
  tenant: Tenant;
  categories: Category[];
  activeCategory: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategorySelect: (categoryId: string) => void;
}

/**
 * Combined header and navigation component for the public menu.
 * Integrates restaurant branding with category navigation and search.
 */
const PublicMenuHeader = ({
  tenant,
  categories,
  activeCategory,
  searchQuery,
  onSearchChange,
  onCategorySelect,
}: PublicMenuHeaderProps): JSX.Element => {
  const { t, isRTL } = useTranslation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleCall = () => {
    if (tenant.phone_number) {
      window.location.href = `tel:${tenant.phone_number}`;
    }
  };

  const logoAlignment = tenant.logo_position || 'center';
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      {/* Restaurant Header Section */}
      <div className="bg-gradient-to-b from-background to-background/80 px-4 py-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header with Actions */}
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center ${alignmentClasses[logoAlignment]}`}>
              {tenant.logo_url && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <img
                    src={tenant.logo_url}
                    alt={t("publicMenu.restaurantLogo")}
                    className="h-12 w-12 object-contain rounded-lg shadow-sm"
                  />
                </motion.div>
              )}
              {(tenant.name || tenant.branch_name) && (
                <div className={`${tenant.logo_url ? isRTL ? 'mr-6' : 'ml-6' : ''} text-center`}>
                  <h1 className="text-2xl font-bold text-foreground">
                    {tenant.name}
                    {tenant.branch_name && (
                      <span className="text-lg text-muted-foreground ml-2">
                        | {tenant.branch_name}
                      </span>
                    )}
                  </h1>
                </div>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {tenant.phone_number && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCall}
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {t("common.callUs")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Search and Navigation Section */}
      <div className="px-4 py-3 bg-background border-t border-border/50">
        <div className="container mx-auto max-w-4xl">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder={t("common.search")}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`pl-10 h-11 transition-all duration-200 ${
                  isSearchFocused ? 'ring-2 ring-primary/20' : ''
                }`}
              />
            </div>
          </div>

          {/* Category Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0"
                >
                  <Badge
                    variant={activeCategory === category.id ? "default" : "secondary"}
                    className={`cursor-pointer whitespace-nowrap px-4 py-2 text-sm transition-all duration-200 hover:scale-105 ${
                      activeCategory === category.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => onCategorySelect(category.id)}
                  >
                    {category.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMenuHeader;