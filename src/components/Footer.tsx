import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "react-router-dom";

/**
 * Footer component with green styling matching the design system
 */
const Footer = (): JSX.Element => {
  const { t, isRTL } = useTranslation();

  return (
    <footer className="bg-primary text-primary-foreground py-12 px-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{t("header.brand")}</h3>
            <p className="text-primary-foreground/80">
              {t("hero.subtitle")}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/pricing" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  {t("header.pricing")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  {t("header.contact")}
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  {t("header.signIn")}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t("footer.support")}</h4>
            <p className="text-primary-foreground/80 text-sm">
              {t("footer.supportText")}
            </p>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/80 text-sm">
            © 2024 {t("header.brand")}. {t("footer.allRights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;