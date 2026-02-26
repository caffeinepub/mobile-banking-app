const ADMIN_TOKEN_KEY = 'nuropay_admin_token';
const ADMIN_USERNAME = 'nuralom1';
const ADMIN_PASSWORD = '9040';

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminToken();
  if (!token) return false;
  // Validate token format: "username:password"
  const [username, password] = token.split(':');
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function generateAdminToken(username: string, password: string): string {
  return `${username}:${password}`;
}
