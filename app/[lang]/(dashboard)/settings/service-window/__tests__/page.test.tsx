import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ServiceWindowPage from '../page';

// The escalation-hours field held its value as a *number* and clamped the
// typed string to [1, 24] on every keystroke —
// `setEscalationHours(Math.max(1, Math.min(24, Number(e.target.value))))`.
// React re-asserts a controlled `<input type="number">`'s value onto the DOM
// after every change event, so clearing the box produced `Number('')` -> `0`,
// clamped straight to `1`, and that `1` was written back into the DOM before
// the next keystroke landed — the box could never be emptied. The fix holds
// the typed string as-is and only parses/validates it at read time.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
    ready: true,
  }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
}));

const settingData: App.Data.Setting.SettingData = {
  noServiceStart: '22:00:00',
  noServiceEnd: '06:00:00',
  serviceWindowEnabled: true,
  unassignedEscalationHours: 4,
  unassignedAutoCancelEnabled: true,
  exchangeRateMode: 'auto' as App.Enums.ExchangeRateMode,
  idleMinuteRate: 0,
  idleGraceMinutes: 0,
};

const updateMutate = vi.fn();

vi.mock('@/hooks/settings', () => ({
  useServiceWindow: () => ({ data: settingData, isLoading: false }),
  useUpdateServiceWindow: () => ({ mutate: updateMutate, isPending: false }),
}));

beforeEach(() => {
  updateMutate.mockClear();
});

describe('ServiceWindowPage — escalation hours stays clearable', () => {
  it('does not write 1 back into the field when the box is emptied', async () => {
    const user = userEvent.setup();
    render(<ServiceWindowPage />);

    const hours = screen.getByLabelText('common:unassigned_escalation_hours') as HTMLInputElement;
    expect(hours.value).toBe('4');

    await user.clear(hours);

    expect(hours.value).toBe('');
  });

  it('does not garble a multi-digit retype (clearing 15 and typing 12 yields 12, not 24)', async () => {
    const user = userEvent.setup();
    render(<ServiceWindowPage />);

    const hours = screen.getByLabelText('common:unassigned_escalation_hours') as HTMLInputElement;
    await user.clear(hours);
    await user.type(hours, '12');

    expect(hours.value).toBe('12');
  });
});

describe('ServiceWindowPage — escalation hours reaches the API as a valid number', () => {
  it('sends a retyped escalation-hours value as a number', async () => {
    const user = userEvent.setup();
    render(<ServiceWindowPage />);

    const hours = screen.getByLabelText('common:unassigned_escalation_hours') as HTMLInputElement;
    await user.clear(hours);
    await user.type(hours, '12');

    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(updateMutate).toHaveBeenCalled();
    const call = updateMutate.mock.calls[0][0];
    expect(call.unassignedEscalationHours).toBe(12);
    expect(typeof call.unassignedEscalationHours).toBe('number');
  });

  it('disables Save while the box is empty, rather than silently falling back to a default', async () => {
    const user = userEvent.setup();
    render(<ServiceWindowPage />);

    const hours = screen.getByLabelText('common:unassigned_escalation_hours') as HTMLInputElement;
    await user.clear(hours);

    expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
  });

  it('disables Save while the value is out of the 1-24 range', async () => {
    const user = userEvent.setup();
    render(<ServiceWindowPage />);

    const hours = screen.getByLabelText('common:unassigned_escalation_hours') as HTMLInputElement;
    await user.clear(hours);
    await user.type(hours, '99');

    expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
  });
});
