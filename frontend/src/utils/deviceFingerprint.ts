const DEVICE_FINGERPRINT_KEY = 'nuropay_device_fingerprint';

export function getDeviceFingerprint(): string {
  // Return existing fingerprint if already stored
  const existing = localStorage.getItem(DEVICE_FINGERPRINT_KEY);
  if (existing) return existing;

  // Generate a stable fingerprint from browser properties
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.platform || '',
  ].join('|');

  // Simple hash function
  let hash = 5381;
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i);
    hash = ((hash << 5) + hash) ^ char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Make it positive and convert to hex string
  const fingerprint = 'fp_' + Math.abs(hash).toString(16) + '_' + Date.now().toString(36);

  localStorage.setItem(DEVICE_FINGERPRINT_KEY, fingerprint);
  return fingerprint;
}

export function clearDeviceFingerprint(): void {
  localStorage.removeItem(DEVICE_FINGERPRINT_KEY);
}
