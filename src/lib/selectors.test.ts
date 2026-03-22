import { describe, expect, it } from 'vitest';
import { INITIAL_DATA } from '../constants';
import {
  hammamEstimatedBudget,
  onTrackStatus,
  totalBudget,
  totalSpent,
} from './selectors';

describe('selectors', () => {
  it('totals budgets from tasks', () => {
    const state = structuredClone(INITIAL_DATA);
    state.modules[0].tasks[0].estimatedCost = 100;
    state.modules[0].tasks[0].actualCost = 50;
    expect(totalBudget(state)).toBeGreaterThanOrEqual(100);
    expect(totalSpent(state)).toBeGreaterThanOrEqual(50);
  });

  it('hammamEstimatedBudget sums interior hammam-related tasks', () => {
    const state = structuredClone(INITIAL_DATA);
    const interior = state.modules.find((m) => m.id === 'interior');
    expect(interior).toBeDefined();
    const i3 = interior!.tasks.find((t) => t.id === 'i3');
    if (i3) i3.estimatedCost = 8120;
    expect(hammamEstimatedBudget(state)).toBe(8120);
  });

  it('onTrackStatus reflects overdue incomplete tasks', () => {
    const state = structuredClone(INITIAL_DATA);
    const t = state.modules[0].tasks[0];
    t.status = 'todo';
    t.dueDate = '2020-01-01';
    expect(onTrackStatus(state)).toBe('at-risk');
  });
});
