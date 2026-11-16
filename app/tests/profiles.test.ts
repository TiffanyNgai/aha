import { describe, expect, it } from 'vitest';
import { switchProfile, useProgress } from '../src/store/progress';
import { DEFAULT_PROFILE_ID, progressKeyFor, safeStorage, useProfiles } from '../src/store/profiles';

// No localStorage under vitest's node environment, so safeStorage falls back to its in-memory map.
describe('learner profiles', () => {
  it('keeps each profile’s progress apart', async () => {
    useProgress.getState().addPracticeXp(50);
    expect(useProgress.getState().xp).toBe(50);

    const sam = useProfiles.getState().add('Sam', '🐼');
    await switchProfile(sam.id);
    expect(useProfiles.getState().active).toBe(sam.id);
    expect(useProgress.getState().xp).toBe(0);

    useProgress.getState().addPracticeXp(7);
    await switchProfile(DEFAULT_PROFILE_ID);
    expect(useProgress.getState().xp).toBe(50);

    await switchProfile(sam.id);
    expect(useProgress.getState().xp).toBe(7);
  });

  it('stores the default profile under the legacy key', () => {
    expect(progressKeyFor(DEFAULT_PROFILE_ID)).toBe('aha-progress');
    expect(progressKeyFor('p123')).toBe('aha-progress:p123');
  });

  it('deletes a removed profile’s progress and never removes the last profile', async () => {
    const list = useProfiles.getState().list;
    const extra = list.find((p) => p.id !== DEFAULT_PROFILE_ID)!;
    await switchProfile(DEFAULT_PROFILE_ID);
    useProfiles.getState().remove(extra.id);
    expect(safeStorage.getItem(progressKeyFor(extra.id))).toBeNull();
    expect(useProfiles.getState().list).toHaveLength(1);
    useProfiles.getState().remove(DEFAULT_PROFILE_ID);
    expect(useProfiles.getState().list).toHaveLength(1);
  });
});
