export type Currency = 'JPY' | 'BDT'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  JPY: '¥',
  BDT: '৳',
}

export const CURRENCY_NAMES: Record<Currency, string> = {
  JPY: 'Japanese Yen',
  BDT: 'Bangladeshi Taka',
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  if (currency === 'JPY') {
    return `${symbol}${Math.round(amount).toLocaleString()}`
  }
  return `${symbol}${amount.toFixed(2)}`
}

export function parseCurrencyInput(value: string): number {
  return parseFloat(value.replace(/[^0-9.]/g, '')) || 0
}
