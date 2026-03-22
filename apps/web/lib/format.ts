export const formatMoney = (value: number, currency = 'SAR') =>
  new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency,
  }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
