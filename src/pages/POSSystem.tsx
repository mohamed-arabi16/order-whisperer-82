import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useParams } from "react-router-dom";
import { POSDashboard } from "@/components/pos/POSDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * POS System page component that displays the POS system dashboard
 * Only accessible by authenticated restaurant owners and super admins
 */
const POSSystem = (): JSX.Element => {
  const { slug } = useParams();
  const { user, loading, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [tenant, setTenant] = useState<{ id: string; subscription_plan: string; } | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!slug) {
        setCheckingSubscription(false);
        return;
      }

      try {
        const { data: tenantData, error } = await supabase
          .from('tenants')
          .select('id, subscription_plan')
          .eq('slug', slug)
          .single();

        if (error) throw error;

        setTenant(tenantData);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [slug]);

  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin && tenant?.subscription_plan !== 'premium') {
    return <Navigate to={`/pos-access/${slug}`} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <POSDashboard />
    </div>
  );
};

export default POSSystem;