import { useCallback, useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { InstallState, installStateForEnvironment } from '../pwa/installState';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PwaLifecycle {
  installState: InstallState;
  canInstall: boolean;
  requestInstall(): Promise<boolean>;
  updateAvailable: boolean;
  applyUpdate(): Promise<void>;
  dismissUpdate(): void;
  registrationError?: string;
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function usePwaLifecycle(): PwaLifecycle {
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<InstallState>(() =>
    installStateForEnvironment(isStandaloneDisplay(), false)
  );
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registrationError, setRegistrationError] = useState<string>();
  const updateServiceWorker = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as BeforeInstallPromptEvent;
      setInstallState(installStateForEnvironment(isStandaloneDisplay(), true));
    };
    const handleInstalled = () => {
      promptRef.current = null;
      setInstallState('installed');
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      updateServiceWorker.current = registerSW({
        immediate: true,
        onNeedRefresh: () => setUpdateAvailable(true),
        onRegisterError: (error) => {
          setRegistrationError(
            error instanceof Error ? error.message : 'Service worker registration failed.'
          );
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const requestInstall = useCallback(async () => {
    const prompt = promptRef.current;
    if (!prompt || isStandaloneDisplay()) return false;
    setInstallState('prompting');
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallState('accepted');
      return true;
    }
    setInstallState('dismissed');
    return false;
  }, []);

  const applyUpdate = useCallback(async () => {
    await updateServiceWorker.current?.(true);
  }, []);

  return {
    installState,
    canInstall: installState === 'available',
    requestInstall,
    updateAvailable,
    applyUpdate,
    dismissUpdate: () => setUpdateAvailable(false),
    registrationError
  };
}
