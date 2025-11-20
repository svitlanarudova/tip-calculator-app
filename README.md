![Frontend Mentor](https://img.shields.io/badge/Frontend%20Mentor-Challenge-4BC0F0?logo=frontendmentor&logoColor=white) ![#12](https://img.shields.io/badge/%2312-red) [![Live Preview](https://img.shields.io/badge/Live-Preview-green)](https://svitlanarudova.github.io/tip-calculator-app/)

# Frontend Mentor - Tip calculator app solution
![Design preview for the Meet landing page](./preview.jpg)
## Project Overview 📋
This is a solution to the [Tip calculator app challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/tip-calculator-app-ugJNGbJUX).  

💰  A responsive tip calculator built with vanilla JavaScript, focusing on accessibility, form validation, and state management.


> 🛠️ **Built With**  
> HTML5 - Semantic forms  
> CSS3 - Accessible custom styling  
> Vanilla JavaScript - State management & validation

## 🎯 What I'm Proud Of
### Radio Buttons for Semantic HTML

I chose **radio buttons** instead of regular buttons for tip percentages. This balances visual design with semantic correctness:
```html
<input type="radio" name="tip_percent" id="tip-5" value="5">
<label for="tip-5">5%</label>
```
> **Benefits**:  
> ✅ Semantically correct for "select one option"  
> ✅ Built-in keyboard navigation  
> ✅ Better accessibility for screen readers  
> ✅ Native form behavior (form.reset() works)

### Forms API vs DOM Queries
I used the **Forms API** for cleaner code:
```js
const formSplitter = document.forms.splitter_form;
const billInput = formSplitter.bill_amount;  // direct access
```
vs traditional approach:
```js
const billInput = document.querySelector('input[name="bill_amount"]');
```

### State-Driven Architecture
```js
const state = {
  billAmount: 0,
  tipPercent: 0,
  numberOfPeople: 1
};
```
```
Flow: User Input  →  Validation  →  State Update  →  Calculation  →  DOM Update
```

## 🚧 Challenges I Faced
### 1. Custom Radio Styling & Accessibility
> **Problem:** Using display: none breaks keyboard navigation and screen readers.  
> **Solution:** Visually-hidden technique:
```css
.form__tip-radio {
  position: absolute;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  width: 0.0625rem;
  height: 0.0625rem;
  overflow: hidden;
  white-space: nowrap;
}
```

This keeps the input accessible while hiding it visually.

### 2. Managing Complex Code
As a beginner, I got overwhelmed with validation, state, and error handling all mixed together.  
**My solution:**
- Separated validation into functions:
```js
function validateBillValueRaw(raw) {
  const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return { ok: false, reason: 'empty' };
  if (num < MIN_BILL || num > MAX_BILL) return { ok: false, reason: 'range' };
  return { ok: true, value: parseFloat(num.toFixed(2)) };
}
```
- Created reusable helpers:
```js
function showError(inputElem, errorElem, message) { ... }
function hideError(inputElem, errorElem) { ... }
```
- Single calculation function:
 ```js
  function calculateValuesFromState() {
  // All calculations in one place
}
```
### 3. Input Masking vs Validation
> **I learned to separate:**  
> Masking (input event): Filter characters as user types  
> Validation (blur event): Check final value and format it
```js
billInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^0-9.]/g, '');
});

billInput.addEventListener('blur', (e) => {
  e.target.value = validateBillInput(e.target.value).toFixed(2);
});
```
## 🧩 What I Learned
- **Form validation patterns:** masking, validation, and error display are separate concerns
- **State management:** State is the single source of truth; DOM reflects state
- **Accessibility matters:** Custom styling must not break keyboard navigation or screen readers

# 🎯 Tip Calculator Refactoring
## 📁 New Project Structure
```js
  ├── config.js          ← Constants and settings
  ├── helpers.js         ← Debounce and sanitize utilities
  ├── validators.js      ← Data validation
  ├── errorHandler.js    ← Error management
  ├── stateManager.js    ← State pattern implementation
  ├── calculator.js      ← Business logic
  └── main.js            ← Entry point
```
## ✨ Key Improvements

**Modularization:** Split 280-line monolith into 7 focused modules
**Validation** Extracted validation logic into reusable functions
**Configuration:** Centralized all constants in config file
**State Management** Implemented state manager with subscription pattern
**Performance:** Added debouncing (300ms) and DOM query caching
**Error Handling:** Unified error management system
**Input Sanitization:** Reusable numeric/decimal sanitization helpers

## 📈 Benefits

> Easy to test individual modules  
> Reusable code across projects  
> Clear separation of concerns  
> ES6 modules (import/export)  
> Ready for unit testing  
> Maintainable and scalable architecture  

