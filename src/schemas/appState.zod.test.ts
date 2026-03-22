import { describe, expect, it } from 'vitest';
import { safeParseFirestoreAppStateRoot } from './appState.zod';

describe('appState.zod', () => {
  it('accepts minimal legacy-shaped objects', () => {
    const r = safeParseFirestoreAppStateRoot({
      modules: [],
      budgetCategories: [],
      openingDate: '2026-01-01',
      hammamStatus: 'Ready',
      brandSettings: {},
    });
    expect(r).not.toBeNull();
  });

  it('rejects wrong module type', () => {
    expect(
      safeParseFirestoreAppStateRoot({
        modules: 'nope',
        budgetCategories: [],
        openingDate: '2026-01-01',
        hammamStatus: 'Ready',
        brandSettings: {},
      })
    ).toBeNull();
  });
});
