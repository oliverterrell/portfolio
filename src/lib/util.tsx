import { useEffect } from 'react';

const _modifyMeta = (isFocused: boolean) => {
  const content = isFocused
    ? 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    : 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';

  let viewportMeta = document.querySelector('meta[name="viewport"]');

  if (viewportMeta) {
    viewportMeta.setAttribute('content', content);
  } else {
    viewportMeta = document.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    viewportMeta.setAttribute('content', content);
    document.getElementsByTagName('head')[0].appendChild(viewportMeta);
  }
};

/**
 * Prevent browser auto-zoom on inputs focus.
 *
 * _Note:_ Call inside `useEffect` to dynamically apply where needed.
 * This function only applies to elements that have been rendered.
 */
export const modViewport = () => {
  const addMetaMods = () => _modifyMeta(true);
  const clearMetaMods = () => _modifyMeta(false);

  document.querySelectorAll('input, select, textarea').forEach((input) => {
    input.addEventListener('focus', addMetaMods);
    input.addEventListener('mousedown', addMetaMods);
    // input.addEventListener('blur', clearMetaMods);
  });

  return () => {
    document.querySelectorAll('input, select, textarea').forEach((input) => {
      input.removeEventListener('focus', addMetaMods);
      input.removeEventListener('mousedown', addMetaMods);
      // input.removeEventListener('blur', clearMetaMods);
    });
  };
};

// Listen for the `Enter` key to call the provided function
export const usePressEnterFor = (method: Function, condition: any = true) => {
  useEffect(() => {
    if (condition) {
      const pressEnterToCallMethod = (e: any) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          method();
        }
      };

      document.addEventListener('keypress', pressEnterToCallMethod);
      return () => document.removeEventListener('keypress', pressEnterToCallMethod);
    }
  }, [condition]);
};
