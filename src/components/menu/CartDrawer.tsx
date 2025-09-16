import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { 
  Loader2, Minus, Plus, ChevronDown, ChevronUp, 
  Store, Car, Truck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CartItem, CustomerInfo, OrderModeType } from "@/lib/whatsapp";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onUpdateItemNotes: (itemId: string, notes: string) => void;
  onSubmitOrder: (orderData: {
    orderType: OrderModeType;
    customerInfo?: CustomerInfo;
    orderNotes?: string;
  }) => void;
  restaurantName: string;
  deliveryFee: number;
  isProcessingOrder: boolean;
}

const orderModes: OrderModeType[] = [
  { id: 'dine_in', name: 'صالة', value: 'dine_in' },
  { id: 'takeaway', name: 'سفري', value: 'takeaway' }, 
  { id: 'delivery', name: 'توصيل', value: 'delivery' },
];

const orderModeIcons = {
  dine_in: Store,
  takeaway: Car,
  delivery: Truck,
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onUpdateItemNotes,
  onSubmitOrder,
  restaurantName,
  deliveryFee,
  isProcessingOrder,
}) => {
  const [selectedOrderMode, setSelectedOrderMode] = useState<OrderModeType>(orderModes[0]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    tableNumber: '',
    deliveryAddress: '',
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString()} ل.س`;
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const currentDeliveryFee = selectedOrderMode.value === 'delivery' ? deliveryFee : 0;
  const totalPrice = subtotal + currentDeliveryFee;

  const toggleItemExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleSubmitOrder = () => {
    const orderData = {
      orderType: selectedOrderMode,
      customerInfo: customerInfo.name || customerInfo.phone ? customerInfo : undefined,
      orderNotes: orderNotes || undefined,
    };
    onSubmitOrder(orderData);
  };

  const isFormValid = cart.length > 0 && 
    (selectedOrderMode.value !== 'delivery' || 
     (customerInfo.name && customerInfo.phone && customerInfo.deliveryAddress));

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-center border-b pb-4">
          <DrawerTitle className="text-xl">سلة التسوق</DrawerTitle>
          <p className="text-sm text-muted-foreground">{restaurantName}</p>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Order Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">نوع الطلب</Label>
            <RadioGroup
              value={selectedOrderMode.id}
              onValueChange={(value) => {
                const mode = orderModes.find(m => m.id === value)!;
                setSelectedOrderMode(mode);
              }}
              className="grid grid-cols-3 gap-2"
            >
              {orderModes.map((mode) => {
                const Icon = orderModeIcons[mode.value];
                return (
                  <Label
                    key={mode.id}
                    htmlFor={mode.id}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedOrderMode.id === mode.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={mode.id} id={mode.id} className="sr-only" />
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">{mode.name}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Customer Information */}
          <AnimatePresence>
            {(selectedOrderMode.value === 'delivery' || selectedOrderMode.value === 'dine_in') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3"
              >
                <Label className="text-base font-semibold">معلومات الزبون</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="customerName" className="text-sm">الاسم</Label>
                    <Input
                      id="customerName"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="اسم الزبون"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone" className="text-sm">رقم الهاتف</Label>
                    <Input
                      id="customerPhone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="رقم الهاتف"
                      className="mt-1"
                    />
                  </div>
                </div>

                {selectedOrderMode.value === 'dine_in' && (
                  <div>
                    <Label htmlFor="tableNumber" className="text-sm">رقم الطاولة</Label>
                    <Input
                      id="tableNumber"
                      value={customerInfo.tableNumber}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, tableNumber: e.target.value }))}
                      placeholder="رقم الطاولة (اختياري)"
                      className="mt-1"
                    />
                  </div>
                )}

                {selectedOrderMode.value === 'delivery' && (
                  <div>
                    <Label htmlFor="deliveryAddress" className="text-sm">عنوان التوصيل</Label>
                    <Textarea
                      id="deliveryAddress"
                      value={customerInfo.deliveryAddress}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      placeholder="عنوان التوصيل الكامل..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cart Items */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">عناصر الطلب ({cart.length})</Label>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Item Notes */}
                  <Collapsible
                    open={expandedItems.has(item.id)}
                    onOpenChange={() => toggleItemExpanded(item.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full mt-2 justify-between">
                        <span>إضافة ملاحظات</span>
                        {expandedItems.has(item.id) ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <Textarea
                        value={item.notes || ''}
                        onChange={(e) => onUpdateItemNotes(item.id, e.target.value)}
                        placeholder="مثال: بدون بصل، إضافة جبنة..."
                        rows={2}
                        className="text-sm"
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </div>

          {/* Order Notes */}
          <div className="space-y-2">
            <Label htmlFor="orderNotes" className="text-base font-semibold">ملاحظات الطلب</Label>
            <Textarea
              id="orderNotes"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="ملاحظات إضافية للطلب..."
              rows={2}
            />
          </div>
        </div>

        <DrawerFooter className="border-t pt-4">
          {/* Price Summary */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>المجموع الفرعي:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            {currentDeliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>رسوم التوصيل:</span>
                <span>{formatPrice(currentDeliveryFee)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>الإجمالي:</span>
              <span className="text-primary">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <Button
            onClick={handleSubmitOrder}
            disabled={!isFormValid || isProcessingOrder}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isProcessingOrder ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                جاري الإرسال...
              </>
            ) : (
              "إرسال الطلب عبر واتساب"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};