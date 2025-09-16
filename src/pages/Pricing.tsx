import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import StaggeredFadeIn from "@/components/StaggeredFadeIn";
import { Link } from "react-router-dom";

/**
 * A page component that displays the pricing plans for the service.
 *
 * @returns {JSX.Element} The rendered pricing page.
 */
const Pricing = (): JSX.Element => {
  const { t, isRTL, t_array } = useTranslation();

  const plans = [
    {
      name: t('pricing.plans.basic.name'),
      price: t('pricing.plans.basic.price'),
      features: t_array('pricing.plans.basic.features'),
      cta: t('pricing.plans.basic.cta'),
      link: "/auth?tab=signup",
    },
    {
      name: t('pricing.plans.premium.name'),
      price: t('pricing.plans.premium.price'),
      features: t_array('pricing.plans.premium.features'),
      cta: t('pricing.plans.premium.cta'),
      link: "/auth?tab=signup",
    },
    {
      name: t('pricing.plans.enterprise.name'),
      price: t('pricing.plans.enterprise.price'),
      features: t_array('pricing.plans.enterprise.features'),
      cta: t('pricing.plans.enterprise.cta'),
      link: "/contact",
    },
  ];

  return (
    <div
      className="min-h-screen bg-background pt-24"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <StaggeredFadeIn>
          <h1 className="text-4xl font-bold text-center mb-4">
            {t("pricing.title")}
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            {t("pricing.description")}
          </p>
        </StaggeredFadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <StaggeredFadeIn key={plan.name} delay={index * 0.2}>
              <Card className="flex flex-col h-full">
                <CardHeader className="flex-shrink-0">
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="text-4xl font-bold">
                    {plan.price}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-4">
                    {Array.isArray(plan.features) ? plan.features.map((feature, idx) => (
                      <li key={`${feature}-${idx}`} className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Check className={`h-5 w-5 text-primary flex-shrink-0 mt-0.5`} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    )) : (
                      <li className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Check className={`h-5 w-5 text-primary flex-shrink-0 mt-0.5`} />
                        <span className="text-sm">No features available</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Link to={plan.link}>
                    <Button className="w-full">{plan.cta}</Button>
                  </Link>
                </div>
              </Card>
            </StaggeredFadeIn>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
