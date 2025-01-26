import { Any } from '@/shared/types';
import { motion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';

export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  LINK = 'link',
  BUTTON = 'button',
}

const getButtonColor = (type: ButtonType) => {
  switch (type) {
    case ButtonType.PRIMARY:
      return 'bg-accent border-accent text-white';
    case ButtonType.SECONDARY:
      return 'border-accent text-accent';
    case ButtonType.BUTTON:
      return 'text-white';
    default:
      return '';
  }
};

const _getRenderedContent = ({ loading, text, type }) => {
  let content: ReactNode;
  if (!text) text = <>&nbsp;</>;

  if (loading?.state) {
    content =
      type === ButtonType.LINK ? (
        <div className={'flex w-fit animate-pulse cursor-pointer flex-row items-center justify-center gap-x-0.5'}>
          {loading.content}
        </div>
      ) : (
        <span className={'text-white'}>{loading.content}</span>
      );
  } else {
    content = text;
  }

  return content;
};

export interface ButtonProps extends Any {
  id?: string;
  onClick?: any;
  type?: ButtonType;
  text?: ReactNode;
  tabIndex?: number;
  loading?: any;
  complete?: any;
  className?: string;
  disabled?: boolean;
  form?: boolean;
  animation?: any;
}

export const Button = ({
  id,
  text,
  type,
  onClick,
  loading,
  tabIndex,
  complete,
  className,
  disabled,
  form,
  animation,
  ...rest
}: ButtonProps) => {
  const colors = getButtonColor(type);

  let buttonStyle =
    type === ButtonType.LINK
      ? `w-fit text-accent ${className?.includes('text-') ? '' : 'text-xs'}`
      : `w-full rounded-full justify-center border-2 p-3`;

  if (!animation) {
    animation = {};
  }

  const animate = useMemo(() => {
    return {
      ...animation,
      whileTap: { scale: disabled ? 1 : 0.98 },
      transition: { ease: 'linear', duration: 0.01, stiffness: 1, damping: 0 },
    };
  }, [animation]);

  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <motion.button
      layout
      {...rest}
      {...animate}
      id={id ?? undefined}
      onClick={handleClick}
      tabIndex={tabIndex || undefined}
      className={`relative flex ${disabled ? 'cursor-default opacity-30' : 'cursor-pointer'} flex-row gap-x-3 ${colors} ${buttonStyle} ${className || ''}`}
      disabled={disabled}
      type={form ? 'submit' : 'button'}
    >
      {_getRenderedContent({ loading, text, type })}
    </motion.button>
  );
};
