// config.js - All application constants
export const CONFIG = {
  MAX_BILL: 100000.00,
  MIN_BILL: 1.00,
  MIN_PEOPLE: 1,
  MAX_PEOPLE: 100,
  MIN_CUSTOM_TIP: 1,
  MAX_CUSTOM_TIP: 100,
  DEBOUNCE_DELAY: 300
};

export const ERROR_MESSAGES = {
  bill: `(1–${CONFIG.MAX_BILL.toLocaleString()})`,
  people: `(1–${CONFIG.MAX_PEOPLE})`
};