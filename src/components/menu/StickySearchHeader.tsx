import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

interface StickySearchHeaderProps {
  categories: Category[];
  activeCategory: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategorySelect: (categoryId: string) => void;
  tableNumber?: string | null;
}

/**
 * Sticky search header with edge-to-edge filters for the public menu.
 * Only this section remains sticky while scrolling.
 */
export const StickySearchHeader = ({
  categories,
  activeCategory,
  searchQuery,
  onSearchChange,
  onCategorySelect,
  tableNumber
}: StickySearchHeaderProps) => {
  const { t, isRTL } = useTranslation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      {tableNumber && (
        <div className="px-4 py-2 bg-primary/10 border-b border-primary/20">
          <div className="text-center">
            <span className="text-sm font-medium text-primary">
              طاولة رقم {tableNumber}
            </span>
          </div>
        </div>
      )}
      
      {/* Search Section */}
      <div className="px-4 py-3 bg-background">
        <div className="w-full max-w-none">
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
      </div>

      {/* Category Navigation - Full Width Edge to Edge */}
      <div className="w-full bg-background/80 border-t border-border/50">
        <div className="py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4">
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