export type InstallState =
  | 'unsupported'
  | 'available'
  | 'prompting'
  | 'accepted'
  | 'dismissed'
  | 'installed'
  | 'standalone';

export function installStateForEnvironment(
  standalone: boolean,
  hasInstallPrompt: boolean
): InstallState {
  if (standalone) return 'standalone';
  return hasInstallPrompt ? 'available' : 'unsupported';
}
