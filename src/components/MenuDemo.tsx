import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart, Vegan, Flame, Utensils } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { VscFlame } from "@/components/icons/VscFlame";
import { VscVm } from "@/components/icons/VscVm";
import arTranslations from "@/i18n/ar.json";
import enTranslations from "@/i18n/en.json";

/**
 * An interactive demonstration of the menu and ordering system.
 * It displays a list of demo menu items, allows users to add/remove them from a cart,
 * and simulates sending an order via WhatsApp.
 * It uses the `useTranslation` hook for localization and `framer-motion` for animations.
 *
 * @returns {JSX.Element} The rendered menu demo section.
 */
const MenuDemo = (): JSX.Element => {
  const { t, language } = useTranslation();
  
  // Define demo items directly to avoid translation type issues
  const demoItems = [
    {
      id: 1,
      name: language === 'ar' ? 'حمص بالطحينة' : 'Hummus with Tahini',
      description: language === 'ar' ? 'حمص طازج مع الطحينة وزيت الزيتون' : 'Fresh hummus with tahini and olive oil',
      price: 45,
      category: 'appetizers',
      image: '/placeholder.svg',
      dietary_preferences: ['vegan']
    },
    {
      id: 2,
      name: language === 'ar' ? 'كباب مشوي' : 'Grilled Kebab',
      description: language === 'ar' ? 'كباب لحم مشوي مع الخضار والأرز' : 'Grilled meat kebab with vegetables and rice',
      price: 120,
      category: 'mains',
      image: '/placeholder.svg',
      dietary_preferences: ['spicy']
    },
    {
      id: 3,
      name: language === 'ar' ? 'بقلاوة' : 'Baklava',
      description: language === 'ar' ? 'حلى شرقي بالفستق والعسل' : 'Traditional Middle Eastern pastry with pistachios and honey',
      price: 35,
      category: 'desserts',
      image: '/placeholder.svg',
      dietary_preferences: []
    },
    {
      id: 4,
      name: language === 'ar' ? 'شاي أحمر' : 'Black Tea',
      description: language === 'ar' ? 'شاي أحمر تقليدي' : 'Traditional black tea',
      price: 15,
      category: 'drinks',
      image: '/placeholder.svg',
      dietary_preferences: []
    }
  ];
  
  const [cart, setCart] = useState<
    { id: number; name: string; price: number; quantity: number }[]
  >([]);

  const addToCart = (item: typeof demoItems[0]) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.id === item.id
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [
          ...prevCart,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
          },
        ];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter((cartItem) => cartItem.id !== itemId);
      }
    });
  };

  const getQuantity = (itemId: number) => {
    return cart.find((cartItem) => cartItem.id === itemId)?.quantity || 0;
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSendWhatsApp = () => {
    const restaurantPhoneNumber = "9611234567"; // Placeholder phone number
    let message = `${t("menuDemo.cartTitle")}\n\n`;
    cart.forEach((item) => {
      message += `${item.name} x${
        item.quantity
      } - ${item.price.toLocaleString()} ${t("currency")}\n`;
    });
    message += `\n${t("menuDemo.total")}: ${total.toLocaleString()} ${t(
      "currency"
    )}`;

    const whatsappUrl = `https://wa.me/${restaurantPhoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section id="demo" className="py-16 px-4 bg-secondary/10">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t("menuDemo.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("menuDemo.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {demoItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="overflow-hidden shadow-card transition-all duration-300 hover:shadow-lg flex flex-col md:flex-row md:items-center">
                  <div className="w-full md:w-32 h-32 md:h-32 flex-shrink-0 bg-muted/20 rounded-lg md:rounded-l-lg md:rounded-r-none overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                        <Utensils className="w-8 h-8 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-foreground">
                        {item.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {item.dietary_preferences?.map((pref) => (
                          <div
                            key={pref}
                            className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded-full"
                          >
                            {pref === "vegetarian" && (
                              <VscVm className="h-4 w-4 text-green-600" />
                            )}
                            {pref === "spicy" && (
                              <VscFlame className="h-4 w-4 text-red-600" />
                            )}
                            <span>{t(`menuDemo.dietary.${pref}`)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-base font-semibold text-primary">
                        {item.price.toLocaleString()} {t("currency")}
                      </p>
                      <div className="flex items-center gap-2">
                        <AnimatePresence>
                          {getQuantity(item.id) > 0 && (
                            <>
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromCart(item.id)}
                                  className="h-7 w-7 p-0 rounded-full"
                                >
                                  <Minus size={14} />
                                </Button>
                              </motion.div>
                               <motion.span
                                 initial={{ opacity: 0, y: -10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: 10 }}
                                 className="text-sm font-bold min-w-[1.5rem] text-center"
                               >
                                {getQuantity(item.id)}
                              </motion.span>
                            </>
                          )}
                        </AnimatePresence>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          className="h-7 w-7 p-0 rounded-full"
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg border-t-4 border-primary">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                  <ShoppingCart size={22} /> {t("menuDemo.cartTitle")}
                </h3>
                <div className="max-h-60 overflow-y-auto pr-2">
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex justify-between items-center text-sm mb-3"
                      >
                        <span className="font-medium">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="font-semibold">
                          {(item.price * item.quantity).toLocaleString()}{" "}
                          {t("currency")}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {cart.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    {t("menuDemo.cartEmpty")}
                  </p>
                )}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between mb-4 font-bold text-lg">
                    <span>{t("menuDemo.total")}</span>
                    <span>
                      {total.toLocaleString()} {t("currency")}
                    </span>
                  </div>
                  <Button
                    className="w-full gradient-hero text-primary-foreground"
                    disabled={cart.length === 0}
                    onClick={handleSendWhatsApp}
                  >
                    {t("menuDemo.whatsappButton")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MenuDemo;