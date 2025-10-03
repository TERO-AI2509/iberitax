import '@testing-library/jest-dom';
import { fetch, Request, Response, Headers } from 'undici';
Object.defineProperty(globalThis, 'fetch', { value: fetch, writable: true });
Object.defineProperty(globalThis, 'Request', { value: Request, writable: true });
Object.defineProperty(globalThis, 'Response', { value: Response, writable: true });
Object.defineProperty(globalThis, 'Headers', { value: Headers, writable: true });
