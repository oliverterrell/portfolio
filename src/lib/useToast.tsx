'use client';
import { LS_LOGIN_PAGE_TOAST, LS_APP_PAGE_TOAST } from '@/lib/constants';
import { ComponentRender } from '@/shared/types';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { CheckCircleFill, ExclamationCircleFill, InfoCircleFill } from 'react-bootstrap-icons';

export type ToastType = 'success' | 'info' | 'error' | 'maintenance';

export interface ToastMessage {
  type: ToastType;
  message: ReactNode;
  onExit?: VoidFunction;
}

export const useToast = () => {
  let presenceTimeout: NodeJS.Timeout;
  const pathname = usePathname();
  const controls = useDragControls();
  const [toast, setToastRaw] = useState<ToastMessage | null>(null);

  const setToast = (message: ToastMessage, localStorageKey?: string) => {
    if (typeof window !== 'undefined') {
      if (localStorageKey) {
        window.localStorage.setItem(localStorageKey, JSON.stringify(message));
      } else {
        setToastRaw(message);
      }
    }
  };

  useEffect(() => {
    if (toast) {
      presenceTimeout = setTimeout(() => setToastRaw(null), 5000);
      return () => {
        clearTimeout(presenceTimeout);
        if (toast?.onExit) setTimeout(() => toast.onExit(), 300);
        setToastRaw(null);
      };
    }
  }, [toast]);

  const Toast: ComponentRender = useCallback(() => {
    useEffect(() => {
      if (typeof window !== 'undefined') {
        let lsKey = LS_APP_PAGE_TOAST;

        if (pathname === '/auth') {
          lsKey = LS_LOGIN_PAGE_TOAST;
        } else if (pathname.startsWith(`/app`)) {
          lsKey = LS_APP_PAGE_TOAST;
        }

        if (window.localStorage.getItem(lsKey)) {
          setToastRaw(JSON.parse(window.localStorage.getItem(lsKey)));
          window.localStorage.removeItem(lsKey);
        }
      }
    }, [pathname]);

    return (
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={'toast'}
            drag={'y'}
            dragDirectionLock
            dragConstraints={{ bottom: 0 }}
            dragElastic={false}
            dragControls={controls}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0 }}
            exit={{ opacity: 0, y: -50, transition: { duration: 0.1, delay: 0 } }}
            className={`text-primary fixed top-1.5 z-50 flex max-h-[110px] w-fit min-w-24 max-w-[404px] flex-1 flex-row justify-evenly gap-x-3.5 rounded-xl bg-white px-8 py-2.5 text-center text-sm font-semibold shadow-md`}
          >
            {toast.type === 'error' ? (
              <ExclamationCircleFill size={'1.75em'} className={`my-auto text-red-500`} />
            ) : toast.type === 'info' ? (
              <InfoCircleFill size={'1.75em'} className={`my-auto text-yellow-400`} />
            ) : toast.type === 'maintenance' ? (
              <span className={`scale-125`}>⚠️</span>
            ) : (
              <CheckCircleFill size={'1.75em'} className={`my-auto text-green-500`} />
            )}
            <span className={`leading-loose`}>{toast.message}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    );
  }, [toast, pathname]);

  return { toast, setToast, Toast };
};
