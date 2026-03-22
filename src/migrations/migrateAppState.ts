import { INITIAL_DATA } from '../constants';
import { safeParseFirestoreAppStateRoot } from '../schemas/appState.zod';
import type { AppState, Module } from '../types';

export const CURRENT_SCHEMA_VERSION = 1;

const OLD_HAMMAM_DESCRIPTION =
  'Specialized plumbing (steam/drainage), marble/tile selection, heating system, and moisture-proof ventilation.';

const NEW_HAMMAM_DESCRIPTION =
  'Implementation of specialized plumbing for high-pressure steam and rapid drainage. Selection of premium moisture-resistant marble and non-slip tiles. Installation of an underfloor heating system and high-capacity moisture-proof ventilation to prevent mold and ensure guest comfort.';

/**
 * Coerce unknown Firestore payload into a workable AppState shape, then apply migrations.
 * Zod rejects payloads that cannot satisfy Firestore rules (wrong types at top level).
 */
export function coerceFirestoreAppState(raw: Record<string, unknown>): AppState {
  const validated = safeParseFirestoreAppStateRoot(raw);
  const source: Record<string, unknown> = validated ?? {};

  const brand =
    (source.brandSettings as AppState['brandSettings'] | undefined) ??
    INITIAL_DATA.brandSettings;
  const palette = {
    ...INITIAL_DATA.brandSettings.palette,
    ...(brand.palette ?? {}),
  };
  const modules = (source.modules as Module[] | undefined) ?? INITIAL_DATA.modules;

  return {
    schemaVersion:
      typeof source.schemaVersion === 'number'
        ? source.schemaVersion
        : INITIAL_DATA.schemaVersion,
    modules,
    budgetCategories: Array.isArray(source.budgetCategories)
      ? (source.budgetCategories as AppState['budgetCategories'])
      : [],
    openingDate:
      typeof source.openingDate === 'string' ? source.openingDate : INITIAL_DATA.openingDate,
    hammamStatus:
      (source.hammamStatus as AppState['hammamStatus']) ?? INITIAL_DATA.hammamStatus,
    brandSettings: {
      ...INITIAL_DATA.brandSettings,
      ...brand,
      palette,
    },
  };
}

export function migrateAppState(data: AppState): { state: AppState; migrated: boolean } {
  const next = structuredClone(data);
  let migrated = false;

  if (!Array.isArray(next.budgetCategories)) {
    next.budgetCategories = [];
    migrated = true;
  }
  if (typeof next.schemaVersion !== 'number' || next.schemaVersion < 1) {
    next.schemaVersion = CURRENT_SCHEMA_VERSION;
    migrated = true;
  }

  if (next.openingDate === '2026-06-01') {
    next.openingDate = '2026-06-19';
    migrated = true;
  }
  if (next.brandSettings.salonName === 'Éclat Salon') {
    next.brandSettings.salonName = 'Elegancia';
    migrated = true;
  }

  const interiorModule = next.modules.find((m) => m.id === 'interior');
  if (interiorModule) {
    const hammamTask = interiorModule.tasks.find((t) => t.id === 'i3');
    if (hammamTask && hammamTask.description === OLD_HAMMAM_DESCRIPTION) {
      hammamTask.description = NEW_HAMMAM_DESCRIPTION;
      migrated = true;
    }
  }

  INITIAL_DATA.modules.forEach((initialMod) => {
    const existingMod = next.modules.find((m) => m.id === initialMod.id);
    if (!existingMod) {
      next.modules.push(structuredClone(initialMod));
      migrated = true;
    } else {
      initialMod.tasks.forEach((initialTask) => {
        if (!existingMod.tasks.some((t) => t.id === initialTask.id)) {
          existingMod.tasks.push(structuredClone(initialTask));
          migrated = true;
        }
      });
    }
  });

  return { state: next, migrated };
}
