import { toast } from "sonner";

/**
 * Represents an item in the shopping cart with enhanced features.
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

/**
 * Represents the customer's information for an order.
 * @property {string} name - The customer's name.
 * @property {string} phone - The customer's phone number.
 * @property {string} [tableNumber] - The table number for dine-in orders.
 * @property {string} [deliveryAddress] - The delivery address for delivery orders.
 */
export interface CustomerInfo {
  name: string;
  phone: string;
  tableNumber?: string;
  deliveryAddress?: string;
}

/**
 * Defines the mode of an order (e.g., dine-in, takeaway).
 * @property {string} id - The unique identifier for the order mode.
 * @property {string} name - The display name of the order mode.
 * @property {'dine_in' | 'takeaway' | 'delivery'} value - The value of the order mode.
 */
export interface OrderModeType {
  id: string;
  name: string;
  value: 'dine_in' | 'takeaway' | 'delivery';
}

/**
 * Enhanced data structure for WhatsApp message generation.
 */
export interface WhatsAppMessageData {
  restaurantName: string;
  branchName?: string;
  items: CartItem[];
  orderType: string;
  customerInfo?: CustomerInfo;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalPrice: number;
  paymentMethod?: string;
  preferredTime?: string;
  cartId: string;
  orderNotes?: string;
}

/**
 * Generates a comprehensive Arabic WhatsApp message for orders.
 * Keeps lines under 75 characters for WhatsApp compatibility.
 */
export const generateWhatsAppMessage = (data: WhatsAppMessageData): string => {
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ل.س`;
  };

  const timestamp = new Date().toISOString();
  const displayTime = new Date().toLocaleString("ar", {
    year: "numeric",
    month: "2-digit", 
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  let message = "طلب جديد عبر القائمة الرقمية\n";
  message += `المطعم: ${data.restaurantName}`;
  
  if (data.branchName) {
    message += ` | الفرع: ${data.branchName}`;
  }
  message += "\n";

  message += `نوع الطلب: ${data.orderType}\n`;

  if (data.customerInfo) {
    message += `اسم الزبون: ${data.customerInfo.name}\n`;
    message += `هاتف: ${data.customerInfo.phone}\n`;
    
    if (data.customerInfo.tableNumber) {
      message += `طاولة: ${data.customerInfo.tableNumber}\n`;
    }
    
    if (data.customerInfo.deliveryAddress) {
      message += `العنوان: ${data.customerInfo.deliveryAddress}\n`;
    }
  }

  message += "\nالطلبات:\n";
  
  data.items.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    message += `- ${item.name} ×${item.quantity}`;
    message += ` @ ${formatPrice(item.price)}`;
    message += ` = ${formatPrice(lineTotal)}\n`;
    
    if (item.notes) {
      message += `  ملاحظات: ${item.notes}\n`;
    }
  });

  message += `\nالمجموع الفرعي: ${formatPrice(data.subtotal)}\n`;
  
  if (data.deliveryFee > 0) {
    message += `رسوم التوصيل: ${formatPrice(data.deliveryFee)}\n`;
  }
  
  if (data.discount > 0) {
    message += `خصم: ${formatPrice(data.discount)}\n`;
  }
  
  message += `الإجمالي: ${formatPrice(data.totalPrice)}\n\n`;
  
  message += `طريقة الدفع: ${data.paymentMethod || "نقداً عند الاستلام"}\n`;
  
  if (data.preferredTime) {
    message += `الوقت المفضل: ${data.preferredTime}\n`;
  }
  
  if (data.orderNotes) {
    message += `ملاحظات إضافية: ${data.orderNotes}`;
  }

  return message;
};

/**
 * Opens WhatsApp with a pre-filled message.
 * It handles both mobile and desktop devices and supports international phone numbers.
 *
 * @param {string} phoneNumber - The phone number to send the message to.
 * @param {string} message - The message to send.
 */
export const openWhatsApp = (phoneNumber: string, message: string): void => {
  // Clean phone number - remove any non-digits except +
  let cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

  // If number doesn't start with + and doesn't already have country code, 
  // assume it needs country code but don't hardcode Lebanon
  if (!cleanNumber.startsWith("+")) {
    // If it starts with 0, remove the leading zero
    if (cleanNumber.startsWith("0")) {
      cleanNumber = cleanNumber.substring(1);
    }
    // Don't add any country code - user should provide full international number
  }

  // Remove + for WhatsApp URL
  if (cleanNumber.startsWith("+")) {
    cleanNumber = cleanNumber.substring(1);
  }

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  // Try to open WhatsApp app first, fallback to web
  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    // Try to open WhatsApp app directly
    const appUrl = `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;
    
    // Use window.open instead of window.location.href for better compatibility
    const whatsappWindow = window.open(appUrl, "_blank");
    
    // If window.open fails (blocked or app not found), try web WhatsApp
    if (!whatsappWindow || whatsappWindow.closed) {
      window.open(whatsappUrl, "_blank");
    } else {
      // Show success message
      toast.success("Opening WhatsApp...", {
        duration: 2000,
      });
    }
  } else {
    // On desktop, open web WhatsApp
    window.open(whatsappUrl, "_blank");
  }
};

/**
 * Validates an international phone number.
 *
 * @param {string} phoneNumber - The phone number to validate.
 * @returns {boolean} True if the phone number is valid, false otherwise.
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Universal international phone number validation
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

  // Check for various international number patterns
  const patterns = [
    /^\+\d{7,15}$/, // International format: +1234567890 (7-15 digits)
    /^\d{7,15}$/, // National format: 1234567890 (7-15 digits)
  ];

  return patterns.some((pattern) => pattern.test(cleanNumber));
};