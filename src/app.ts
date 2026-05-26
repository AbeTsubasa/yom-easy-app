import { copy } from './ui/copy/ja';

export function initApp(): void {
  const root = document.getElementById('app');
  if (!root) return;

  root.innerHTML = `
    <main class="reading-area" aria-labelledby="app-title">
      <h1 id="app-title" class="reading-area__title">${copy.app.name}</h1>
      <p class="reading-area__intro">${copy.app.intro}</p>
      <p class="reading-area__placeholder">${copy.app.placeholder}</p>
    </main>
  `;
}
