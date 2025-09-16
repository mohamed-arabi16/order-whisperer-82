import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Palette, Save, RefreshCw, RotateCcw, Eye } from "lucide-react";

interface Tenant {
  id: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
}

interface EnhancedThemeCustomizerProps {
  tenant: Tenant;
  onUpdate: (colors: { primary_color?: string; secondary_color?: string; accent_color?: string }) => void;
}

const DEFAULT_COLORS = {
  primary: '#2F5233',
  secondary: '#A4C3B2',
  accent: '#D67D3E',
};

const hexToHsl = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const EnhancedThemeCustomizer: React.FC<EnhancedThemeCustomizerProps> = ({
  tenant,
  onUpdate,
}) => {
  const { t, isRTL } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [colors, setColors] = useState({
    primary: tenant.primary_color || DEFAULT_COLORS.primary,
    secondary: tenant.secondary_color || DEFAULT_COLORS.secondary,
    accent: tenant.accent_color || DEFAULT_COLORS.accent,
  });

  const updatePreview = (colorType: string, color: string) => {
    const hsl = hexToHsl(color);
    
    // Only update menu-specific CSS variables for public menu
    if (colorType === 'primary') {
      // Primary color for main branding elements in public menu only
      document.documentElement.style.setProperty('--menu-primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    } else if (colorType === 'secondary') {
      // Secondary color for backgrounds and cards in public menu only
      document.documentElement.style.setProperty('--menu-secondary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      document.documentElement.style.setProperty('--menu-card', `${hsl.h} ${hsl.s}% ${Math.min(hsl.l + 10, 95)}%`);
    } else if (colorType === 'accent') {
      // Accent color for highlights and call-to-action elements in public menu only
      document.documentElement.style.setProperty('--menu-accent', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }
  };

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', color: string) => {
    setColors(prev => ({ ...prev, [colorType]: color }));
    updatePreview(colorType, color);
  };

  const handleReset = () => {
    setColors(DEFAULT_COLORS);
    updatePreview('primary', DEFAULT_COLORS.primary);
    updatePreview('secondary', DEFAULT_COLORS.secondary);
    updatePreview('accent', DEFAULT_COLORS.accent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          primary_color: colors.primary,
          secondary_color: colors.secondary,
          accent_color: colors.accent,
        })
        .eq('id', tenant.id);

      if (error) throw error;

      onUpdate({
        primary_color: colors.primary,
        secondary_color: colors.secondary,
        accent_color: colors.accent,
      });

      toast({
        title: t('restaurant.theme.updateSuccess'),
        description: t('restaurant.theme.updateSuccessDescription'),
      });
    } catch (error: any) {
      console.error('Error updating theme:', error);
      toast({
        title: t('restaurant.theme.updateError'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          {t('restaurant.theme.advancedColors')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Color */}
          <div className="space-y-3">
            <Label htmlFor="primary-color">{t('restaurant.theme.primaryColorDescription')}</Label>
            <div className="flex items-center gap-3">
              <Input
                id="primary-color"
                type="color"
                value={colors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-16 h-10 p-1 rounded-lg"
              />
              <Input
                type="text"
                value={colors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                placeholder="#2F5233"
                className="flex-1"
                dir="ltr"
              />
            </div>
            <div 
              className="h-12 rounded-lg border-2 flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: colors.primary }}
            >
              {t('restaurant.theme.primaryPreview')}
            </div>
          </div>

          {/* Secondary Color */}
          <div className="space-y-3">
            <Label htmlFor="secondary-color">{t('restaurant.theme.secondaryColorDescription')}</Label>
            <div className="flex items-center gap-3">
              <Input
                id="secondary-color"
                type="color"
                value={colors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-16 h-10 p-1 rounded-lg"
              />
              <Input
                type="text"
                value={colors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                placeholder="#A4C3B2"
                className="flex-1"
                dir="ltr"
              />
            </div>
            <div 
              className="h-12 rounded-lg border-2 flex items-center justify-center text-foreground text-sm font-medium"
              style={{ backgroundColor: colors.secondary }}
            >
              {t('restaurant.theme.backgroundPreview')}
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-3">
            <Label htmlFor="accent-color">{t('restaurant.theme.accentColorDescription')}</Label>
            <div className="flex items-center gap-3">
              <Input
                id="accent-color"
                type="color"
                value={colors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-16 h-10 p-1 rounded-lg"
              />
              <Input
                type="text"
                value={colors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                placeholder="#D67D3E"
                className="flex-1"
                dir="ltr"
              />
            </div>
            <div 
              className="h-12 rounded-lg border-2 flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: colors.accent }}
            >
              {t('restaurant.theme.accentPreview')}
            </div>
          </div>
        </div>

        {/* Color Usage Guide */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">{t('restaurant.theme.colorGuide')}</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• <strong>{t('restaurant.theme.primaryColor')}:</strong> {t('restaurant.theme.primaryUsage')}</p>
            <p>• <strong>{t('restaurant.theme.secondaryColor')}:</strong> {t('restaurant.theme.secondaryUsage')}</p>
            <p>• <strong>{t('restaurant.theme.accentColor')}:</strong> {t('restaurant.theme.accentUsage')}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('restaurant.theme.resetToDefault')}
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {t('restaurant.theme.updating')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('restaurant.theme.saveChanges')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};