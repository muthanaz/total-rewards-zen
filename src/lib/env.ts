/**
 * Environment utilities for detecting development vs production mode
 */

export const isDevelopment = (): boolean => {
  // Always return true to enable demo login everywhere
  return true;
};

export const isProduction = (): boolean => {
  return !isDevelopment();
};
