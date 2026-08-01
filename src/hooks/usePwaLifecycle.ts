import { useCallback, useEffect, useRef, useState } from 'react';
import { InstallState, installStateForEnvironment } from '../pwa/installState';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PwaLifecycle {
  registrationState: PwaRegistrationState;
  installState: InstallState;
  canInstall: boolean;
  requestInstall(): Promise<boolean>;
  updateAvailable: boolean;
  applyUpdate(): Promise<void>;
  dismissUpdate(): void;
  registrationError?: string;
}

export type PwaRegistrationState =
  | 'unsupported'
  | 'registering'
  | 'registered'
  | 'update-available'
  | 'updating'
  | 'updated'
  | 'error';

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
  const [registrationState, setRegistrationState] =
    useState<PwaRegistrationState>('unsupported');
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const updateRequestedRef = useRef(false);
  const reloadedRef = useRef(false);

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
    const checkForUpdate = () => void registrationRef.current?.update().catch(() => undefined);
    const checkVisibleUpdate = () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      setRegistrationState('registering');
      const markWaitingUpdate = (registration: ServiceWorkerRegistration) => {
        if (!registration.waiting || !navigator.serviceWorker.controller) return;
        setUpdateAvailable(true);
        setRegistrationState('update-available');
      };
      const watchInstallingWorker = (registration: ServiceWorkerRegistration) => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed') {
            markWaitingUpdate(registration);
            if (!navigator.serviceWorker.controller) setRegistrationState('registered');
          }
        });
      };
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          registrationRef.current = registration;
          setRegistrationState('registered');
          markWaitingUpdate(registration);
          registration.addEventListener('updatefound', () => watchInstallingWorker(registration));
          window.addEventListener('online', checkForUpdate);
          document.addEventListener('visibilitychange', checkVisibleUpdate);
        })
        .catch((error: unknown) => {
          setRegistrationError(
            error instanceof Error ? error.message : 'Service worker registration failed.'
          );
          setRegistrationState('error');
        });

      const handleControllerChange = () => {
        if (!updateRequestedRef.current || reloadedRef.current) return;
        reloadedRef.current = true;
        setRegistrationState('updated');
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
        window.removeEventListener('appinstalled', handleInstalled);
        window.removeEventListener('online', checkForUpdate);
        document.removeEventListener('visibilitychange', checkVisibleUpdate);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
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
    const waitingWorker = registrationRef.current?.waiting;
    if (!waitingWorker) return;
    updateRequestedRef.current = true;
    setRegistrationState('updating');
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  }, []);

  return {
    registrationState,
    installState,
    canInstall: installState === 'available',
    requestInstall,
    updateAvailable,
    applyUpdate,
    dismissUpdate: () => setUpdateAvailable(false),
    registrationError
  };
}
