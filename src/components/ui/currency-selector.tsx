import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  disabled?: boolean;
}

const CURRENCIES = [
  { code: 'SYP', name: 'Syrian Pound', symbol: 'ل.س', nameAr: 'الليرة السورية' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', nameAr: 'الليرة اللبنانية' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', nameAr: 'الليرة التركية' },
  { code: 'TL', name: 'Turkish Lira (TL)', symbol: 'TL', nameAr: 'الليرة التركية' },
  { code: 'USD', name: 'US Dollar', symbol: '$', nameAr: 'الدولار الأمريكي' },
  { code: 'EUR', name: 'Euro', symbol: '€', nameAr: 'اليورو' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', nameAr: 'الريال السعودي' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', nameAr: 'الدرهم الإماراتي' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.أ', nameAr: 'الدينار الأردني' },
];

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { t, isRTL } = useTranslation();

  return (
    <div className="space-y-2">
      <Label htmlFor="currency-select">{t('restaurant.profile.currency')}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="currency-select">
          <SelectValue placeholder={t('restaurant.profile.selectCurrency')} />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border shadow-lg z-[70]">
          {CURRENCIES.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-mono text-sm">{currency.symbol}</span>
                <span>{isRTL ? currency.nameAr : currency.name}</span>
                <span className="text-muted-foreground">({currency.code})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || 'ل.س';
};

export const formatPrice = (price: number, currencyCode: string = 'SYP'): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${price.toLocaleString()} ${symbol}`;
};