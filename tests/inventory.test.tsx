import { describe, it, expect } from 'vitest';
import { modules, moduleFor } from '../lib/modules';

describe('Inventory Stock Configuration & Layout', () => {
  it('locates the stock-balances module for /inventory/stock', () => {
    const stockModule = moduleFor('/inventory/stock');
    expect(stockModule).toBeDefined();
    expect(stockModule?.resource).toBe('stock-balances');
    expect(stockModule?.title).toBe('Stock overview');
    expect(stockModule?.readonly).toBe(true);
  });

  it('contains proper fields configuration without icon dependencies', () => {
    const stockModule = moduleFor('/inventory/stock');
    const itemField = stockModule?.fields.find((f) => f.key === 'itemId');
    expect(itemField?.label).toBe('Material');
  });
});
