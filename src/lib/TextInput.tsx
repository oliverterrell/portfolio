import { Dispatch, ReactNode, SetStateAction, useRef, useState } from 'react';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
import { motion } from 'framer-motion';

export interface TextInput {
  layout?: boolean;
  name: string;
  onFocus?: VoidFunction;
  label?: string;
  labelClassName?: string;
  type?: string;
  value: string;
  autoCompleteType?: string;
  onChange: Dispatch<SetStateAction<any>>;
  placeholder?: string;
  containerClassName?: string;
  invalid?: boolean;
  invalidMessage?: string;
  disclaimer?: string;
  className?: string;
  textSize?: string;
  disabled?: boolean;
  children?: ReactNode;
}

export const TextInput = ({
  name,
  label,
  onFocus,
  type,
  value,
  autoCompleteType,
  labelClassName,
  onChange,
  placeholder,
  containerClassName,
  invalid,
  invalidMessage,
  disclaimer,
  className,
  textSize,
  disabled,
}: TextInput) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const passwordField = useRef(null);

  const EyeIcon = showPassword ? EyeFill : EyeSlashFill;

  const validationStyles = `border-2 ${invalid ? 'border-red-500 placeholder-red-500 bg-red-100' : 'border-primary'}`;
  const textSizeStyle = textSize || 'text-xs';
  const inputStyles = `rounded-xl p-3.5 w-full ${textSizeStyle} font-light text-black data-[focus]:outline-none data-[focus]:border-accent ${className} ${validationStyles}`;

  let inputElement: any;

  switch (name) {
    case 'password':
      inputElement = (
        <div className={`relative font-light text-black`}>
          <input
            id={name}
            ref={passwordField}
            name={name}
            type={showPassword ? 'text' : 'password'}
            autoComplete={'current-password'}
            value={value || ''}
            onChange={onChange}
            placeholder={'Password'}
            className={inputStyles}
            disabled={disabled}
          />
          <EyeIcon
            onClick={() => {
              setShowPassword(!showPassword);
              passwordField.current?.focus();
              setTimeout(() => passwordField.current?.setSelectionRange(value.length, value.length), 1);
            }}
            className={`absolute right-0 top-0 mr-3.5 mt-3.5 text-gray-400`}
            size={21}
          />
        </div>
      );
      break;
    case 'phone':
      inputElement = (
        <input
          // mask={'99999999999'}
          id={name}
          name={name}
          type={type || name}
          autoComplete={autoCompleteType || name}
          value={value || ''}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          className={inputStyles}
          disabled={disabled}
        />
      );

      break;
    default:
      inputElement = (
        <input
          id={name}
          name={name}
          type={type || name}
          autoComplete={autoCompleteType || name}
          value={value || ''}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          className={inputStyles}
          disabled={disabled}
        />
      );
  }

  return (
    <motion.div layout className={`flex w-full flex-col gap-y-0.5 ${containerClassName}`}>
      {label ? (
        <label htmlFor={name} className={`text-accent pb-1 pl-1 ${labelClassName}`}>
          {label}
        </label>
      ) : null}
      {inputElement}
      {disclaimer || invalid ? (
        <span
          className={`${invalid ? 'text-left text-red-500' : 'text-right text-gray-300'} -mb-3 w-full px-2 text-xs font-extralight italic`}
        >
          {invalid ? invalidMessage || 'This field is required' : disclaimer}
        </span>
      ) : null}
    </motion.div>
  );
};
