// Type declarations for CSS imports
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.sass' {
  const content: { [className: string]: string };
  export default content;
}

// Allow importing CSS files as side effects
declare module './globals.css';
declare module '@/app/globals.css';
declare module '@/app/accessibility.css';
