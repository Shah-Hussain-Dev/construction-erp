import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Mock dependencies required by AuthScreen
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    cancelQueries: vi.fn(),
    removeQueries: vi.fn(),
    setQueryData: vi.fn(),
  }),
}));

vi.mock('../components/providers', () => ({
  useSession: () => ({ user: null, loading: false }),
}));

import { AuthScreen } from '../components/features/auth';

describe('AuthScreen & Demo Roles', () => {
  it('renders Administrator role button and card on login screen', () => {
    const html = renderToString(<AuthScreen />);
    expect(html).toContain('Administrator');
    expect(html).toContain('Full access to entire ERP');
    expect(html).toContain('admin@civil.example');
  });
});
