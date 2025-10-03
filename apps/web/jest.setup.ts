import { TextEncoder, TextDecoder } from 'node:util';
Object.defineProperty(globalThis, 'TextEncoder', { value: TextEncoder, writable: true });
Object.defineProperty(globalThis, 'TextDecoder', { value: TextDecoder, writable: true });
import '@testing-library/jest-dom';
import { fetch, Request, Response, Headers } from 'undici';
Object.defineProperty(globalThis, 'fetch', { value: fetch, writable: true });
Object.defineProperty(globalThis, 'Request', { value: Request, writable: true });
Object.defineProperty(globalThis, 'Response', { value: Response, writable: true });
Object.defineProperty(globalThis, 'Headers', { value: Headers, writable: true });
