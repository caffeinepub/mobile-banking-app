export function validateBDMobile(mobile: string): boolean {
  return /^01[3-9]\d{8}$/.test(mobile);
}

export function validatePIN(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function validateNID(nid: string): boolean {
  return /^\d{10,17}$/.test(nid);
}

export function formatBDT(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
