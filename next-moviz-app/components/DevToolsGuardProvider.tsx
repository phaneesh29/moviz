'use client';

import { useEffect } from 'react';
import { initDevToolsGuard } from '@/lib/devtools-guard';

export default function DevToolsGuardProvider(): React.ReactNode {
  useEffect(() => {
    const cleanup = initDevToolsGuard();
    return cleanup;
  }, []);

  return null;
}
