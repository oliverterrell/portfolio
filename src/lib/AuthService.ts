import { LS_JWT_TOKEN } from '@/lib/constants';
import { deleteSessionCookie } from '@/lib/serverActions';

export const AuthService = {
  getSessionToken: () => {
    return window.localStorage.getItem(LS_JWT_TOKEN) ?? null;
  },

  setSessionToken: (token: string) => {
    window.localStorage.setItem(LS_JWT_TOKEN, token);
  },

  logout: async () => {
    await deleteSessionCookie();
    window.localStorage.removeItem(LS_JWT_TOKEN);
  },

  isAuthenticated: () => {
    return !!AuthService.getSessionToken();
  },
};
