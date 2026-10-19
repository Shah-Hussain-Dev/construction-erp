'use client';

import React from 'react';
import { CaretDown, MagnifyingGlass, X } from '@phosphor-icons/react';
import { Button } from './button';

export interface ToolbarFilterOption {
  value: string;
  label: string;
}

export interface ToolbarFilter {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ToolbarFilterOption[];
  allLabel: string;
}

export interface ListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filters?: ToolbarFilter[];
  onReset?: () => void;
  className?: string;
}

export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  onReset,
  className,
}: ListToolbarProps) {
  const hasActiveFilters =
    search.trim().length > 0 || filters.some((filter) => filter.value !== 'all');

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between ${className || ''}`}
    >
      <div className="relative w-full lg:max-w-md">
        <MagnifyingGlass
          size={16}
          weight="bold"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs text-slate-800 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={13} weight="bold" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <div key={filter.id} className="relative">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              aria-label={filter.label}
              className="h-9 min-w-[150px] appearance-none rounded-lg border border-slate-200 bg-slate-50 py-0 pl-3 pr-8 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">{filter.allLabel}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <CaretDown
              size={12}
              weight="bold"
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        ))}

        {hasActiveFilters && onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 text-xs text-slate-500"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
