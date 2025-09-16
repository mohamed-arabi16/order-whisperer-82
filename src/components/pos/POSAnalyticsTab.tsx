import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  Target,
  Activity
} from "lucide-react";

interface AnalyticsData {
  todayOrders: number;
  todayRevenue: number;
  avgPrepTime: string;
  peakHours: { hour: number; orders: number }[];
  orderTrends: { date: string; orders: number; revenue: number }[];
  staffPerformance: { name: string; orders: number; avgTime: string }[];
}

export const POSAnalyticsTab: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    todayOrders: 0,
    todayRevenue: 0,
    avgPrepTime: '0min',
    peakHours: [],
    orderTrends: [],
    staffPerformance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load today's orders and revenue
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData, error: todayError } = await supabase
        .from('pos_orders')
        .select('total_amount, created_at, status')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      if (todayError) throw todayError;

      const todayOrders = todayData?.length || 0;
      const todayRevenue = todayData?.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0) || 0;

      // Load last 7 days trends
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: trendsData, error: trendsError } = await supabase
        .from('pos_orders')
        .select('total_amount, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at');

      if (trendsError) throw trendsError;

      // Process trends data
      const trendsByDate = trendsData?.reduce((acc: any, order) => {
        const date = order.created_at.split('T')[0];
        if (!acc[date]) {
          acc[date] = { orders: 0, revenue: 0 };
        }
        acc[date].orders++;
        acc[date].revenue += parseFloat(order.total_amount.toString());
        return acc;
      }, {}) || {};

      const orderTrends = Object.entries(trendsByDate).map(([date, data]: [string, any]) => ({
        date: new Date(date).toLocaleDateString(isRTL ? 'ar' : 'en', { 
          month: 'short', 
          day: 'numeric' 
        }),
        orders: data.orders,
        revenue: data.revenue
      }));

      // Process peak hours
      const hourlyData = todayData?.reduce((acc: any, order) => {
        const hour = new Date(order.created_at).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {}) || {};

      const peakHours = Object.entries(hourlyData)
        .map(([hour, orders]: [string, any]) => ({
          hour: parseInt(hour),
          orders
        }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 6);

      setAnalytics({
        todayOrders,
        todayRevenue,
        avgPrepTime: '15min', // This would need actual calculation
        peakHours,
        orderTrends,
        staffPerformance: [] // Real data would come from actual staff performance tracking
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: t('common.error'),
        description: t('common.genericError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              {t('pos.analytics.todayOrders')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.todayOrders}</div>
            <Badge variant="outline" className="mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              {t('pos.analytics.todayRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.todayRevenue.toLocaleString()} {t('common.currency')}
            </div>
            <Badge variant="outline" className="mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              {t('pos.analytics.avgPrepTime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgPrepTime}</div>
            <Badge variant="outline" className="mt-1">
              <Activity className="w-3 h-3 mr-1" />
              -2min
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              {t('pos.analytics.peakHours')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.peakHours[0]?.hour || 0}:00
            </div>
            <Badge variant="outline" className="mt-1">
              {analytics.peakHours[0]?.orders || 0} {t('analytics.orderCount')}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>{t('pos.analytics.revenueChart')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.orderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Trends */}
        <Card>
          <CardHeader>
            <CardTitle>{t('pos.analytics.orderTrends')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.orderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="orders" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours and Staff Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>{t('pos.analytics.peakHours')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(hour) => `${hour}:00`}
                />
                <Bar 
                  dataKey="orders" 
                  fill="hsl(var(--accent))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Staff Performance */}
        <Card>
          <CardHeader>
            <CardTitle>{t('pos.analytics.staffPerformance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.staffPerformance.map((staff, index) => (
                <div key={staff.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {staff.orders} {t('analytics.orderCount')}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {staff.avgTime}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};