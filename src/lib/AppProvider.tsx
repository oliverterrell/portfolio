'use client';

import { LSMessageKey } from '@/shared/types';
import { User } from '@prisma/client';
import { createContext, useContext, useLayoutEffect, useState } from 'react';
import { ToastMessage, useToast } from '@/lib/useToast';
import { modViewport } from '@/lib/util';

const AppContext = createContext<AppContext>(null);
export const useApp = () => useContext<AppContext>(AppContext);

type AppContext = {
  user?: User;
  setUser?: (user: User) => void;
  setToast?: (message: ToastMessage, localStorageKey?: LSMessageKey) => void;
};

export const AppProvider = ({ children }) => {
  const { Toast, setToast } = useToast();

  const [user, setUser] = useState<User>(null);

  useLayoutEffect(() => {
    const clearMods: VoidFunction = modViewport();
    return () => clearMods();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        setToast,
      }}
    >
      <Toast />
      {children}
    </AppContext.Provider>
  );
};
