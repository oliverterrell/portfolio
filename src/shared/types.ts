import { LS_APP_PAGE_TOAST, LS_LOGIN_PAGE_TOAST } from '@/lib/constants';
import { JSX } from 'react';

export type FormInput = Record<string, any>;
export type OnSubmitForm = any;
export type ComponentRender = (args?: any) => JSX.Element;
export type LSMessageKey = typeof LS_APP_PAGE_TOAST | typeof LS_LOGIN_PAGE_TOAST | undefined;
export type Any = any;
