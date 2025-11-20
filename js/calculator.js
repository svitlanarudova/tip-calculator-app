// calculator.js - Calculation business logic

/** Calculate tip and total per person
 */
export function calculateSplit(billAmount, tipPercent, numberOfPeople) {
  const bill = billAmount || 0;
  const people = numberOfPeople || 1;
  const tip = tipPercent || 0;

  if (!bill || !people) {
    return { tipPerPerson: 0, totalPerPerson: 0 };
  }

  const totalTip = (bill * tip) / 100;
  const tipPerPerson = totalTip / people;
  const totalPerPerson = (bill / people) + tipPerPerson;

  return {
    tipPerPerson: parseFloat(tipPerPerson.toFixed(2)),
    totalPerPerson: parseFloat(totalPerPerson.toFixed(2))
  };
}