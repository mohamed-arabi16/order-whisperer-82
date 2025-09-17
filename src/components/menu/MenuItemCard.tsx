import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useTranslation } from "@/hooks/useTranslation";
import { InlineQuantityControls } from "./InlineQuantityControls";
import { formatPrice } from "@/components/ui/currency-selector";

/**
 * @interface MenuItem
 * @property {string} id - The unique identifier for the menu item.
 * @property {string} name - The name of the menu item.
 * @property {string | null} description - A description of the menu item.
 * @property {number} price - The price of the menu item.
 * @property {string | null} image_url - The URL of the menu item's image.
 * @property {boolean} [is_featured] - Whether the menu item is featured.
 * @property {string} [currency] - The currency of the menu item's price.
 */
interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_featured?: boolean;
  currency?: string;
}

/**
 * @interface MenuItemCardProps
 * @property {MenuItem} item - The menu item to display.
 * @property {number} quantity - The quantity of the item in the cart.
 * @property {boolean} isFavorite - Whether the item is marked as a favorite.
 * @property {boolean} isAddingToCart - Whether the item is currently being added to the cart.
 * @property {() => void} onAddToCart - A callback function to add the item to the cart.
 * @property {() => void} onRemoveFromCart - A callback function to remove the item from the cart.
 * @property {() => void} onToggleFavorite - A callback function to toggle the item's favorite status.
 * @property {() => void} onViewDetails - A callback function to view the item's details.
 */
interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  isFavorite: boolean;
  isAddingToCart: boolean;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  onToggleFavorite: () => void;
  onViewDetails: () => void;
}

/**
 * A card component that displays a single menu item with its details and actions.
 */
export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  quantity,
  isFavorite,
  isAddingToCart,
  onAddToCart,
  onRemoveFromCart,
  onToggleFavorite,
  onViewDetails,
}) => {
  const { isRTL } = useTranslation();

  const formatItemPrice = (price: number): string => {
    return formatPrice(price, item.currency || 'SYP');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-card border-0 h-full">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image Section - Fixed 4:3 aspect ratio */}
          <div className="relative w-full h-32 sm:h-40 bg-muted rounded-t-2xl overflow-hidden">
            {item.image_url ? (
              <LazyLoadImage
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                effect="blur"
                onClick={onViewDetails}
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center bg-muted cursor-pointer"
                onClick={onViewDetails}
              >
                <Utensils className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            
            {/* Featured Badge */}
            {item.is_featured && (
              <Badge 
                className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full shadow-sm"
              >
                مُوصى
              </Badge>
            )}

            {/* Favorite Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleFavorite}
              className={`absolute top-2 left-2 p-2 h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full ${
                isFavorite ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Content Section */}
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-bold text-base leading-tight text-foreground line-clamp-1">
                {item.name}
              </h3>
              
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            {/* Price and Controls - RTL optimized */}
            <div className={`flex items-center justify-between mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm font-semibold text-primary">
                {formatItemPrice(item.price)}
              </span>
              
              <InlineQuantityControls
                quantity={quantity}
                onIncrement={onAddToCart}
                onDecrement={onRemoveFromCart}
                isLoading={isAddingToCart}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};