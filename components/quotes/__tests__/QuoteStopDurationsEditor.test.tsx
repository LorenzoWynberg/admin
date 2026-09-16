import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  QuoteStopDurationsEditor,
  DEFAULT_STOP_DURATION_MINUTES,
} from '../QuoteStopDurationsEditor';

// This editor has no state of its own — `durations` is controlled entirely by
// the parent (CreateQuoteDialog), and the box's value came straight from that
// record: `durations[publicId] ?? DEFAULT_STOP_DURATION_MINUTES`. Clearing the
// box turned `parseInt('', 10)` into `NaN`, which was clamped to the default
// (5) and written straight back into the parent's `durations` on that same
// keystroke — React re-asserts a controlled <input type="number">'s value
// onto the DOM after every change event, so the box was unclearable and a
// multi-digit retype landed wrong: clearing "15" snapped it to "5", and
// typing "3" next produced "53", exactly as described for this bug family.
// The fix decouples the box from the committed value with a local raw-string
// draft and only clamps on blur, this editor's only commit point.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/utils/lang', () => ({
  capitalize: (s: string) => s,
}));

const stops: App.Data.Order.OrderStopData[] = [
  { publicId: 'stop-1', type: 'pickup' as App.Enums.OrderStopType },
];

function Harness({ initial = {} }: { initial?: Record<string, number> }) {
  const [durations, setDurations] = useState<Record<string, number>>(initial);
  return <QuoteStopDurationsEditor stops={stops} durations={durations} onChange={setDurations} />;
}

function getInput(): HTMLInputElement {
  return screen.getByRole('spinbutton') as HTMLInputElement;
}

describe('QuoteStopDurationsEditor — stays clearable', () => {
  it('does not write the default back into the box when it is emptied', async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ 'stop-1': 15 }} />);

    const input = getInput();
    expect(input.value).toBe('15');

    await user.clear(input);

    expect(input.value).toBe('');
  });

  it('does not garble a multi-digit retype (clearing 15 and typing 3 yields 3, not 53)', async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ 'stop-1': 15 }} />);

    const input = getInput();
    await user.clear(input);
    await user.type(input, '3');

    expect(input.value).toBe('3');
  });
});

describe('QuoteStopDurationsEditor — clamps only on commit (blur), never while typing', () => {
  it('leaves an over-range value on screen untouched while the field is still focused', async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ 'stop-1': 5 }} />);

    const input = getInput();
    await user.clear(input);
    await user.type(input, '999');

    // Still focused — not yet clamped to MAX_STOP_DURATION_MINUTES (240).
    expect(input.value).toBe('999');
  });

  // These two render with a plain `vi.fn()` for `onChange` rather than the
  // stateful `Harness` above — deliberately, so the assertion is about
  // exactly what the parent is told to commit, isolated from a re-render
  // feeding a new `durations` prop back in. That also means the box's `value`
  // never changes on its own here: it is pinned to the literal `durations`
  // passed at render, so typing past it is only visible through the DOM's own
  // reassertion of that pinned value — which is what actually proves the
  // "still focused, not yet clamped" and "clamped once blurred" halves of
  // this behavior are two different moments, not one.
  it('clamps to the max and commits it upstream once the field is blurred', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <QuoteStopDurationsEditor stops={stops} durations={{ 'stop-1': 5 }} onChange={onChange} />
    );

    const input = getInput();
    await user.clear(input);
    await user.type(input, '999');
    await user.tab();

    expect(input.value).toBe('240');
    expect(onChange).toHaveBeenCalledWith({ 'stop-1': 240 });
  });

  it('falls back to the default and commits it upstream when left empty on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <QuoteStopDurationsEditor stops={stops} durations={{ 'stop-1': 15 }} onChange={onChange} />
    );

    const input = getInput();
    await user.clear(input);
    await user.tab();

    expect(input.value).toBe(String(DEFAULT_STOP_DURATION_MINUTES));
    expect(onChange).toHaveBeenCalledWith({ 'stop-1': DEFAULT_STOP_DURATION_MINUTES });
  });

  it('does not call onChange while the field is still being edited', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <QuoteStopDurationsEditor stops={stops} durations={{ 'stop-1': 5 }} onChange={onChange} />
    );

    const input = getInput();
    await user.clear(input);
    await user.type(input, '18');

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('QuoteStopDurationsEditor — never commits a field the admin did not edit', () => {
  it('does not write the default duration upstream when a box is only tabbed through', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuoteStopDurationsEditor stops={stops} durations={{}} onChange={onChange} />);

    const input = getInput();
    await user.click(input);
    await user.tab();

    // The box was focused and blurred, but never typed into — committing
    // here would insert DEFAULT_STOP_DURATION_MINUTES into `durations` for a
    // stop the admin never touched, when the server should be free to apply
    // its own default instead.
    expect(onChange).not.toHaveBeenCalled();
  });
});
