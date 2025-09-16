import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Palette, Save, Eye, X, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Color from 'color';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { EnhancedThemeCustomizer } from "@/components/restaurant/EnhancedThemeCustomizer";

// WCAG AA minimum contrast ratio for normal text
const MIN_CONTRAST_RATIO = 4.5;

// Theme colors for contrast checking
const themeColors = {
  light: {
    background: '#fdfaf8', // hsl(35 15% 98%)
    foreground: '#141311', // hsl(20 14% 8%)
    card: '#ffffff',       // hsl(35 15% 100%)
    primaryForeground: '#fdfaf8' // hsl(35 15% 98%)
  },
  dark: {
    background: '#1c2541', // hsl(222 47% 11%)
    foreground: '#f0f4f8', // hsl(210 40% 98%)
    card: '#2a3657',       // hsl(222 47% 16%)
    primaryForeground: '#f0f4f8' // hsl(210 40% 98%)
  }
};

/**
 * Represents a tenant with branding information.
 */
interface Tenant {
  id: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
  logo_position?: 'left' | 'center' | 'right';
  social_media_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  description?: string;
}

/**
 * Generates a suitable hover color.
 * @param hex The base color in hex format.
 * @returns A new hex color string for the hover state.
 */
export const generateHoverColor = (hex: string): string => {
  try {
    const color = Color(hex);
    // Darken light colors, lighten dark colors for better hover effect
    return color.isDark() ? color.lighten(0.2).hex() : color.darken(0.1).hex();
  } catch (e) {
    // Fallback for invalid colors
    return '#cccccc';
  }
};

/**
 * Checks if a color is legible against both light and dark theme backgrounds.
 * @param hex The color to check.
 * @returns An object with boolean `isValid` and the lowest contrast ratio found.
 */
const checkColorLegibility = (hex: string): { isValid: boolean; worstContrast: number } => {
  try {
    const color = Color(hex);

    // Contrast for text on background
    const lightTextContrast = color.contrast(Color(themeColors.light.card));
    const darkTextContrast = color.contrast(Color(themeColors.dark.card));

    // Contrast for button background with foreground text
    const lightButtonContrast = color.contrast(Color(themeColors.light.primaryForeground));
    const darkButtonContrast = color.contrast(Color(themeColors.dark.primaryForeground));

    const worstContrast = Math.min(lightTextContrast, darkTextContrast, lightButtonContrast, darkButtonContrast);

    return {
      isValid: worstContrast >= MIN_CONTRAST_RATIO,
      worstContrast: worstContrast,
    };
  } catch (e) {
    return { isValid: false, worstContrast: 0 };
  }
};

/**
 * A component that allows a tenant to customize their restaurant's branding.
 * This includes uploading a logo and selecting a primary color.
 * It provides a live preview and saves the changes to the database.
 *
 * @returns {JSX.Element} The rendered restaurant branding component.
 */
const RestaurantBranding = (): JSX.Element => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const predefinedColors = [
    { name: t('branding.colors.classicBlue'), value: '#2563eb' },
    { name: t('branding.colors.naturalGreen'), value: '#16a34a' },
    { name: t('branding.colors.warmOrange'), value: '#ea580c' },
    { name: t('branding.colors.elegantRed'), value: '#dc2626' },
    { name: t('branding.colors.royalPurple'), value: '#7c3aed' },
    { name: t('branding.colors.modernPink'), value: '#e11d48' },
    { name: t('branding.colors.luxuryGold'), value: '#d97706' },
    { name: t('branding.colors.calmTurquoise'), value: '#0891b2' },
  ];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Form state
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [selectedColorHover, setSelectedColorHover] = useState(generateHoverColor('#2563eb'));
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoPosition, setLogoPosition] = useState<'left' | 'center' | 'right'>('left');
  const [legibility, setLegibility] = useState({ isValid: true, worstContrast: 21 });
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
  });
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTenantData();
  }, []);

  // Update branding styles and validation on color change
  useEffect(() => {
    try {
      const legibilityResult = checkColorLegibility(selectedColor);
      setLegibility(legibilityResult);

      const hoverColor = generateHoverColor(selectedColor);
      setSelectedColorHover(hoverColor);

      // Apply live preview styles to the whole document
      document.documentElement.style.setProperty('--custom-primary', selectedColor);
      document.documentElement.style.setProperty('--custom-primary-hover', hoverColor);
    } catch (error) {
      setLegibility({ isValid: false, worstContrast: 0 });
    }
  }, [selectedColor]);

  // Cleanup styles on component unmount
  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty('--custom-primary');
      document.documentElement.style.removeProperty('--custom-primary-hover');
    };
  }, []);

  const fetchTenantData = async () => {
    setLoading(true);
    try {
      const { data: tenantId, error: rpcError } = await supabase.rpc('get_user_tenant');
      if (rpcError) throw rpcError;

      if (tenantId) {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', tenantId)
          .single();

        if (error) throw error;

        if (data) {
          const tenant = {
            ...data,
            logo_position: (data.logo_position as 'left' | 'center' | 'right') || 'center',
            social_media_links: (data.social_media_links as { facebook?: string; instagram?: string; twitter?: string }) || undefined
          };
          
          setTenant(tenant);
          setSelectedColor(data.primary_color || '#2563eb');
          setLogoPosition(tenant.logo_position);
          setSocialMediaLinks({
            facebook: tenant.social_media_links?.facebook || '',
            instagram: tenant.social_media_links?.instagram || '',
            twitter: tenant.social_media_links?.twitter || ''
          });
          setDescription(data.description || '');
          if (data.logo_url) {
            setLogoPreview(data.logo_url);
          }
        }
      } else {
        console.error('No tenant found for this user.');
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      toast({
        title: t('branding.toast.tenantNotFoundTitle'),
        description: t('branding.toast.tenantNotFoundDescription'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setLogoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: t('branding.toast.invalidImageTitle'),
          description: t('branding.toast.invalidImageDescription'),
          variant: "destructive",
        });
      }
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('menu-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('menu-images')
        .getPublicUrl(data.path);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: t('branding.toast.logoUploadErrorTitle'),
        description: t('branding.toast.logoUploadErrorDescription'),
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!tenant) {
      return;
    }

    setSaving(true);
    try {
      let logoUrl = tenant.logo_url;
      
      if (logoFile) {
        const uploadedUrl = await uploadLogo(logoFile);
        if (uploadedUrl) logoUrl = uploadedUrl;
      }

      const { error } = await supabase
        .from('tenants')
        .update({
          logo_url: logoUrl,
          primary_color: selectedColor,
          logo_position: logoPosition,
          social_media_links: socialMediaLinks,
          description: description,
        })
        .eq('id', tenant.id);

      if (error) throw error;

      setTenant(prev => prev ? {
        ...prev,
        logo_url: logoUrl,
        primary_color: selectedColor,
        logo_position: logoPosition,
        social_media_links: socialMediaLinks,
        description: description,
      } : null);

      toast({
        title: t('branding.toast.saveSuccessTitle'),
        description: t('branding.toast.saveSuccessDescription'),
      });

      setLogoFile(null);
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: t('branding.toast.saveErrorTitle'),
        description: t('branding.toast.saveErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(tenant?.logo_url || '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('branding.loading')}</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md text-center p-8">
          <h2 className="text-xl font-bold mb-2">{t('branding.error')}</h2>
          <p className="text-muted-foreground">
            {t('branding.tenantNotFound')}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 pt-16" dir="rtl">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('branding.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('branding.description')}
            </p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            {t('branding.backToDashboard')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Branding Controls */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Upload className="h-5 w-5" />
                  {t('branding.logo.title')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t('branding.logo.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 ml-2" />
                  {uploadingLogo ? t('branding.logo.uploading') : t('branding.logo.select')}
                </Button>

                {logoPreview && (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt={t('branding.logo.alt')}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    {logoFile && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={removeLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Color Selection */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Palette className="h-5 w-5" />
                  {t('branding.color.title')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t('branding.color.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {predefinedColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`relative w-16 h-16 rounded-lg border-2 transition-all ${
                        selectedColor === color.value
                          ? 'border-foreground scale-110'
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-color" className="text-foreground">{t('branding.color.custom')}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="custom-color"
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('branding.color.preview')}</span>
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Theme Customizer - moved from Restaurant Profile */}
            <EnhancedThemeCustomizer
              tenant={tenant}
              onUpdate={(updatedTenant) => {
                setTenant(prev => prev ? { ...prev, ...updatedTenant } : null);
              }}
            />

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving || uploadingLogo}
              className="w-full"
              size="lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? t('branding.saving') : t('branding.save')}
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Eye className="h-5 w-5" />
                  {t('branding.preview.title')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t('branding.preview.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-subtle border rounded-lg overflow-hidden">
                  <div className="relative">
                    {/* Mobile Phone Frame */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-brand-primary to-brand-primary-hover text-primary-foreground">
                          <div className={`flex items-center gap-3 ${logoPosition === 'center' ? 'justify-center' : logoPosition === 'right' ? 'justify-end' : 'justify-start'}`}>
                            {logoPreview && (
                              <img src={logoPreview} alt="Logo" className="w-8 h-8 rounded" />
                            )}
                            <div className={logoPreview ? '' : 'text-center w-full'}>
                              <h1 className="text-lg font-bold">{tenant.name}</h1>
                            </div>
                          </div>
                        </div>

                        {/* Preview Content */}
                        <div className="p-4 space-y-4">
                          <div className="space-y-3">
                            <h2 className="text-lg font-bold pb-2 border-b text-brand-primary border-brand-primary/20">
                              {t('branding.preview.category')}
                            </h2>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-3 bg-card rounded-lg shadow-sm">
                                <div>
                                  <h3 className="font-medium">{t('branding.preview.item.name')}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {t('branding.preview.item.description')}
                                  </p>
                                  <span className="text-sm font-bold text-brand-primary">
                                    {t('branding.preview.item.price')}
                                  </span>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="h-6 px-2 text-xs bg-brand-primary text-primary-foreground hover:bg-brand-primary-hover"
                                >
                                  {t('branding.preview.item.add')}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg border border-brand-primary/20 bg-brand-primary/10">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{t('branding.preview.cart.empty')}</span>
                              <Button 
                                size="sm" 
                                disabled 
                                className="text-xs bg-brand-primary/80"
                              >
                                {t('branding.preview.cart.send')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantBranding;