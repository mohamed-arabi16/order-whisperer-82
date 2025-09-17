import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { motion, useAnimation } from "framer-motion";

/**
 * @interface CartItem
 * @property {string} id - The unique identifier for the item.
 * @property {string} name - The name of the item.
 * @property {number} price - The price of the item.
 * @property {number} quantity - The quantity of the item in the cart.
 */
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * @interface EnhancedCartBarProps
 * @property {CartItem[]} cart - An array of items in the cart.
 * @property {number} totalPrice - The total price of all items in the cart.
 * @property {number} totalItems - The total number of items in the cart.
 * @property {() => void} onShowCart - A function to be called when the cart bar is clicked.
 * @property {string} [restaurantName] - The name of the restaurant.
 * @property {any} cartAnimation - The animation controls for the cart bar.
 */
interface EnhancedCartBarProps {
  cart: CartItem[];
  totalPrice: number;
  totalItems: number;
  onShowCart: () => void;
  restaurantName?: string;
  cartAnimation: any;
}

/**
 * A bar that is displayed at the bottom of the screen when there are items in the cart.
 * It shows the total number of items and the total price, and allows the user to open the cart drawer.
 */
export const EnhancedCartBar: React.FC<EnhancedCartBarProps> = ({
  cart,
  totalPrice,
  totalItems,
  onShowCart,
  restaurantName,
  cartAnimation
}) => {
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString()} ل.س`;
  };

  if (cart.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-4 right-4 z-50"
    >
      <motion.div
        animate={cartAnimation}
        className="mx-auto max-w-md"
      >
        <Button
          onClick={onShowCart}
          className="w-full h-16 rounded-2xl shadow-2xl transition-all duration-300 relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          
          <div className="flex items-center justify-between w-full px-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground">
                  {totalItems}
                </Badge>
              </div>
              <div className="text-left">
                <div className="text-lg font-bold">
                  {formatPrice(totalPrice)}
                </div>
                <div className="text-sm opacity-90">
                  {totalItems} عنصر
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold">
                إرسال الطلب
              </div>
              <div className="text-sm opacity-90">
                عبر واتساب
              </div>
            </div>
          </div>
        </Button>
      </motion.div>
    </motion.div>
  );
};