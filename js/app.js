// main.js - The main application file
import { CONFIG, ERROR_MESSAGES } from './config.js';
import { debounce } from './helpers.js';
import { validators } from './validators.js';
import { errorHandler } from './errorHandler.js';
import { createStateManager } from './stateManager.js';
import { calculateSplit } from './calculator.js';

window.addEventListener('load', initApp);

// ========================================
// INITIALIZATION
// ========================================
function initApp() {
  const elements = initializeDOM();
  const stateManager = createStateManager({
    billAmount: 0,
    tipPercent: 0,
    numberOfPeople: 1
  });

  // Subscribing to state changes
  stateManager.subscribe((state) => {
    updateResults(elements, state);
    updateResetButton(elements.resetButton, stateManager.shouldEnableReset());
  });

  // Initial setup
  updateResetButton(elements.resetButton, false);
  updateResults(elements, stateManager.getState());
  document.documentElement.classList.add('loaded');

  // Event binding
  attachEventListeners(elements, stateManager);
}

// ========================================
// INITIALIZING THE DOM
// ========================================
function initializeDOM() {
  const form = document.forms.splitter_form;

  return {
    form,
    billInput: form.bill_amount,
    tipPercentButtons: form.tip_percent,
    tipCustomInput: form.tip_custom,
    numberOfPeopleInput: form.people_count,
    tipAmountOutput: document.querySelector('.result-form__value--amount'),
    totalAmountOutput: document.querySelector('.result-form__value--total'),
    resetButton: form.reset_button,
    billError: document.querySelector('.error-bill'),
    peopleError: document.querySelector('.error-num-people')
  };
}

// ========================================
// LINKING EVENTS
// ========================================
function attachEventListeners(elements, stateManager) {
  attachBillListeners(elements, stateManager);
  attachPeopleListeners(elements, stateManager);
  attachTipListeners(elements, stateManager);
  attachResetListener(elements, stateManager);
}

// ========================================
// ACCOUNT PROCESSORS
// ========================================
function attachBillListeners(elements, stateManager) {
  const { billInput, billError } = elements;

  // Input with debounce for performance
  billInput.addEventListener('input', debounce((e) => {
    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
    const raw = e.target.value;
    const num = parseFloat(raw);

    // Check for exceeding the maximum
    if (!isNaN(num) && num > CONFIG.MAX_BILL) {
      errorHandler.show(billInput, billError, ERROR_MESSAGES.bill);
      return;
    }

    const validation = validators.validateBillValueRaw(raw);

    if (!validation.ok) {
      errorHandler.show(billInput, billError, ERROR_MESSAGES.bill);
      return;
    }

    errorHandler.hide(billInput, billError);
    stateManager.setState({ billAmount: validation.value });
  }, CONFIG.DEBOUNCE_DELAY));

  // Blur for final processing
  billInput.addEventListener('blur', (e) => {
    const validation = validators.validateBillValueRaw(e.target.value);

    if (!validation.ok || !e.target.value) {
      e.target.value = '';
      stateManager.setState({ billAmount: 0 });
    } else {
      e.target.value = validation.value.toFixed(2);
      stateManager.setState({ billAmount: validation.value });
    }

    errorHandler.hide(billInput, billError);

    // Set default for people if empty
    if (!elements.numberOfPeopleInput.value) {
      elements.numberOfPeopleInput.value = CONFIG.MIN_PEOPLE;
    }
  });
}

// ========================================
// PEOPLE NUMBER PROCESSORS
// ========================================
function attachPeopleListeners(elements, stateManager) {
  const { numberOfPeopleInput, peopleError } = elements;

  numberOfPeopleInput.addEventListener('input', debounce((e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    const raw = e.target.value;
    const num = parseInt(raw);

    if (!isNaN(num) && num > CONFIG.MAX_PEOPLE) {
      errorHandler.show(numberOfPeopleInput, peopleError, ERROR_MESSAGES.people);
      return;
    }

    const validation = validators.validatePeopleValueRaw(raw);

    if (!validation.ok) {
      errorHandler.show(numberOfPeopleInput, peopleError, ERROR_MESSAGES.people);
      return;
    }

    errorHandler.hide(numberOfPeopleInput, peopleError);
    stateManager.setState({ numberOfPeople: validation.value });
  }, CONFIG.DEBOUNCE_DELAY));

  numberOfPeopleInput.addEventListener('blur', (e) => {
    const validation = validators.validatePeopleValueRaw(e.target.value);

    if (!validation.ok || !e.target.value) {
      e.target.value = CONFIG.MIN_PEOPLE;
      stateManager.setState({ numberOfPeople: CONFIG.MIN_PEOPLE });
    } else {
      e.target.value = validation.value;
      stateManager.setState({ numberOfPeople: validation.value });
    }

    errorHandler.hide(numberOfPeopleInput, peopleError);
  });
}

// ========================================
// TIP PROCESSORS
// ========================================
function attachTipListeners(elements, stateManager) {
  const { tipPercentButtons, tipCustomInput } = elements;

  // Handlers for each radio button
  Array.from(tipPercentButtons).forEach(btn => {
    // Change event (mouse click)
    btn.addEventListener('change', (e) => {
      clearCustomInput(tipCustomInput);
      const val = parseFloat(e.target.value);
      stateManager.setState({
        tipPercent: Number.isFinite(val) ? val : 0
      });
    });

    // Keyboard support
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!btn.checked) {
          btn.checked = true;
          clearCustomInput(tipCustomInput);
          const val = parseFloat(btn.value);
          stateManager.setState({
            tipPercent: Number.isFinite(val) ? val : 0
          });
        }
      }
    });

    // Auto-select on Tab
    btn.addEventListener('focus', (e) => {
      if (!btn.checked) {
        btn.checked = true;
        clearCustomInput(tipCustomInput);
        const val = parseFloat(btn.value);
        stateManager.setState({
          tipPercent: Number.isFinite(val) ? val : 0
        });
      }
    });
  });

  // Custom tip input
  tipCustomInput.addEventListener('input', (e) => {
    uncheckAllRadios(tipPercentButtons);
    const validation = validators.validateCustomTipRaw(e.target.value);

    if (!validation.ok) {
      stateManager.setState({ tipPercent: 0 });
      return;
    }

    stateManager.setState({ tipPercent: validation.value });
  });

  tipCustomInput.addEventListener('blur', (e) => {
    if (!e.target.value || e.target.value.trim() === '') {
      e.target.value = '';
      return;
    }

    const validation = validators.validateCustomTipRaw(e.target.value);

    if (!validation.ok) {
      e.target.value = '';
      stateManager.setState({ tipPercent: 0 });
    } else {
      e.target.value = String(validation.value);
      stateManager.setState({ tipPercent: validation.value });
    }
  });
}

// ========================================
// RESET HANDLER
// ========================================
function attachResetListener(elements, stateManager) {
  elements.resetButton.addEventListener('click', (e) => {
    e.preventDefault();

    elements.form.reset();
    stateManager.reset({
      billAmount: 0,
      tipPercent: 0,
      numberOfPeople: 1
    });

    errorHandler.hideAll([
      { input: elements.billInput, error: elements.billError },
      { input: elements.numberOfPeopleInput, error: elements.peopleError }
    ]);

    updateResetButton(elements.resetButton, false);
  });
}

// ========================================
// UI UPDATE
// ========================================
function updateResults(elements, state) {
  const { tipPerPerson, totalPerPerson } = calculateSplit(
    state.billAmount,
    state.tipPercent,
    state.numberOfPeople
  );

  elements.tipAmountOutput.textContent = `$${tipPerPerson.toFixed(2)}`;
  elements.totalAmountOutput.textContent = `$${totalPerPerson.toFixed(2)}`;
}

function updateResetButton(button, enabled) {
  button.disabled = !enabled;
  button.classList.toggle('empty', !enabled);
}

// ========================================
// AUXILIARY FUNCTIONS
// ========================================
function clearCustomInput(input) {
  input.value = '';
}

function uncheckAllRadios(radios) {
  Array.from(radios).forEach(btn => btn.checked = false);
}
