// stateManager.js - State Management Pattern

export function createStateManager(initialState) {
  let state = { ...initialState };
  const listeners = [];

  return {
    /**
     * Get the current state
     */
    getState() {
      return { ...state };
    },

    /**
     * Update status
     */
    setState(updates) {
      state = { ...state, ...updates };
      this.notify();
    },

    /**
     * Reset state
     */
    reset(newState) {
      state = { ...newState };
      this.notify();
    },

    /**
     * Subscribe to changes
     */
    subscribe(listener) {
      listeners.push(listener);
    },

    /**
     * Notify subscribers
     */
    notify() {
      listeners.forEach(listener => listener(state));
    },

    /**
     * Check if a Reset button is needed
     */
    shouldEnableReset() {
      return state.billAmount > 0 ||
        state.tipPercent > 0 ||
        state.numberOfPeople > 1;
    }
  };
}