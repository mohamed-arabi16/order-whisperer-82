import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * @interface InlineQuantityControlsProps
 * @property {number} quantity - The current quantity.
 * @property {() => void} onIncrement - A function to be called when the quantity is incremented.
 * @property {() => void} onDecrement - A function to be called when the quantity is decremented.
 * @property {boolean} [isLoading=false] - Whether the controls are in a loading state.
 */
interface InlineQuantityControlsProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isLoading?: boolean;
}

/**
 * A set of controls for incrementing and decrementing a quantity,
 * typically used for items in a shopping cart.
 */
export const InlineQuantityControls: React.FC<InlineQuantityControlsProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  isLoading = false,
}) => {
  if (quantity === 0) {
    return (
      <Button
        size="sm"
        onClick={onIncrement}
        disabled={isLoading}
        className="h-6 w-6 p-0 rounded-full bg-brand-primary text-primary-foreground hover:bg-brand-primary-hover"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Plus className="w-3 h-3" />
        )}
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2"
    >
      <Button
        size="sm"
        variant="outline"
        onClick={onDecrement}
        className="h-6 w-6 rounded-full p-0 hover:bg-destructive hover:text-destructive-foreground"
      >
        <Minus className="w-2.5 h-2.5" />
      </Button>
      
      <AnimatePresence mode="wait">
        <motion.span
          key={quantity}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          className="text-xs font-semibold min-w-4 text-center"
        >
          {quantity}
        </motion.span>
      </AnimatePresence>
      
      <Button
        size="sm"
        onClick={onIncrement}
        disabled={isLoading}
        className="h-6 w-6 rounded-full p-0 bg-brand-primary text-primary-foreground hover:bg-brand-primary-hover"
      >
        {isLoading ? (
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
        ) : (
          <Plus className="w-2.5 h-2.5" />
        )}
      </Button>
    </motion.div>
  );
};