import 'react';

declare module 'react' {
  interface CSSProperties {
    '--start-x'?: string;
    '--start-y'?: string;
    '--end-x'?: string;
    '--end-y'?: string;
    '--velocity'?: number;
  }
}
