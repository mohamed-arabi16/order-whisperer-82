import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

interface Tenant {
  id: string;
  name: string;
  subscription_plan: string;
  is_active: boolean;
}

const POSAccess = (): JSX.Element => {
  const { slug } = useParams();
  const { t, isRTL } = useTranslation();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('id, name, subscription_plan, is_active')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setTenant(data);
      } catch (error: any) {
        console.error('Error fetching tenant:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="text-destructive text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">Restaurant Not Found</h2>
            <p className="text-muted-foreground">The requested restaurant could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if tenant has premium subscription
  if (tenant.subscription_plan === 'premium') {
    return <Navigate to={`/pos-system/${slug}`} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">{t('posAccess.premiumRequired')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {t('posAccess.upgradePrompt')}
            </p>
            <Badge variant="outline" className="mb-4">
              {tenant.name} - {t(`plans.${tenant.subscription_plan}`)}
            </Badge>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              {t('posAccess.availableFeatures')}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t('posAccess.featureList.orderManagement')}</p>
              <p>{t('posAccess.featureList.kitchenDisplay')}</p>
              <p>{t('posAccess.featureList.realTimeUpdates')}</p>
              <p>{t('posAccess.featureList.analytics')}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
              {t('common.back')}
            </Button>
            <Button 
              variant="hero" 
              className="flex-1"
              onClick={() => {
                toast.info("Contact support to upgrade to Premium plan");
              }}
            >
              {t('common.upgrade')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default POSAccess;