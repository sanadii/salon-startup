import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { INITIAL_DATA } from '../constants';
import { Settings } from './Settings';

describe('Settings', () => {
  it('shows current salon name', () => {
    render(
      <Settings
        state={INITIAL_DATA}
        onUpdate={vi.fn()}
        onResetTimeline={vi.fn()}
        onExportJson={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue(INITIAL_DATA.brandSettings.salonName)).toBeInTheDocument();
  });
});
