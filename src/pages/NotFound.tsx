import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * A page component that is displayed when a user navigates to a non-existent route.
 * It shows a 404 error message and a link to return to the homepage.
 *
 * @returns {JSX.Element} The rendered 404 page.
 */
const NotFound = (): JSX.Element => {
  const location = useLocation();
  const { t, isRTL } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">{t('common.error') || 'Oops! Page not found'}</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          {t('common.back') || 'Return to Home'}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
