import { describe, expect, it } from 'vitest';
import { INITIAL_DATA } from '../constants';
import { coerceFirestoreAppState, migrateAppState } from './migrateAppState';

describe('migrateAppState', () => {
  it('coerce fills budgetCategories and schemaVersion for Firestore-shaped payloads', () => {
    const raw = {
      modules: INITIAL_DATA.modules,
      openingDate: INITIAL_DATA.openingDate,
      hammamStatus: INITIAL_DATA.hammamStatus,
      brandSettings: INITIAL_DATA.brandSettings,
    } as Record<string, unknown>;

    const coerced = coerceFirestoreAppState(raw);
    expect(coerced.budgetCategories).toEqual([]);
    expect(typeof coerced.schemaVersion).toBe('number');
  });

  it('migrates legacy opening date', () => {
    const coerced = coerceFirestoreAppState({
      modules: INITIAL_DATA.modules,
      openingDate: '2026-06-01',
      hammamStatus: INITIAL_DATA.hammamStatus,
      brandSettings: INITIAL_DATA.brandSettings,
    } as Record<string, unknown>);
    const { state, migrated } = migrateAppState(coerced);
    expect(migrated).toBe(true);
    expect(state.openingDate).toBe('2026-06-19');
  });

  it('round-trips INITIAL_DATA without structural migration', () => {
    const { state, migrated } = migrateAppState(structuredClone(INITIAL_DATA));
    expect(state.budgetCategories).toEqual([]);
    expect(migrated).toBe(false);
  });

  it('coerce falls back to template modules when Zod rejects stored modules type', () => {
    const coerced = coerceFirestoreAppState({
      modules: 'not-an-array',
      openingDate: INITIAL_DATA.openingDate,
      hammamStatus: INITIAL_DATA.hammamStatus,
      brandSettings: INITIAL_DATA.brandSettings,
    } as unknown as Record<string, unknown>);
    expect(coerced.modules).toEqual(INITIAL_DATA.modules);
  });
});
