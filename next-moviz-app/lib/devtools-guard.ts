/**
 * DevTools Guard - Closes the tab if DevTools is opened in production
 * Detects DevTools via performance timing and periodic checks
 */

export function initDevToolsGuard() {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  if (typeof window === 'undefined') return;

  // Detect keyboard shortcuts for DevTools to close immediately
  const handleKeyDown = (event: KeyboardEvent) => {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    const isDevToolsShortcut =
      event.key === 'F12' ||
      (event.ctrlKey && event.shiftKey && event.key === 'I') ||
      (event.ctrlKey && event.shiftKey && event.key === 'C') ||
      (event.ctrlKey && event.shiftKey && event.key === 'J') ||
      (isMac && event.metaKey && event.altKey && event.key === 'I') ||
      (isMac && event.metaKey && event.altKey && event.key === 'U') ||
      (isMac && event.metaKey && event.altKey && event.key === 'C');

    if (isDevToolsShortcut) {
      event.preventDefault();
      event.stopPropagation();
      window.close();
      return false;
    }
  };

  // Detect if DevTools is open via debugger statement performance timing
  const checkDevTools = setInterval(() => {
    const start = performance.now();
    // Using a debugger statement: if DevTools is open, this will be slow
    debugger;
    const end = performance.now();

    // If debugger statement took more than 100ms, DevTools is likely open
    if (end - start > 100) {
      clearInterval(checkDevTools);
      window.close();
    }
  }, 500);

  // Add event listener for keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown, true);

  return () => {
    document.removeEventListener('keydown', handleKeyDown, true);
    clearInterval(checkDevTools);
  };
}
