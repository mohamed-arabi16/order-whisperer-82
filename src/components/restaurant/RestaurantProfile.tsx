import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Building2, Save, RefreshCw } from "lucide-react";
import { CurrencySelector } from "@/components/ui/currency-selector";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subscription_plan: string;
  is_active: boolean;
  phone_number?: string;
  address?: string;
  description?: string;
  currency?: string;
}

interface RestaurantProfileProps {
  tenant: Tenant;
  onUpdate: (updatedTenant: Tenant) => void;
}

const generateSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Allow Arabic characters and basic chars
    .replace(/[\u0600-\u06FF]+/g, (match) => 
      // Replace Arabic text with transliteration or simplified version
      match.replace(/\u0627/g, 'a').replace(/\u0628/g, 'b').replace(/\u062A/g, 't') || 'restaurant'
    )
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length
    || 'restaurant-menu'; // Fallback if empty
};

export const RestaurantProfile: React.FC<RestaurantProfileProps> = ({
  tenant,
  onUpdate,
}) => {
  const { t, isRTL } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: tenant.name || '',
    phone_number: tenant.phone_number || '',
    address: tenant.address || '',
    description: tenant.description || '',
    slug: tenant.slug || '',
    currency: tenant.currency || 'SYP',
  });

  const handleSlugRegeneration = () => {
    const newSlug = generateSlugFromName(formData.name);
    setFormData(prev => ({ ...prev, slug: newSlug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({
          name: formData.name,
          phone_number: formData.phone_number || null,
          address: formData.address || null,
          description: formData.description || null,
          slug: formData.slug,
          currency: formData.currency,
        })
        .eq('id', tenant.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      toast({
        title: t('restaurant.profile.updateSuccess'),
        description: t('restaurant.profile.updateSuccessDescription'),
      });
    } catch (error: any) {
      console.error('Error updating restaurant profile:', error);
      toast({
        title: t('restaurant.profile.updateError'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-card" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {t('restaurant.profile.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('restaurant.profile.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('restaurant.profile.namePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('restaurant.profile.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                placeholder={t('restaurant.profile.phonePlaceholder')}
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="address">{t('restaurant.profile.address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder={t('restaurant.profile.addressPlaceholder')}
              />
            </div>

            <CurrencySelector
              value={formData.currency}
              onChange={(currency) => setFormData(prev => ({ ...prev, currency }))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('restaurant.profile.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('restaurant.profile.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">{t('restaurant.profile.menuSlug')}</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="restaurant-name"
                dir="ltr"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSlugRegeneration}
                className="flex-shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {window.location.origin}/menu/{formData.slug}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {t('restaurant.profile.updating')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('restaurant.profile.saveChanges')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};