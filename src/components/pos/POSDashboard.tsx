import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChefHat,
  Monitor,
  Bell,
  RefreshCw,
  BarChart3,
  Settings,
  Table,
  Wifi,
  WifiOff,
  Users
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { POSAnalyticsTab } from "./POSAnalyticsTab";
import { TableManagementTab } from "./TableManagementTab";
import { NotificationManager } from "./NotificationManager";
import StaffManagement from "./StaffManagement";
import ShiftManagement from "./ShiftManagement";

/**
 * @interface POSOrder
 * @property {string} id - The unique identifier for the order.
 * @property {string} order_number - The order number.
 * @property {'pending_approval' | 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled'} status - The status of the order.
 * @property {string} order_type - The type of the order.
 * @property {string} [table_id] - The ID of the table for dine-in orders.
 * @property {{ name?: string; phone?: string; }} [customer_info] - The customer's information.
 * @property {any[]} items - An array of items in the order.
 * @property {number} total_amount - The total amount of the order.
 * @property {string} [notes] - Any notes for the order.
 * @property {string} created_at - The timestamp when the order was created.
 * @property {string} updated_at - The timestamp when the order was last updated.
 * @property {string} [approved_by] - The ID of the user who approved the order.
 * @property {string} [approved_at] - The timestamp when the order was approved.
 */
interface POSOrder {
  id: string;
  order_number: string;
  status: 'pending_approval' | 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  order_type: string;
  table_id?: string;
  customer_info?: {
    name?: string;
    phone?: string;
  };
  items: any[];
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

/**
 * The main dashboard for the Point of Sale (POS) system.
 * It provides a comprehensive view of orders, analytics, and management tools.
 */
export const POSDashboard: React.FC = () => {
  const { t, isRTL, language } = useTranslation();
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<POSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineOrders, setOfflineOrders] = useState<POSOrder[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tablesMap, setTablesMap] = useState<Record<string, { table_number: string }>>({});

  // Setup offline detection only; orders will load once tenantId is known
  useEffect(() => {
    // Setup offline detection
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineOrders();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch tenant for the logged-in owner
  useEffect(() => {
    const fetchTenant = async () => {
      if (!user) return;
      try {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (!profileRow) return;
        const { data: tenant } = await supabase
          .from('tenants')
          .select('id')
          .eq('owner_id', profileRow.id)
          .single();
        setTenantId(tenant?.id || null);
      } catch (err) {
        console.error('Error fetching tenant for POS:', err);
      }
    };
    fetchTenant();
  }, [user]);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIYBjiNz+/OfC0EJXHBzi2');
      audio.play().catch(() => {
        // Ignore audio errors in case user hasn't interacted with page
      });
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }, []);

  const fetchAndCacheTable = useCallback(async (tableId: string) => {
    if (tablesMap[tableId]) return;

    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('id, table_number')
        .eq('id', tableId)
        .single();

      if (error) throw error;

      if (data) {
        setTablesMap(prev => ({
          ...prev,
          [data.id]: { table_number: data.table_number }
        }));
      }
    } catch (error) {
      console.error(`Error fetching and caching table ${tableId}:`, error);
    }
  }, [tablesMap]);

  const loadOrders = useCallback(async () => {
    try {
      if (!tenantId) return;
      const { data, error } = await supabase
        .from('pos_orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders((data || []) as POSOrder[]);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error(t('pos.dashboard.loadError'));
    } finally {
      setLoading(false);
    }
  }, [tenantId, t]);

  const loadTables = useCallback(async () => {
    try {
      if (!tenantId) return;
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('id, table_number')
        .eq('tenant_id', tenantId);

      if (error) throw error;
      
      const tableMap = (data || []).reduce((acc, table) => {
        acc[table.id] = { table_number: table.table_number };
        return acc;
      }, {} as Record<string, { table_number: string }>);
      
      setTablesMap(tableMap);
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  }, [tenantId]);

  const subscribeToOrders = useCallback(() => {
    if (!tenantId) return () => {};

    const channel = supabase
      .channel('pos-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pos_orders',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          console.log('POS Order change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as POSOrder;
            setOrders(prev => [newOrder, ...prev]);

            if (newOrder.table_id && !tablesMap[newOrder.table_id]) {
              fetchAndCacheTable(newOrder.table_id);
            }
            
            toast.success(t('pos.dashboard.newOrderNotification', {
              orderNumber: newOrder.order_number,
              totalAmount: newOrder.total_amount,
              currency: t('common.currency')
            }));

            playNotificationSound();
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as POSOrder;
            setOrders(prev => 
              prev.map(order => 
                order.id === updatedOrder.id ? updatedOrder : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, t, tablesMap, fetchAndCacheTable, playNotificationSound]);

  // Load orders, tables and subscribe when tenantId is available
  useEffect(() => {
    if (tenantId) {
      loadOrders();
      loadTables();
      const unsubscribe = subscribeToOrders();
      return unsubscribe;
    }
  }, [tenantId, loadOrders, loadTables, subscribeToOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: POSOrder['status']) => {
    try {
      const { error } = await supabase
        .from('pos_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`${t('pos.dashboard.orderUpdated')} - ${t('pos.dashboard.statusChanged')} ${t(`pos.status.${newStatus}`)}`);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(t('pos.dashboard.updateError'));
    }
  };

  const getStatusColor = (status: POSOrder['status']) => {
    switch (status) {
      case 'pending_approval': return 'bg-orange-500 text-white';
      case 'new': return 'bg-blue-500 text-white';
      case 'preparing': return 'bg-yellow-500 text-white';
      case 'ready': return 'bg-green-500 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusIcon = (status: POSOrder['status']) => {
    switch (status) {
      case 'pending_approval': return <Bell className="w-4 h-4" />;
      case 'new': return <Bell className="w-4 h-4" />;
      case 'preparing': return <Clock className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filterOrdersByStatus = (status: POSOrder['status']) => {
    return orders.filter(order => order.status === status);
  };

  const filterActiveOrders = () => {
    return orders.filter(order => order.status !== 'pending_approval' && order.status !== 'completed' && order.status !== 'cancelled');
  };

  const syncOfflineOrders = async () => {
    if (offlineOrders.length === 0) return;
    
    try {
      for (const order of offlineOrders) {
        await supabase
          .from('pos_orders')
          .update({ status: order.status })
          .eq('id', order.id);
      }
      
      setOfflineOrders([]);
      toast.success(t('pos.offline.syncSuccessMessage', { count: offlineOrders.length }));
    } catch (error) {
      console.error('Error syncing offline orders:', error);
    }
  };

  const OrderCard: React.FC<{order: POSOrder}> = ({ order }) => (
    <div key={order.id} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className={getStatusColor(order.status)}>
            {getStatusIcon(order.status)}
            <span className="mr-1">{t(`pos.status.${order.status}`)}</span>
          </Badge>
          <span className="font-medium">#{order.order_number}</span>
          {order.table_id && tablesMap[order.table_id] && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {t('pos.dashboard.tableBadge', { tableNumber: tablesMap[order.table_id].table_number })}
            </Badge>
          )}
          <Badge variant="secondary">{t(`pos.orderTypes.${order.order_type}`) || order.order_type}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date(order.created_at).toLocaleTimeString(language, {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">{t('pos.dashboard.orderDetails')}:</h4>
          <div className="space-y-1 text-sm">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span>{item.name} x{item.quantity}</span>
                <span>{(item.price * item.quantity).toLocaleString()} {t('common.currency')}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 mt-2 font-medium">
            {t('common.total')}: {order.total_amount.toLocaleString()} {t('common.currency')}
          </div>
        </div>

        <div className="space-y-3">
          {order.customer_info && (
            <div>
              <h4 className="font-medium mb-1">{t('pos.dashboard.customerInfo')}:</h4>
              <div className="text-sm space-y-1">
                {order.customer_info.name && (
                  <div>{t('common.name')}: {order.customer_info.name}</div>
                )}
                {order.customer_info.phone && (
                  <div>{t('common.phone')}: {order.customer_info.phone}</div>
                )}
              </div>
            </div>
          )}

          {order.notes && (
            <div>
              <h4 className="font-medium mb-1">{t('common.notes')}:</h4>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {order.status === 'pending_approval' && (
              <>
                <Button size="sm" onClick={() => updateOrderStatus(order.id, 'new')}>
                  {t('pos.actions.approve')}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                  {t('pos.actions.reject')}
                </Button>
              </>
            )}
            {order.status === 'new' && (
              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                {t('pos.actions.startPreparing')}
              </Button>
            )}
            {order.status === 'preparing' && (
              <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'ready')}>
                {t('pos.actions.markReady')}
              </Button>
            )}
            {order.status === 'ready' && (
              <Button size="sm" variant="default" onClick={() => updateOrderStatus(order.id, 'completed')}>
                {t('pos.actions.markCompleted')}
              </Button>
            )}
            {(order.status === 'new' || order.status === 'preparing') && (
              <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                {t('pos.actions.cancel')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const OrderList: React.FC<{
    orders: POSOrder[];
    title: string;
    noOrdersMessage: string;
  }> = ({ orders, title, noOrdersMessage }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {noOrdersMessage}
            </div>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin">
          <RefreshCw className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('pos.dashboard.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('pos.dashboard.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              {t('pos.dashboard.offline')}
            </Badge>
          )}
          {isOnline && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              {t('pos.dashboard.online')}
            </Badge>
          )}
          <Button onClick={loadOrders} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('pos.dashboard.refresh')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" />
              {t('pos.dashboard.pendingApproval')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filterOrdersByStatus('pending_approval').length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500" />
              {t('pos.dashboard.newOrders')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filterOrdersByStatus('new').length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              {t('pos.dashboard.preparing')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filterOrdersByStatus('preparing').length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {t('pos.dashboard.ready')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filterOrdersByStatus('ready').length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              {t('pos.dashboard.completed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filterOrdersByStatus('completed').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {t('pos.dashboard.pendingApproval')}
            {filterOrdersByStatus('pending_approval').length > 0 && (
              <Badge className="ml-2 bg-orange-500 text-white">
                {filterOrdersByStatus('pending_approval').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            {t('pos.dashboard.orderQueue')}
          </TabsTrigger>
          <TabsTrigger value="kitchen" className="flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            {t('pos.dashboard.kitchenDisplay')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t('pos.dashboard.analytics')}
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Table className="w-4 h-4" />
            {t('pos.dashboard.tableManagement')}
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('pos.dashboard.staff')}
          </TabsTrigger>
          <TabsTrigger value="shifts" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('pos.dashboard.shifts')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t('pos.dashboard.notifications')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <OrderList
            orders={filterOrdersByStatus('pending_approval')}
            title={t('pos.dashboard.pendingApproval')}
            noOrdersMessage={t('pos.dashboard.noPendingOrders')}
          />
        </TabsContent>

        <TabsContent value="queue" className="mt-6">
          <OrderList
            orders={filterActiveOrders()}
            title={t('pos.dashboard.orderQueue')}
            noOrdersMessage={t('pos.dashboard.noActiveOrders')}
          />
        </TabsContent>

        <TabsContent value="kitchen" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                {t('pos.dashboard.kitchenDisplay')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterOrdersByStatus('preparing').length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    {t('pos.dashboard.noPreparingOrders')}
                  </div>
                ) : (
                  filterOrdersByStatus('preparing').map((order) => (
                  <Card key={order.id} className="border-l-4 border-l-yellow-500">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">#{order.order_number}</CardTitle>
                        <Badge variant="outline">
                          {new Date(order.created_at).toLocaleTimeString(language, {
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="font-medium">{item.name}</span>
                            <span>x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      {order.notes && (
                        <div className="mt-3 p-2 bg-muted rounded text-sm">
                          <strong>{t('common.notes')}:</strong> {order.notes}
                        </div>
                      )}
                      <Button 
                        className="w-full mt-3"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        {t('pos.actions.markReady')}
                      </Button>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <POSAnalyticsTab />
        </TabsContent>

        <TabsContent value="tables" className="mt-6">
          <TableManagementTab />
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <StaffManagement />
        </TabsContent>

        <TabsContent value="shifts" className="mt-6">
          <ShiftManagement />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};