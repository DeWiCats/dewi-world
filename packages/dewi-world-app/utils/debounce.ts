import { debounce as lodashDebounce } from 'lodash';

export const debounce = (func: any) => {
  if (!func) return undefined;
  return lodashDebounce(func, 500, { leading: true, trailing: false });
};
