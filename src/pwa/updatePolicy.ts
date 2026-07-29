import { needsUnloadProtection, ProjectSaveState } from '../persistence/localSaveCoordinator';

export type UpdateDecision = 'updated' | 'blocked';

export async function applyUpdateWhenSafe(
  state: ProjectSaveState,
  saveNow: () => Promise<ProjectSaveState>,
  applyUpdate: () => Promise<void>
): Promise<UpdateDecision> {
  let confirmedState = state;
  if (needsUnloadProtection(confirmedState)) {
    confirmedState = await saveNow();
  }
  if (needsUnloadProtection(confirmedState) || confirmedState.status === 'conflict') {
    return 'blocked';
  }
  await applyUpdate();
  return 'updated';
}
