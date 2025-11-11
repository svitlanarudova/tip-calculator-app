// Wait for full page load
window.addEventListener('load', pageLoaded);

function pageLoaded() {

  // ========== STATE (Single source of truth) ==========
  const state = {
    billAmount: 0,
    tipPercent: 0,
    numberOfPeople: 1,
  };

  // ========== DOM ELEMENTS ==========
  const formSplitter = document.forms.splitter_form;
  const billInput = formSplitter.bill_amount;
  const tipPercentButtons = formSplitter.tip_percent; // NodeList of radios
  const tipCustomInput = formSplitter.tip_custom;
  const numberOfPeopleInput = formSplitter.people_count;
  const tipAmountPersonOutput = document.querySelector('.result-form__value--amount');
  const totalAmountPersonOutput = document.querySelector('.result-form__value--total');
  const resetButton = formSplitter.reset_button;
  const billError = document.querySelector('.error-bill');
  const peopleError = document.querySelector('.error-num-people');

  // ========== CONSTANTS ==========
  const MAX_BILL = 100000.00;
  const MIN_BILL = 1.00;
  const MIN_PEOPLE = 1;
  const MAX_PEOPLE = 100;
  const MIN_CUSTOM_TIP = 1;
  const MAX_CUSTOM_TIP = 100;

  // ========== INITIALIZATION ==========
  setResetButtonState(false);
  updateResults();
  document.documentElement.classList.add('loaded');

  // ========== ERROR HELPERS ==========

  // Show error message and add error class to input
  function showError(inputElem, errorElem, message) {
    if (inputElem) inputElem.classList.add('error');
    if (errorElem) {
      errorElem.textContent = message;
      errorElem.style.visibility = 'visible';
    }
  }

  // Hide error message and remove error class
  function hideError(inputElem, errorElem) {
    if (inputElem) inputElem.classList.remove('error');
    if (errorElem) {
      errorElem.textContent = '';
      errorElem.style.visibility = 'hidden';
    }
  }

  // ========== VALIDATION ==========

  // Validate bill amount: returns { ok: boolean, value?: number, reason?: string }
  function validateBillValueRaw(raw) {
    const cleaned = String(raw).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return { ok: false, reason: 'empty' };
    if (num < MIN_BILL) return { ok: false, reason: 'min' };
    if (num > MAX_BILL) return { ok: false, reason: 'max' };
    return { ok: true, value: parseFloat(num.toFixed(2)) };
  }

  // Validate number of people (integer)
  function validatePeopleValueRaw(raw) {
    const cleaned = String(raw).replace(/[^0-9]/g, '');
    const num = parseInt(cleaned);
    if (isNaN(num)) return { ok: false, reason: 'empty' };
    if (num < MIN_PEOPLE) return { ok: false, reason: 'min' };
    if (num > MAX_PEOPLE) return { ok: false, reason: 'max' };
    return { ok: true, value: num };
  }

  // Validate custom tip percentage (1-100)
  function validateCustomTipRaw(raw) {
    const num = parseFloat(String(raw).replace(/[^\d.]/g, ''));
    if (isNaN(num)) return { ok: false };
    if (num < MIN_CUSTOM_TIP || num > MAX_CUSTOM_TIP) return { ok: false };
    return { ok: true, value: Math.round(num) };
  }

  // ========== UI HELPERS ==========

  // Enable/disable reset button
  function setResetButtonState(enabled) {
    resetButton.disabled = !enabled;
    resetButton.classList.toggle('empty', !enabled);
  }

  // Clear custom tip input
  function clearCustomInput() {
    tipCustomInput.value = '';
  }

  // Uncheck all radio buttons
  function uncheckAllRadios() {
    Array.from(tipPercentButtons).forEach(btn => btn.checked = false);
  }

  // ========== CALCULATIONS ==========

  // Calculate tip and total per person from state
  function calculateValuesFromState() {
    const b = state.billAmount || 0;
    const p = state.numberOfPeople || 1;
    const tipPct = state.tipPercent || 0;

    if (!b || !p) return { tipPerPerson: 0, totalPerPerson: 0 };

    const totalTip = (b * tipPct) / 100;
    const tipPerPerson = totalTip / p;
    const totalPerPerson = (b / p) + tipPerPerson;

    return { tipPerPerson, totalPerPerson };
  }

  // Update DOM with calculated results
  function updateResults() {
    const { tipPerPerson, totalPerPerson } = calculateValuesFromState();
    tipAmountPersonOutput.textContent = `$${(tipPerPerson || 0).toFixed(2)}`;
    totalAmountPersonOutput.textContent = `$${(totalPerPerson || 0).toFixed(2)}`;
  }

  // ========== EVENT LISTENERS ==========

  // BILL INPUT: Live validation while typing
  billInput.addEventListener('input', (e) => {
    // Input mask: allow only digits and dot
    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
    const raw = e.target.value;

    // Check for max overflow
    const num = parseFloat(raw);
    if (!isNaN(num) && num > MAX_BILL) {
      showError(billInput, billError, `(1–${MAX_BILL.toLocaleString()})`);
      return; // Don't update state
    }

    // Full validation
    const check = validateBillValueRaw(raw);
    if (!check.ok) {
      showError(billInput, billError, `(1-${MAX_BILL.toLocaleString()})`);
      return;
    } else {
      hideError(billInput, billError);
      state.billAmount = check.value;
      setResetButtonState(true);
      updateResults();
    }
  });

  // BILL INPUT: Normalize value on blur
  billInput.addEventListener('blur', (e) => {
    const check = validateBillValueRaw(e.target.value);
    if (!check.ok || !e.target.value) {
      e.target.value = '';
      state.billAmount = 0;
    } else {
      e.target.value = check.value.toFixed(2); // Format: "100.00"
      state.billAmount = check.value;
    }
    hideError(billInput, billError);
    setResetButtonState(state.billAmount > 0 || state.tipPercent > 0 || state.numberOfPeople > 1);

    // Set default people count if empty
    if (!numberOfPeopleInput.value || numberOfPeopleInput.value === '') {
      numberOfPeopleInput.value = MIN_PEOPLE;
    }
    updateResults();
  });

  // PEOPLE INPUT: Live validation
  numberOfPeopleInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    const raw = e.target.value;
    const num = parseInt(raw);

    if (!isNaN(num) && num > MAX_PEOPLE) {
      showError(numberOfPeopleInput, peopleError, `(1–${MAX_PEOPLE})`);
      return;
    }

    const check = validatePeopleValueRaw(raw);
    if (!check.ok) {
      showError(numberOfPeopleInput, peopleError, `(1–${MAX_PEOPLE})`);
      return;
    } else {
      hideError(numberOfPeopleInput, peopleError);
      state.numberOfPeople = check.value;
      setResetButtonState(true);
      updateResults();
    }
  });

  // PEOPLE INPUT: Normalize on blur
  numberOfPeopleInput.addEventListener('blur', (e) => {
    const check = validatePeopleValueRaw(e.target.value);
    if (!check.ok || !e.target.value) {
      e.target.value = MIN_PEOPLE;
      state.numberOfPeople = MIN_PEOPLE;
    } else {
      e.target.value = check.value;
      state.numberOfPeople = check.value;
    }
    hideError(numberOfPeopleInput, peopleError);
    setResetButtonState(state.billAmount > 0 || state.tipPercent > 0 || state.numberOfPeople > 1);
    updateResults();
  });

  // TIP RADIOS: Handle keyboard navigation (Tab + Enter/Space)
  // BUGFIX: Added focus handler for automatic selection on Tab
  Array.from(tipPercentButtons).forEach(btn => {

    // 'change' event: fires on click or Enter/Space
    btn.addEventListener('change', (e) => {
      clearCustomInput();
      const val = parseFloat(e.target.value);
      state.tipPercent = Number.isFinite(val) ? val : 0;
      setResetButtonState(true);
      updateResults();
    });

    // 'keydown' event: handle Enter/Space explicitly
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!btn.checked) {
          btn.checked = true;
          clearCustomInput();
          const val = parseFloat(btn.value);
          state.tipPercent = Number.isFinite(val) ? val : 0;
          setResetButtonState(true);
          updateResults();
        }
      }
    });

    // 'focus' event: auto-select on Tab navigation
    btn.addEventListener('focus', (e) => {
      if (!btn.checked) {
        btn.checked = true;
        clearCustomInput();
        const val = parseFloat(btn.value);
        state.tipPercent = Number.isFinite(val) ? val : 0;
        setResetButtonState(true);
        updateResults();
      }
    });
  });

  // CUSTOM TIP: Live update while typing
  tipCustomInput.addEventListener('input', (e) => {
    uncheckAllRadios();
    const raw = e.target.value;
    const validated = validateCustomTipRaw(raw);

    if (!validated.ok) {
      state.tipPercent = 0;
      updateResults();
      return;
    }
    state.tipPercent = validated.value;
    setResetButtonState(true);
    updateResults();
  });

  // CUSTOM TIP: Normalize on blur
  // BUGFIX: Don't reset tipPercent if custom field is empty
  tipCustomInput.addEventListener('blur', (e) => {
    // If empty - just clear field, DON'T touch state.tipPercent
    if (!e.target.value || e.target.value.trim() === '') {
      e.target.value = '';
      updateResults();
      return; // Exit without resetting state
    }

    // If something was entered - validate it
    const validated = validateCustomTipRaw(e.target.value);
    if (!validated.ok) {
      e.target.value = '';
      state.tipPercent = 0; // Only reset if invalid input
    } else {
      e.target.value = String(validated.value);
      state.tipPercent = validated.value;
    }
    updateResults();
  });

  // RESET BUTTON: Clear form and state
  resetButton.addEventListener('click', (e) => {
    e.preventDefault();
    formSplitter.reset();
    state.billAmount = 0;
    state.tipPercent = 0;
    state.numberOfPeople = 1;
    hideError(billInput, billError);
    hideError(numberOfPeopleInput, peopleError);
    setResetButtonState(false);
    updateResults();
  });
}