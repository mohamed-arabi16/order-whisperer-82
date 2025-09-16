import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/lib/whatsapp";

interface OrderHistoryData {
  tenant_id: string;
  cart_id: string;
  customer_name?: string;
  customer_phone?: string;
  order_type: string;
  order_mode: string;
  items_count: number;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total_amount: number;
  order_data: any;
  customer_notes?: string;
}

/**
 * Generates a unique cart hash based on cart contents
 */
export const generateCartHash = (cart: CartItem[], timestamp: string): string => {
  const cartString = cart
    .map(item => `${item.id}-${item.quantity}-${item.notes || ''}`)
    .sort()
    .join('|');
  
  return btoa(`${cartString}-${timestamp}`).substring(0, 16);
};

/**
 * Logs order to the order history table for analytics
 */
export const logOrderHistory = async (
  orderData: OrderHistoryData
): Promise<void> => {
  try {
    const cartHash = generateCartHash(orderData.order_data.items || [], new Date().toISOString());
    
    const { error } = await supabase
      .from('order_history')
      .insert({
        ...orderData,
        cart_hash: cartHash,
      });

    if (error) {
      console.error('Error logging order history:', error);
      // Don't throw error to avoid disrupting the order flow
    }
  } catch (err) {
    console.error('Error logging order history:', err);
    // Don't throw error to avoid disrupting the order flow
  }
};

/**
 * Gets order history for a specific tenant
 */
export const getOrderHistory = async (
  tenantId: string,
  startDate?: Date,
  endDate?: Date
) => {
  try {
    let query = supabase
      .from('order_history')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error fetching order history:', err);
    throw err;
  }
};

/**
 * Gets order analytics for a tenant
 */
export const getOrderAnalytics = async (tenantId: string) => {
  try {
    const { data, error } = await supabase
      .from('order_history')
      .select(`
        id,
        created_at,
        total_amount,
        items_count,
        order_mode,
        order_type
      `)
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }

    // Calculate analytics
    const totalOrders = data.length;
    const totalRevenue = data.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by order mode
    const ordersByMode = data.reduce((acc, order) => {
      acc[order.order_mode] = (acc[order.order_mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = data.filter(
      order => new Date(order.created_at) >= thirtyDaysAgo
    );

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByMode,
      recentOrdersCount: recentOrders.length,
      recentRevenue: recentOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
    };
  } catch (err) {
    console.error('Error fetching order analytics:', err);
    throw err;
  }
};