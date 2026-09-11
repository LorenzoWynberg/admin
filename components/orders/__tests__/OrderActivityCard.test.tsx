import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { OrderActivityCard } from '../OrderActivityCard';

type OrderData = App.Data.Order.OrderData;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  statusLabel: (key: string) => key,
}));

vi.mock('@/utils/format', () => ({
  formatDateTime: (value: string) => value,
}));

vi.mock('@/hooks/audit-logs', () => ({
  useAuditLogList: () => ({
    data: {
      items: [
        {
          id: 1,
          action: 'created',
          userName: 'Jane Doe',
          createdAt: '2026-01-01T00:00:00Z',
          data: null,
        },
      ],
    },
    isLoading: false,
  }),
}));

function orderWith(overrides: Partial<OrderData>): OrderData {
  return { id: 1, ...overrides } as OrderData;
}

// prettier-plugin-tailwindcss rewrites class strings inside template literals,
// and once ate the leading space of the conditional half — emitting
// `space-y-1border-t pt-3`, which kills both `space-y-1` and `border-t`.
// Asserting on the individual classes is what catches that: a fused
// `space-y-1border-t` token matches neither.
describe('OrderActivityCard — activity trail separator', () => {
  it('keeps spacing and separator classes distinct when the order has a schedule', () => {
    render(<OrderActivityCard order={orderWith({ desiredPickupAt: '2026-01-02T10:00:00Z' })} />);

    const trail = screen.getByTestId('activity-trail');
    expect(trail).toHaveClass('space-y-1');
    expect(trail).toHaveClass('border-t');
    expect(trail).toHaveClass('pt-3');
  });

  it('keeps the spacing class and drops the separator when there is no schedule', () => {
    render(<OrderActivityCard order={orderWith({})} />);

    const trail = screen.getByTestId('activity-trail');
    expect(trail).toHaveClass('space-y-1');
    expect(trail).not.toHaveClass('border-t');
    expect(trail).not.toHaveClass('pt-3');
  });
});
