"use client";
import { createContext, useContext, cloneElement, isValidElement } from 'react';
export const CmsLabContext = createContext([]);
export function useLabText() {
  const overrides = useContext(CmsLabContext);
  const convert = value => {
    if (typeof value === 'string') return overrides.find(item => item.source === value)?.value ?? value;
    if (Array.isArray(value)) return value.map(convert);
    if (isValidElement(value) && value.props.children !== undefined) return cloneElement(value, {}, convert(value.props.children));
    return value;
  };
  return convert;
}
