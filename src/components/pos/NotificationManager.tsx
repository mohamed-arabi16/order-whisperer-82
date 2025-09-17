import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare,
  Settings,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

/**
 * @interface NotificationPreferences
 * @property {boolean} new_order_sound - Whether to play a sound for new orders.
 * @property {boolean} urgent_order_alert - Whether to show an alert for urgent orders.
 * @property {boolean} browser_notifications - Whether to show browser notifications.
 * @property {boolean} email_notifications - Whether to send email notifications.
 * @property {boolean} sms_notifications - Whether to send SMS notifications.
 */
interface NotificationPreferences {
  new_order_sound: boolean;
  urgent_order_alert: boolean;
  browser_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

/**
 * A component for managing notification preferences for the POS system.
 */
export const NotificationManager: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    new_order_sound: true,
    urgent_order_alert: true,
    browser_notifications: true,
    email_notifications: false,
    sms_notifications: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (user) {
      loadPreferences();
      checkBrowserPermission();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          new_order_sound: data.new_order_sound,
          urgent_order_alert: data.urgent_order_alert,
          browser_notifications: data.browser_notifications,
          email_notifications: data.email_notifications,
          sms_notifications: data.sms_notifications
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBrowserPermission = () => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  };

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      
      if (permission === 'granted') {
        toast.success("تم منح الإذن - سيتم عرض الإشعارات في المتصفح الآن");
      } else {
        toast.error("تم رفض الإذن - لن يتم عرض إشعارات المتصفح");
      }
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      setSaving(true);
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user?.id,
          tenant_id: user?.user_metadata?.tenant_id,
          ...updatedPreferences
        });

      if (error) throw error;

      setPreferences(updatedPreferences);
      
      toast.success("تم تحديث إعدادات الإشعارات بنجاح");
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const testNotification = () => {
    if (preferences.browser_notifications && browserPermission === 'granted') {
      new Notification('RestaurantOS POS', {
        body: 'هذا إشعار تجريبي من نظام نقاط البيع',
        icon: '/pwa-192x192.png',
        tag: 'test-notification'
      });
    }

    if (preferences.new_order_sound) {
      // Play notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIYBjiNz+/OfC0EJXHBzi2Qa/CaedCDfKi8h');
      audio.play().catch(() => {
        // Ignore audio errors
      });
    }

    toast.success("تم إرسال الإشعار التجريبي بنجاح");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-6 bg-muted rounded w-12"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('pos.notifications.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            تخصيص إعدادات الإشعارات لنظام نقاط البيع
          </p>
        </div>
        <Button onClick={testNotification} variant="outline" disabled={saving}>
          <Bell className="w-4 h-4 mr-2" />
          اختبار الإشعار
        </Button>
      </div>

      {/* Browser Permission Status */}
      {preferences.browser_notifications && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">إذن إشعارات المتصفح</div>
                  <div className="text-sm text-muted-foreground">
                    {browserPermission === 'granted' ? 'مُفعل' : 
                     browserPermission === 'denied' ? 'مرفوض' : 'في انتظار الإذن'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={browserPermission === 'granted' ? 'default' : 'secondary'}
                  className={browserPermission === 'granted' ? 'bg-green-500' : ''}
                >
                  {browserPermission === 'granted' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                   <AlertTriangle className="w-3 h-3 mr-1" />}
                  {browserPermission === 'granted' ? 'مُفعل' : 
                   browserPermission === 'denied' ? 'مرفوض' : 'غير مُحدد'}
                </Badge>
                {browserPermission !== 'granted' && (
                  <Button size="sm" onClick={requestBrowserPermission}>
                    طلب الإذن
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            إعدادات الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Sound Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preferences.new_order_sound ? (
                  <Volume2 className="w-5 h-5 text-primary" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <div className="font-medium">{t('pos.notifications.newOrderSound')}</div>
                  <div className="text-sm text-muted-foreground">
                    تشغيل صوت عند وصول طلب جديد
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.new_order_sound}
                onCheckedChange={(checked) => 
                  updatePreferences({ new_order_sound: checked })
                }
                disabled={saving}
              />
            </div>

            {/* Urgent Alerts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-medium">{t('pos.notifications.urgentAlert')}</div>
                  <div className="text-sm text-muted-foreground">
                    تنبيهات خاصة للطلبات العاجلة والمتأخرة
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.urgent_order_alert}
                onCheckedChange={(checked) => 
                  updatePreferences({ urgent_order_alert: checked })
                }
                disabled={saving}
              />
            </div>

            {/* Browser Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium">{t('pos.notifications.browserNotifications')}</div>
                  <div className="text-sm text-muted-foreground">
                    إشعارات المتصفح للطلبات الجديدة
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.browser_notifications}
                onCheckedChange={(checked) => 
                  updatePreferences({ browser_notifications: checked })
                }
                disabled={saving}
              />
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium">{t('pos.notifications.emailNotifications')}</div>
                  <div className="text-sm text-muted-foreground">
                    إشعارات البريد الإلكتروني (قريباً)
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => 
                  updatePreferences({ email_notifications: checked })
                }
                disabled={true} // Disabled for now
              />
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="font-medium">{t('pos.notifications.smsNotifications')}</div>
                  <div className="text-sm text-muted-foreground">
                    إشعارات الرسائل النصية (قريباً)
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.sms_notifications}
                onCheckedChange={(checked) => 
                  updatePreferences({ sms_notifications: checked })
                }
                disabled={true} // Disabled for now
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            <strong>ملاحظة:</strong> للحصول على أفضل تجربة، تأكد من منح الإذن لإشعارات المتصفح. 
            يمكنك أيضاً ضبط مستوى الصوت من إعدادات نظام التشغيل.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};