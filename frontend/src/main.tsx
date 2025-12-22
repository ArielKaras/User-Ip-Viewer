import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

console.log('Main: Starting...');
const rootEl = document.getElementById('root');
console.log('Main: Root element:', rootEl);

if (rootEl) {
  try {
    const root = createRoot(rootEl);
    console.log('Main: Created root, rendering App...');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('Main: Render called');
  } catch (err) {
    console.error('Main: Error during render:', err);
  }
} else {
  console.error('Main: Root element not found!');
}
