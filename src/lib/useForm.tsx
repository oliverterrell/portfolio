import { useEffect, useState } from 'react';
import { OnSubmitForm, FormInput } from '@/shared/types';

export interface UseFormOptions<TForm> {
  onSubmit?: OnSubmitForm;
  defaultFormState?: TForm;
  validations?: FormInput;
}

/**
 * Manage form state.
 *
 * Validations should follow the structure of the form with the following format:
 *  Keys can contain either an object with required: true or a custom isValid function. Example:
 *
 *      validations: {
 *          rootKey1: {
 *              subKey1: {
 *                  required: true
 *              },
 *              subKey2: {
 *                  isValid: async () => return true if valid else false
 *              }
 *          }
 *      }
 *
 *  You may also provide a special key `custom` which is an array of custom conditions. If you provide an object with
 *  an array of keys paired with an isValid callback to custom, if any of the keys in the array are valid, all keys in
 *  the array are valid. Please note that these keys must be all located at the same depth and that the `custom` key
 *  must exist in that same depth. Example of a 'one of' situation:
 *
 *      validations: {
 *          rootKey1: {
 *              custom: [
 *                  {keys: ['subKey1', 'subKey2'], isValid: async () => return true if valid else false}
 *              ]
 *          }
 *      }
 *
 *  Conditional blocks work such that any validations contained within a `conditions` key will only be run if the
 *  willValidate function provided evaluates to true. Otherwise, these validations are not processed. As with `custom`,
 *  `conditions` must exist at the proper depth for the keys it encompasses. Example:
 *
 *      validations: {
 *          rootKey1: {
 *              conditions: [
 *                  {
 *                      willValidate: async () => return true to run validations. if false nothing will be checked,
 *                      validations: {
 *                          subKey1: {
 *                              required: true
 *                          },
 *                          subKey2: {
 *                              isValid: async () => return true if valid else false
 *                          }
 *                      }
 *                  }
 *              ]
 *          }
 *      }
 *
 * @author Oliver Terrell
 */
export function useForm<TForm>(options: UseFormOptions<TForm>) {
  const defaultFormState = options.defaultFormState || ({} as TForm);
  const [form, setForm] = useState<TForm>(defaultFormState);
  const [errors, setErrors] = useState<any>({});
  const [isInValidationMode, setIsInValidationMode] = useState<boolean>(false);
  const validations: FormInput = options.validations || {};

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setIsInValidationMode(true);
    }
  }, [errors]);

  useEffect(() => {
    if (isInValidationMode) {
      const newErrors = (async () => await validate(form, validations))();
      setErrors({ ...newErrors });
    }
  }, [form]);

  const checkField = async (value: any, validation: any) => {
    return (
      (validation.isValid && (await validation.isValid()) === false) ||
      (validation.required && (typeof value === 'undefined' || value === null || value === ''))
    );
  };

  const validate = async (form: any, validations: any) => {
    let errors = {};
    for (let key in validations) {
      if (typeof validations[key] === 'object') {
        if (key === 'conditions') {
          validations[key].map(async (condition: any) => {
            if (condition.willValidate && (await condition.willValidate()) === true) {
              for await (let _ of condition.validations) {
                let conditionalErrors = await validate(form, condition.validations);
                if (Object.keys(conditionalErrors).length > 0) {
                  errors = Object.assign({}, errors || {}, conditionalErrors);
                }
              }
            }
          });
        } else if (key === 'custom') {
          validations[key].map(async (condition: any) => {
            if ((await condition.isValid()) === false) {
              condition.keys.forEach((key: any) => {
                errors[key] = true;
              });
            }
          });
        } else if (validations[key].required || validations[key].isValid) {
          if (await checkField(form[key], validations[key])) {
            errors[key] = true;
          }
        } else {
          let nestedErrors = await validate(form[key], validations[key]);
          if (Object.keys(nestedErrors).length > 0) {
            errors[key] = Object.assign({}, errors[key] || {}, nestedErrors);
          }
        }
      }
    }
    return errors;
  };

  const handleSubmit = async () => {
    let newErrors = await validate(form, validations);

    if (Object.keys(newErrors).length > 0) {
      setErrors({ ...newErrors });
      return;
    } else if (options.onSubmit) {
      options.onSubmit();
    }
  };

  return {
    form,
    errors,
    setForm,
    validate,
    setErrors,
    checkField,
    validations,
    handleSubmit,
    defaultFormState,
    isInValidationMode,
    setIsInValidationMode,
  };
}
