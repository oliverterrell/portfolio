'use client';

import { apiClient } from '@/lib/apiClient';
import { AuthService } from '@/lib/AuthService';
import { LS_APP_PAGE_TOAST } from '@/lib/constants';
import { LayoutGroup, motion } from 'framer-motion';
import { useLayoutEffect, useState } from 'react';
import { Button, ButtonType } from '@/lib/Button';
import { TextInput } from '@/lib/TextInput';
import { useAuthForm } from '@/lib/AuthForm';
import { modViewport, usePressEnterFor } from '@/lib/util';
import { useApp } from '@/lib/AppProvider';

export default function AuthPage() {
  const { setToast } = useApp();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegistration, setIsRegistration] = useState<boolean>(false);
  const [once, setOnce] = useState(true);

  useLayoutEffect(() => {
    if (isRegistration) setOnce(false);
    if (isInValidationMode) {
      setErrors({});
      setIsInValidationMode(false);
    }

    const clearMods: VoidFunction = modViewport();
    return () => {
      setToast(null);
      clearMods();
    };
  }, [isRegistration]);

  const loginAction = async () => {
    try {
      await apiClient.post('/login', authForm).then(async (res: any) => {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find((cookie) => cookie.trim().startsWith('otAuthToken='));
        const token = authCookie ? authCookie.split('=')[1] : null;
        if (token) {
          AuthService.setSessionToken(token);
          setToast({ message: 'Welcome!', type: 'success' }, LS_APP_PAGE_TOAST);
          window.location.replace('/');
        }
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err?.response?.status === 403 ? 'Incorrect email or password' : 'Unknown error occurred',
      });
      setIsLoading(false);
      return;
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);

    if (isRegistration) {
      try {
        await apiClient.post('/register', authForm).then(async () => {
          await loginAction();
        });
      } catch (err: any) {
        console.log(err);
        setToast({
          type: 'error',
          message:
            err?.response?.status === 409
              ? `Email or phone already in use`
              : `Server error. Please try again later.`,
        });
        setIsLoading(false);
        return;
      }
    } else {
      await loginAction();
    }
  };

  const {
    form: authForm,
    setForm: setAuthForm,
    errors,
    setErrors,
    setIsInValidationMode,
    isInValidationMode,
    handleSubmit,
  } = useAuthForm(onSubmit, isRegistration);

  usePressEnterFor(onSubmit, authForm);

  return (
    <div key={`auth-page-ui`} className={`flex-page-full w-full p-3 w-full-abs md:my-auto md:max-h-[62dvh]`}>
      <div className={`flex-page-row justify-end py-3`}>
        <Button
          type={ButtonType.LINK}
          onClick={() => setIsRegistration(!isRegistration)}
          text={isRegistration ? 'Log In' : 'Sign Up'}
        />
      </div>

      <LayoutGroup>
        <div className={`flex-page-full flex-col`}>
          <motion.div layout className={'flex-page-full justify-between gap-y-6 md:justify-start'}>
            <motion.div layout className={`flex w-full flex-col items-start gap-y-6`}>
              {isRegistration ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, opacity: { duration: 1, delay: 0.5 } }}
                  className={`flex w-full flex-col items-start gap-y-6`}
                >
                  <TextInput
                    name={`firstName`}
                    placeholder={'First Name'}
                    value={authForm.firstName}
                    onChange={(e: any) => setAuthForm({ ...authForm, firstName: e.target.value })}
                    invalid={errors.firstName}
                  />

                  <TextInput
                    name={`lastName`}
                    placeholder={'Last Name'}
                    value={authForm.lastName}
                    onChange={(e: any) => setAuthForm({ ...authForm, lastName: e.target.value })}
                    invalid={errors.lastName}
                  />

                  <TextInput
                    name={`phone`}
                    type={`tel`}
                    placeholder={'Phone Number'}
                    autoCompleteType={`tel`}
                    onChange={(e: any) => setAuthForm({ ...authForm, phone: e.target.value })}
                    value={authForm.phone}
                    invalid={errors.phone}
                    invalidMessage={`Phone must be 16 characters or less.`}
                    disclaimer={`Forgive the lax validation for the quick project`}
                  />
                </motion.div>
              ) : null}

              <TextInput
                name={`email`}
                placeholder={'Email Address'}
                onChange={(e: any) => setAuthForm({ ...authForm, email: e.target.value })}
                value={authForm.email}
                invalid={errors.email}
              />

              <LayoutGroup>
                <TextInput
                  name={`password`}
                  placeholder={'Password'}
                  value={authForm.password}
                  onChange={(e: any) => setAuthForm({ ...authForm, password: e.target.value })}
                  invalid={errors.password}
                  className={`anchor-root`}
                />

                {!isRegistration ? (
                  <Button
                    initial={{ opacity: isRegistration || once ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    type={ButtonType.LINK}
                    tabIndex={-1}
                    onClick={() => window.location.replace('/forgot-password')}
                    className={`-mt-2 ml-2.5 stroke-1 italic text-[#454545]`}
                    text={'Forgot your password?'}
                    disabled={true}
                  />
                ) : null}
              </LayoutGroup>
            </motion.div>

            <Button
              onClick={handleSubmit}
              type={ButtonType.PRIMARY}
              loading={{ state: isLoading, content: isRegistration ? 'Registering...' : 'Signing In...' }}
              text={isRegistration ? 'Sign Up' : 'Log In'}
              className={isRegistration ? undefined : `mt-20`}
            />
          </motion.div>
        </div>
      </LayoutGroup>
    </div>
  );
}
