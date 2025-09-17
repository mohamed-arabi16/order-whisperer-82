import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Star, ArrowLeft, Clock, Loader2, Phone, MapPin, Utensils
} from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { 
  generateWhatsAppMessage, 
  openWhatsApp, 
  validatePhoneNumber,
  CartItem,
  CustomerInfo,
  OrderModeType 
} from "@/lib/whatsapp";
import { logOrderHistory } from "@/utils/orderHistory";
import PublicMenuSkeleton from "@/components/menu/PublicMenuSkeleton";
import { generateHoverColor } from "@/components/branding/RestaurantBranding";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { StickySearchHeader } from "@/components/menu/StickySearchHeader";
import { RestaurantBrandingHeader } from "@/components/menu/RestaurantBrandingHeader";
import { RestaurantFeedbackDisplay } from "@/components/menu/RestaurantFeedbackDisplay";
import { EnhancedCartBar } from "@/components/menu/EnhancedCartBar";
import { CartDrawer } from "@/components/menu/CartDrawer";
import { RestaurantOverview } from "@/components/menu/RestaurantOverview";
import { RestaurantOSPromo } from "@/components/branding/RestaurantOSPromo";
import { FeedbackModal } from "@/components/menu/FeedbackModal";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  phone_number: string | null;
  logo_url: string | null;
  primary_color: string | null;
  is_active: boolean;
  address: string | null;
  description: string | null;
  delivery_fee?: number;
  branch_name?: string | null;
  subscription_plan?: string;
  social_media_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
  is_available: boolean;
  display_order: number;
  is_featured?: boolean;
}

const PublicMenu = (): JSX.Element => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  const { t, isRTL } = useTranslation();
  
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, comment: "" });
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  // Animation controls
  const cartAnimation = useAnimation();
  const categoryTabsRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      console.log("PublicMenu: Fetching data for slug:", slug, "and tableId:", tableId);

      setLoading(true);
      setError(null);

      try {
        // Fetch tenant
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (tenantError) throw tenantError;
        if (!tenantData) throw new Error('Restaurant not found');

        console.log("PublicMenu: Fetched tenant:", tenantData.id);

        setTenant({
          ...tenantData,
          social_media_links: (tenantData.social_media_links as { facebook?: string; instagram?: string; twitter?: string } | null),
        });

        // Load table info if table ID is provided
        if (tableId) {
          try {
            const { data: table, error } = await supabase
              .from('restaurant_tables')
              .select('table_number')
              .eq('id', tableId)
              .eq('tenant_id', tenantData.id)
              .single();

            if (error) throw error;
            setTableNumber(table.table_number);
          } catch (error) {
            console.error('Error loading table info:', error);
          }
        }

        // Log menu view for analytics
        if (tenantData?.id) {
          const { error: logError } = await supabase.rpc('log_menu_view', { 
            tenant_id_param: tenantData.id 
          });
          if (logError) {
            console.error('Error logging menu view:', logError);
          }
        }

        if (tenantData.primary_color) {
          document.documentElement.style.setProperty('--custom-primary', tenantData.primary_color);
          document.documentElement.style.setProperty('--custom-primary-hover', generateHoverColor(tenantData.primary_color));
        }

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('tenant_id', tenantData.id)
          .eq('is_active', true)
          .order('display_order');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch menu items
        const { data: itemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('tenant_id', tenantData.id)
          .eq('is_available', true)
          .order('display_order');

        if (itemsError) throw itemsError;
        setMenuItems(itemsData || []);

        if (categoriesData && categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].id);
        }

      } catch (error: any) {
        console.error('Error fetching menu data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, tableId]);

  // Cart functions
  const addToCart = async (item: MenuItem) => {
    setIsAddingToCart(item.id);
    
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        quantity: 1 
      }]);
    }

    // Animate cart icon
    await cartAnimation.start({
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 }
    });

    toast.success(`${item.name} أُضيف إلى السلة`, {
      duration: 2000,
      position: "bottom-center",
    });

    setTimeout(() => setIsAddingToCart(null), 300);
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    } else {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ));
    }
  };

  const updateCartItemNotes = (itemId: string, notes: string) => {
    setCart(cart.map(cartItem =>
      cartItem.id === itemId
        ? { ...cartItem, notes }
        : cartItem
    ));
  };

  const getItemQuantity = (itemId: string): number => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
      toast.success("تم إزالة العنصر من المفضلة", { duration: 2000 });
    } else {
      newFavorites.add(itemId);
      toast.success("تم إضافة العنصر إلى المفضلة", { duration: 2000 });
    }
    setFavorites(newFavorites);
  };

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      // Calculate offset for sticky header (approximately 160px for better positioning)
      const headerOffset = 160;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveCategory(categoryId);
    }
  };

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    let items = menuItems;
    
    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return items;
  }, [menuItems, searchQuery]);

  const getItemsForCategory = (categoryId: string) => {
    return filteredItems.filter(item => item.category_id === categoryId);
  };

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString()} ل.س`;
  };

  const handleWhatsAppOrder = async (orderData: {
    orderType: OrderModeType;
    customerInfo?: CustomerInfo;
    orderNotes?: string;
  }) => {
    if (!tenant?.phone_number) {
      toast.error("رقم هاتف المطعم غير متوفر");
      return;
    }

    if (!validatePhoneNumber(tenant.phone_number)) {
      toast.error("رقم هاتف المطعم غير صحيح");
      return;
    }

    if (cart.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    setIsProcessingOrder(true);

    try {
      const cartId = `CART-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const subtotal = totalPrice;
      const deliveryFee = orderData.orderType.value === 'delivery' ? (tenant.delivery_fee || 0) : 0;
      const finalTotal = subtotal + deliveryFee;

      // Determine order type based on table presence
      const finalOrderType = tableNumber ? 
        { ...orderData.orderType, name: `تناول في المطعم - طاولة ${tableNumber}` } : 
        orderData.orderType;

      // Update customer info with table number if present
      const finalCustomerInfo = tableNumber ? {
        ...orderData.customerInfo,
        name: orderData.customerInfo?.name || `زبون الطاولة ${tableNumber}`,
        phone: orderData.customerInfo?.phone || tenant.phone_number || "",
        tableNumber
      } : orderData.customerInfo;

      try {
        // Create POS order for ALL orders (with approval workflow)
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const posOrderData = {
          tenant_id: tenant.id,
          order_number: orderNumber,
          status: 'pending_approval', // All orders need approval first
          items: cart as any, // Convert to JSON
          customer_info: finalCustomerInfo as any, // Convert to JSON
          total_amount: finalTotal,
          order_type: tableNumber ? 'table' : 'whatsapp',
          table_id: tableId,
          notes: tableNumber ? `Ordered via table QR (Table ${tableNumber})` : 'Ordered via WhatsApp'
        };

        console.log("PublicMenu: Creating POS order with data:", posOrderData);

        const { data, error: posError } = await supabase
          .from('pos_orders')
          .insert(posOrderData)
          .select();

        if (posError) {
          console.error('PublicMenu: Error creating POS order:', posError);
          throw posError;
        }

        console.log("PublicMenu: Successfully created POS order:", data);

        if (tableNumber) {
          toast.success(`تم إرسال طلب الطاولة ${tableNumber} بنجاح!`);
        } else {
          toast.success("تم إرسال طلبك بنجاح!");
        }
      } catch (error) {
        console.error('Error creating POS order:', error);
        // Continue with WhatsApp as fallback
      }

      // Log WhatsApp click analytics
      try {
        await supabase.rpc('log_whatsapp_click', {
          tenant_id_param: tenant.id,
          cart_total_param: finalTotal,
          items_count_param: totalItems,
          order_type_param: finalOrderType.name,
          cart_id_param: cartId,
          customer_phone_param: finalCustomerInfo?.phone,
          customer_name_param: finalCustomerInfo?.name,
        });
      } catch (error) {
        console.log('Analytics logging failed:', error);
      }

      // Generate comprehensive WhatsApp message
      const message = generateWhatsAppMessage({
        restaurantName: tenant.name,
        branchName: tenant.branch_name || undefined,
        items: cart,
        orderType: finalOrderType.name,
        customerInfo: finalCustomerInfo,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        discount: 0,
        totalPrice: finalTotal,
        cartId: cartId,
        orderNotes: orderData.orderNotes,
      });

      openWhatsApp(tenant.phone_number, message);

      // Log order to history for analytics
      try {
        await logOrderHistory({
          tenant_id: tenant.id,
          cart_id: cartId,
          customer_name: finalCustomerInfo?.name,
          customer_phone: finalCustomerInfo?.phone,
          order_type: 'whatsapp',
          order_mode: finalOrderType.value,
          items_count: totalItems,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          discount: 0,
          total_amount: finalTotal,
          order_data: {
            items: cart,
            orderType: finalOrderType.name,
            customerInfo: finalCustomerInfo,
            orderNotes: orderData.orderNotes,
            restaurantName: tenant.name,
            message: message,
            tableNumber: tableNumber,
          },
          customer_notes: orderData.orderNotes,
        });
      } catch (error) {
        console.log('Order history logging failed:', error);
      }

      // Clear cart and close drawer
      setCart([]);
      setShowCart(false);
      
      if (!tableNumber) {
        toast.success("تم إرسال طلبك عبر الواتساب!");
      }

    } catch (error: any) {
      console.error('Error processing order:', error);
      toast.error("حدث خطأ أثناء معالجة الطلب");
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (loading) return <PublicMenuSkeleton />;
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="max-w-md w-full shadow-warm text-center">
          <CardContent className="p-8">
            <div className="text-destructive text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">خطأ في تحميل القائمة</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tenant) return null;

  return (
    <div className="min-h-screen bg-gradient-subtle" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Restaurant Branding Header - Non-sticky */}
      <RestaurantBrandingHeader
        tenant={tenant}
        onFeedbackClick={() => setShowFeedback(true)}
      />

      {/* Sticky Search and Category Navigation */}
      <StickySearchHeader
        categories={categories}
        activeCategory={activeCategory || ''}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCategorySelect={scrollToCategory}
        tableNumber={tableNumber}
      />

      {/* Restaurant Overview */}
      <RestaurantOverview tenant={tenant} />

      {/* Menu Content - Grid Layout */}
      <div className="container mx-auto px-4 py-0 pb-32">
        {categories.map((category) => {
          const categoryItems = getItemsForCategory(category.id);
          if (categoryItems.length === 0 && searchQuery) return null;
          
          return (
            <motion.section
              key={category.id}
              id={`category-${category.id}`}
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Utensils className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <Separator className="flex-1" />
              </div>

              {/* Responsive Grid Layout */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {categoryItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantity={getItemQuantity(item.id)}
                    isFavorite={favorites.has(item.id)}
                    isAddingToCart={isAddingToCart === item.id}
                    onAddToCart={() => addToCart(item)}
                    onRemoveFromCart={() => removeFromCart(item.id)}
                    onToggleFavorite={() => toggleFavorite(item.id)}
                    onViewDetails={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Enhanced Cart Bar */}
      {totalItems > 0 && (
        <EnhancedCartBar
          cart={cart}
          totalPrice={totalPrice}
          totalItems={totalItems}
          onShowCart={() => setShowCart(true)}
          restaurantName={tenant.name}
          cartAnimation={cartAnimation}
        />
      )}

      {/* Enhanced Cart Drawer */}
      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onUpdateQuantity={updateCartItemQuantity}
        onUpdateItemNotes={updateCartItemNotes}
        onSubmitOrder={handleWhatsAppOrder}
        restaurantName={tenant.name}
        deliveryFee={tenant.delivery_fee || 0}
        isProcessingOrder={isProcessingOrder}
      />

      {/* Item Details Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-md mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedItem.image_url && (
                  <div className="flex justify-center">
                    <LazyLoadImage
                      src={selectedItem.image_url}
                      alt={selectedItem.name}
                      className="w-full max-w-sm h-48 object-cover rounded-lg mx-auto"
                      effect="blur"
                    />
                  </div>
                )}
                {selectedItem.description && (
                  <p className="text-muted-foreground">{selectedItem.description}</p>
                )}
                <p className="text-lg font-bold text-primary">
                  {formatPrice(selectedItem.price)}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setSelectedItem(null)} className="flex-1">
                    إغلاق
                  </Button>
                  <Button
                    onClick={() => {
                      addToCart(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="flex-1"
                  >
                    إضافة للسلة
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        tenantId={tenant.id}
        restaurantName={tenant.name}
      />

      {/* Customer Feedback Display - Moved to bottom */}
      <div id="customer-reviews" className="container mx-auto px-4 py-8">
        <RestaurantFeedbackDisplay tenantId={tenant.id} />
      </div>

      {/* RestaurantOS Promo Footer */}
      <RestaurantOSPromo 
        plan={tenant.subscription_plan as 'free' | 'starter' | 'premium' || 'free'} 
      />
    </div>
  );
};

export default PublicMenu;
