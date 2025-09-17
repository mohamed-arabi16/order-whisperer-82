import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

/**
 * @interface Category
 * @property {string} id - The unique identifier for the category.
 * @property {string} name - The name of the category.
 * @property {number} display_order - The display order of the category.
 * @property {boolean} is_active - Whether the category is active.
 */
interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

/**
 * @interface StickyNavigationProps
 * @property {Category[]} categories - An array of category objects.
 * @property {string | null} activeCategory - The ID of the currently active category.
 * @property {string} searchQuery - The current search query.
 * @property {(query: string) => void} onSearchChange - A callback function to be called when the search query changes.
 * @property {(categoryId: string) => void} onCategorySelect - A callback function to be called when a category is selected.
 * @property {string} [phoneNumber] - The phone number of the restaurant.
 */
interface StickyNavigationProps {
  categories: Category[];
  activeCategory: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategorySelect: (categoryId: string) => void;
  phoneNumber?: string;
}

/**
 * A sticky navigation component that includes a search bar and a horizontal list of categories.
 * It is used on the public menu page to allow users to filter and navigate the menu.
 */
export const StickyNavigation: React.FC<StickyNavigationProps> = ({
  categories,
  activeCategory,
  searchQuery,
  onSearchChange,
  onCategorySelect,
  phoneNumber,
}) => {
  const { isRTL } = useTranslation();
  const categoryTabsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-background/95 backdrop-blur-md border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 space-y-3">
        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md mx-auto">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground ${
              isRTL ? 'right-3' : 'left-3'
            }`} />
            <Input
              type="text"
              placeholder="ابحث عن الأطباق..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`rounded-full border-0 bg-muted/50 focus:bg-background transition-colors ${
                isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
          </div>
          
          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="rounded-full p-2">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="p-2 space-y-2">
                <LanguageSwitcher />
                {phoneNumber && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${phoneNumber}`)}
                    className="w-full justify-start"
                  >
                    اتصل بنا
                  </Button>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category Chips - Scrollable */}
        <div className="overflow-x-auto scrollbar-hide -mx-4">
          <div 
            ref={categoryTabsRef}
            className={`flex gap-3 px-6 pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
            }}
          >
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <motion.div
                key={category.id}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 snap-center"
              >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCategorySelect(category.id)}
                    className={`whitespace-nowrap rounded-full px-6 py-2 transition-all border flex-shrink-0 ${
                      isActive 
                        ? 'bg-accent text-accent-foreground border-accent shadow-sm font-medium' 
                        : 'border-border hover:border-accent/50 hover:bg-accent/10'
                    }`}
                  >
                  {category.name}
                </Button>
              </motion.div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};