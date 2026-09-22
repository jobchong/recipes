// The recipe itself, navigation and ingredient checkboxes work without JavaScript.
const printButton = document.querySelector('[data-print]');
if (printButton) {
  printButton.hidden = false;
  printButton.addEventListener('click', () => window.print());
}
