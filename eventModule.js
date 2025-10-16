export function registerEvent(buttonId, callback) {
  const btn = document.getElementById(buttonId);
  btn.addEventListener('click', callback);
}
