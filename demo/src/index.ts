import { init } from './init';
import './style.css';

const canvas = document.getElementById('canvas');

if (!canvas) {
  throw new Error('Missing canvas container.');
}

const owner = new AbortController();

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    owner.abort();
  });
}

try {
  await init(canvas, owner.signal);
} catch (error) {
  if (!owner.signal.aborted) {
    console.error('Demo initialization failed.', error);
  }
}
