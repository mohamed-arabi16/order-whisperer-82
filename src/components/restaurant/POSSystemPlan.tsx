import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Clock, 
  Users, 
  BarChart3, 
  Printer, 
  Smartphone,
  Wifi,
  CreditCard,
  Package,
  Bell
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * POS System Architecture Plan Component
 * This component outlines the comprehensive plan for implementing a POS system
 * that integrates with the existing digital menu and WhatsApp ordering system.
 */
export const POSSystemPlan: React.FC = () => {
  const { t, t_array, isRTL } = useTranslation();

  const features = [
    {
      icon: ShoppingCart,
      title: t('pos.features.orderManagement.title'),
      description: t('pos.features.orderManagement.description'),
      status: "planned"
    },
    {
      icon: Clock,
      title: t('pos.features.kitchenDisplay.title'),
      description: t('pos.features.kitchenDisplay.description'),
      status: "planned"
    },
    {
      icon: Users,
      title: t('pos.features.staffManagement.title'),
      description: t('pos.features.staffManagement.description'),
      status: "planned"
    },
    {
      icon: BarChart3,
      title: t('pos.features.analytics.title'),
      description: t('pos.features.analytics.description'),
      status: "planned"
    },
    {
      icon: Printer,
      title: t('pos.features.printing.title'),
      description: t('pos.features.printing.description'),
      status: "planned"
    },
    {
      icon: Smartphone,
      title: t('pos.features.mobileApp.title'),
      description: t('pos.features.mobileApp.description'),
      status: "planned"
    },
    {
      icon: Wifi,
      title: t('pos.features.offline.title'),
      description: t('pos.features.offline.description'),
      status: "planned"
    },
    {
      icon: CreditCard,
      title: t('pos.features.payment.title'),
      description: t('pos.features.payment.description'),
      status: "planned"
    },
    {
      icon: Package,
      title: t('pos.features.inventory.title'),
      description: t('pos.features.inventory.description'),
      status: "planned"
    },
    {
      icon: Bell,
      title: t('pos.features.notifications.title'),
      description: t('pos.features.notifications.description'),
      status: "planned"
    }
  ];

  const phases = [
    {
      phase: 1,
      title: t('pos.phases.phase1.title'),
      duration: t('pos.phases.phase1.duration'),
      features: t_array('pos.phases.phase1.features')
    },
    {
      phase: 2,
      title: t('pos.phases.phase2.title'),
      duration: t('pos.phases.phase2.duration'),
      features: t_array('pos.phases.phase2.features')
    },
    {
      phase: 3,
      title: t('pos.phases.phase3.title'),
      duration: t('pos.phases.phase3.duration'),
      features: t_array('pos.phases.phase3.features')
    },
    {
      phase: 4,
      title: t('pos.phases.phase4.title'),
      duration: t('pos.phases.phase4.duration'),
      features: t_array('pos.phases.phase4.features')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary text-primary-foreground';
      case 'in-progress': return 'bg-accent text-accent-foreground';
      case 'planned': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-hero bg-clip-text text-transparent mb-4">
          {t('pos.title')}
        </h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          {t('pos.subtitle')}
        </p>
      </div>

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t('pos.featuresTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">{feature.title}</h3>
                    <Badge variant="outline" className={getStatusColor(feature.status)}>
                      {t(`pos.status.${feature.status}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Phases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t('pos.phasesTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {phases.map((phase, index) => (
              <div key={index} className="relative">
                {index !== phases.length - 1 && (
                  <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-8 w-0.5 h-full bg-border`} />
                )}
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {isRTL && phase.phase <= 4 ? ['١', '٢', '٣', '٤'][phase.phase - 1] : phase.phase}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{phase.title}</h3>
                      <Badge variant="outline">{phase.duration}</Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {phase.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t('pos.technicalArchTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-3">{t('pos.architecture.frontend')}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {t_array('pos.architecture.frontendFeatures').map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-3">{t('pos.architecture.backend')}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {t_array('pos.architecture.backendFeatures').map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            {t('pos.integrationTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div>
                <h4 className="font-medium text-foreground">{t('pos.integration.whatsapp.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('pos.integration.whatsapp.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-secondary/30">
              <div className="w-2 h-2 bg-secondary rounded-full mt-2" />
              <div>
                <h4 className="font-medium text-foreground">{t('pos.integration.menuSync.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('pos.integration.menuSync.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 bg-accent rounded-full mt-2" />
              <div>
                <h4 className="font-medium text-foreground">{t('pos.integration.analyticsEnhancement.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('pos.integration.analyticsEnhancement.description')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};