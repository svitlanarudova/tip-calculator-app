// errorHandler.js - Centralized error handling

export const errorHandler = {
  /**
   * Show error
   */
  show(inputElem, errorElem, message) {
    if (inputElem) {
      inputElem.classList.add('error');
    }
    if (errorElem) {
      errorElem.textContent = message;
      errorElem.style.visibility = 'visible';
    }
  },

  /**
   * Hide error
   */
  hide(inputElem, errorElem) {
    if (inputElem) {
      inputElem.classList.remove('error');
    }
    if (errorElem) {
      errorElem.textContent = '';
      errorElem.style.visibility = 'hidden';
    }
  },

  /**
   * Hide all errors
   */
  hideAll(errors) {
    errors.forEach(({ input, error }) => {
      this.hide(input, error);
    });
  }
};