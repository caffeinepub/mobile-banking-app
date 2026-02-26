import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  userName: string | null;
  userMobile: string | null;
  userBalance: number;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'none';
  isLoggedIn: boolean;
  // Aliases for new code
  isAuthenticated: boolean;
  balance: number;
  // Actions
  setUser: (userId: string, name: string, mobile: string) => void;
  login: (userId: string, balance: number, kycApproved: boolean) => void;
  setBalance: (balance: number) => void;
  updateBalance: (balance: number) => void;
  setKycStatus: (status: 'pending' | 'approved' | 'rejected' | 'none') => void;
  updateKycStatus: (approved: boolean) => void;
  logout: () => void;
}

const SESSION_KEY = 'nuropay_user_session';

function loadSession(): Partial<AuthState> {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveSession(state: Partial<AuthState>) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {}
}

const saved = loadSession();

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: (saved.userId as string) || null,
  userName: (saved.userName as string) || null,
  userMobile: (saved.userMobile as string) || null,
  userBalance: (saved.userBalance as number) || 0,
  kycStatus: (saved.kycStatus as AuthState['kycStatus']) || 'none',
  isLoggedIn: !!(saved.userId),
  isAuthenticated: !!(saved.userId),
  balance: (saved.userBalance as number) || 0,

  setUser: (userId, userName, userMobile) => {
    const newState = {
      userId,
      userName,
      userMobile,
      isLoggedIn: true,
      isAuthenticated: true,
    };
    set(newState);
    saveSession({ ...newState, userBalance: get().userBalance, kycStatus: get().kycStatus });
  },

  login: (userId, balance, kycApproved) => {
    const kycStatus: AuthState['kycStatus'] = kycApproved ? 'approved' : 'none';
    const newState = {
      userId,
      userBalance: balance,
      balance,
      kycStatus,
      isLoggedIn: true,
      isAuthenticated: true,
    };
    set(newState);
    saveSession({ ...newState, userName: get().userName, userMobile: get().userMobile });
  },

  setBalance: (userBalance) => {
    set({ userBalance, balance: userBalance });
    const current = loadSession();
    saveSession({ ...current, userBalance, balance: userBalance });
  },

  updateBalance: (userBalance) => {
    set({ userBalance, balance: userBalance });
    const current = loadSession();
    saveSession({ ...current, userBalance, balance: userBalance });
  },

  setKycStatus: (kycStatus) => {
    set({ kycStatus });
    const current = loadSession();
    saveSession({ ...current, kycStatus });
  },

  updateKycStatus: (approved) => {
    const kycStatus: AuthState['kycStatus'] = approved ? 'approved' : 'none';
    set({ kycStatus });
    const current = loadSession();
    saveSession({ ...current, kycStatus });
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    set({
      userId: null,
      userName: null,
      userMobile: null,
      userBalance: 0,
      balance: 0,
      kycStatus: 'none',
      isLoggedIn: false,
      isAuthenticated: false,
    });
  },
}));
