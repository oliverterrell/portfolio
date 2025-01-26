'use client';
import { OnSubmitForm } from '@/shared/types';
import { useForm } from '@/lib/useForm';

export interface AuthForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export function useAuthForm(onSubmit: OnSubmitForm, isRegistration: boolean) {
  const defaultFormState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  };

  const $ = useForm<AuthForm>({
    defaultFormState,
    onSubmit,
    validations: {
      firstName: { isValid: () => !isRegistration || $.form.firstName.length > 0 },
      lastName: { isValid: () => !isRegistration || $.form.lastName.length > 0 },
      email: { isValid: () => $.form.email.length > 0 },
      password: { isValid: () => $.form.password.length > 0 },
      phone: { isValid: () => !isRegistration || ($.form.phone.length > 0 && $.form.phone.length <= 16) },
    },
  });

  return $;
}
