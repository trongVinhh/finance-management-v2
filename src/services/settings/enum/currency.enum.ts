export enum Currency {
    VND = 'VND',
    JP = 'JPY',
    USD = 'USD'
}

export const formatCurrency = (amount: number, currency: string) => {
  const currencySymbols: Record<string, string> = {
    'VND': 'đ',
    'USD': '$',
    'JPY': '¥',
    'EUR': '€',
  };

  const symbol = currencySymbols[currency] || currency;

  // Format số theo locale
  const formatted = amount.toLocaleString('vi-VN');

  // VND và JPY thường để symbol ở sau, USD và EUR để trước
  if (currency === 'VND' || currency === 'JPY') {
    return `${formatted} ${symbol}`;
  } else {
    return `${symbol}${formatted}`;
  }
};