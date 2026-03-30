import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
  capitalize,
  validationAttribute,
  validationMessage,
  resourceMessage,
  crudSuccessMessage,
  crudErrorMessage,
  statusLabel,
  orderStatusLabel,
} from '../lang';
import i18next from '@/config/i18next';

vi.mock('@/config/i18next', () => ({
  default: {
    t: vi.fn(),
  },
}));

const mockT = i18next.t as unknown as Mock;

describe('capitalize', () => {
  it('capitalizes the first letter of a lowercase string', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('keeps already capitalized strings unchanged', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('handles single character strings', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('A')).toBe('A');
  });

  it('handles empty strings', () => {
    expect(capitalize('')).toBe('');
  });

  it('only capitalizes the first letter, leaves rest unchanged', () => {
    expect(capitalize('hELLO')).toBe('HELLO');
    expect(capitalize('hello world')).toBe('Hello world');
  });

  it('handles strings starting with numbers', () => {
    expect(capitalize('123abc')).toBe('123abc');
  });

  it('handles strings starting with special characters', () => {
    expect(capitalize('_test')).toBe('_test');
    expect(capitalize('!hello')).toBe('!hello');
  });
});

describe('validationAttribute', () => {
  beforeEach(() => {
    mockT.mockImplementation((key: string) => {
      const attrs: Record<string, string> = {
        'validation:attributes.name': 'name',
        'validation:attributes.email': 'email',
        'validation:attributes.firstName': 'first name',
      };
      return attrs[key] ?? key;
    });
  });

  it('returns capitalized attribute by default', () => {
    expect(validationAttribute('name')).toBe('Name');
    expect(validationAttribute('firstName')).toBe('First name');
  });

  it('returns lowercase attribute when toUpper is false', () => {
    expect(validationAttribute('name', false)).toBe('name');
    expect(validationAttribute('email', false)).toBe('email');
  });
});

describe('validationMessage', () => {
  beforeEach(() => {
    mockT.mockImplementation((key: string, options?: Record<string, unknown>) => {
      if (key === 'validation:attributes.email') return 'email';
      if (key === 'validation:required') {
        return `The ${options?.attribute} field is required.`;
      }
      return key;
    });
  });

  it('returns validation message with attribute', () => {
    const result = validationMessage('required', 'email');
    expect(result).toBe('The email field is required.');
  });

  it('returns validation message without attribute', () => {
    mockT.mockReturnValue('validation:min');
    const result = validationMessage('min');
    expect(result).toBe('validation:min');
  });
});

describe('resourceMessage', () => {
  beforeEach(() => {
    mockT.mockImplementation((key: string, options?: Record<string, unknown>) => {
      if (key === 'models:user') return options?.count === 1 ? 'user' : 'users';
      if (key === 'resource:failed_to_load') return `Failed to load ${options?.resource}.`;
      return key;
    });
  });

  it('returns resource message with singular model', () => {
    const result = resourceMessage('failed_to_load', 'user', 1);
    expect(result).toBe('Failed to load user.');
  });

  it('returns resource message with plural model', () => {
    const result = resourceMessage('failed_to_load', 'user', 2);
    expect(result).toBe('Failed to load users.');
  });
});

describe('crudSuccessMessage', () => {
  beforeEach(() => {
    mockT.mockImplementation((key: string, options?: Record<string, unknown>) => {
      if (key === 'models:order') return 'order';
      if (key === 'resource:success.created') return `${options?.resource} created successfully.`;
      return key;
    });
  });

  it('returns success message for action', () => {
    const result = crudSuccessMessage('created', 'order');
    expect(result).toBe('order created successfully.');
  });
});

describe('crudErrorMessage', () => {
  beforeEach(() => {
    mockT.mockImplementation((key: string, options?: Record<string, unknown>) => {
      if (key === 'models:order') return 'order';
      if (key === 'resource:error.deleted') return `Failed to delete ${options?.resource}.`;
      return key;
    });
  });

  it('returns error message for action', () => {
    const result = crudErrorMessage('deleted', 'order');
    expect(result).toBe('Failed to delete order.');
  });
});

describe('statusLabel', () => {
  beforeEach(() => {
    mockT.mockImplementation((key: string, options?: Record<string, unknown>) => {
      const labels: Record<string, string> = {
        'statuses:unknown': 'Unknown',
        'statuses:pending': 'Pending',
        'statuses:completed': 'Completed',
        'statuses:estimated': 'Estimate Sent',
        'statuses:assigned': 'Driver Assigned',
      };
      return labels[key] ?? options?.defaultValue ?? key;
    });
  });

  it('returns unknown for undefined status', () => {
    expect(statusLabel(undefined)).toBe('Unknown');
  });

  it('returns translated status', () => {
    expect(statusLabel('pending')).toBe('Pending');
    expect(statusLabel('completed')).toBe('Completed');
    expect(statusLabel('estimated')).toBe('Estimate Sent');
    expect(statusLabel('assigned')).toBe('Driver Assigned');
  });
});

describe('orderStatusLabel', () => {
  beforeEach(() => {
    mockT.mockImplementation((key: string, options?: Record<string, unknown>) => {
      const labels: Record<string, string> = {
        'statuses:unknown': 'Unknown',
        'statuses:pending': 'Pending',
        'statuses:estimated': 'Estimate Sent',
        'statuses:assigned': 'Driver Assigned',
      };
      return labels[key] ?? options?.defaultValue ?? key;
    });
  });

  it('returns unknown for undefined status', () => {
    expect(orderStatusLabel(undefined)).toBe('Unknown');
  });

  it('returns translated status labels', () => {
    expect(orderStatusLabel('pending')).toBe('Pending');
    expect(orderStatusLabel('estimated')).toBe('Estimate Sent');
    expect(orderStatusLabel('assigned')).toBe('Driver Assigned');
  });
});
