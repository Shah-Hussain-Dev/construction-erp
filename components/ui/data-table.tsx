'use client';

import React, { useMemo, useState } from 'react';
import {
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowsDownUp,
  CaretLeft,
  CaretRight,
  CaretDoubleLeft,
  CaretDoubleRight,
  Columns,
  DownloadSimple,
  Funnel,
  MagnifyingGlass,
  Rows,
  Tray,
  X,
} from '@phosphor-icons/react';
import { Button } from './button';
import { Modal } from './primitives';

export type ColumnAlignment = 'left' | 'center' | 'right';

export function getColumnAlignment(
  columnId: string,
  headerDef?: unknown,
  metaAlign?: string
): ColumnAlignment {
  if (metaAlign === 'left' || metaAlign === 'center' || metaAlign === 'right') {
    return metaAlign;
  }
  const id = columnId.toLowerCase();

  if (['select', 'open', 'actions', 'action'].includes(id)) {
    return 'center';
  }

  let headerText = '';
  if (typeof headerDef === 'string') {
    headerText = headerDef.toLowerCase();
  }

  const rightKeywords = [
    'amount', 'value', 'rate', 'qty', 'quantity', 'balance', 'budget',
    'spent', 'remaining', 'committed', 'variance', 'total', 'net', 'gross',
    'debit', 'credit', 'price', 'cost', 'deduction', 'reserved',
    'reorderlevel', 'completion', 'count', 'inr', 'tax'
  ];

  if (headerText === 'details' || id === 'detail' || id === 'details') {
    return 'left';
  }

  if (
    rightKeywords.some((kw) => id.includes(kw)) ||
    (headerText && rightKeywords.some((kw) => headerText.includes(kw)))
  ) {
    return 'right';
  }

  return 'left';
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  // Identification
  getRowId?: (row: TData) => string;
  caption?: string;
  // Controlled or uncontrolled pagination
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  // Controlled or uncontrolled sorting
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  onSortBy?: (columnId: string) => void;
  currentSort?: string;
  currentDirection?: 'asc' | 'desc';
  // Searching & Filtering
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filterCount?: number;
  onOpenFilters?: () => void;
  // Tabs / Status Filters
  tabs?: { id: string; label: string; count?: number }[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  // Row selection
  selectionMap?: RowSelectionState;
  onSelectionChange?: OnChangeFn<RowSelectionState>;
  selectionActions?: React.ReactNode;
  onClearSelection?: () => void;
  onExportSelected?: () => void;
  onExportAll?: () => void;
  // Density
  density?: 'compact' | 'comfortable';
  onDensityChange?: (density: 'compact' | 'comfortable') => void;
  // Column visibility
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  // States
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  // Interaction
  onRowClick?: (row: TData) => void;
  // Mobile fallback
  renderMobileCard?: (row: TData, index: number) => React.ReactNode;
  // Extra toolbar tools
  extraTools?: React.ReactNode;
  className?: string;
  bordered?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  getRowId = (row: TData) => (row as { id?: string }).id || JSON.stringify(row),
  caption,
  page: controlledPage,
  pageSize: controlledPageSize = 10,
  totalCount: controlledTotal,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  sorting: controlledSorting,
  onSortingChange,
  onSortBy,
  currentSort,
  currentDirection,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records…',
  filterCount = 0,
  onOpenFilters,
  tabs,
  activeTab,
  onTabChange,
  selectionMap,
  onSelectionChange,
  selectionActions,
  onClearSelection,
  onExportSelected,
  onExportAll,
  density: controlledDensity,
  onDensityChange,
  columnVisibility: controlledVisibility,
  onColumnVisibilityChange,
  isLoading = false,
  emptyTitle = 'No matching records',
  emptyDescription = 'Try adjusting your search query or active filters.',
  emptyAction,
  onRowClick,
  renderMobileCard,
  extraTools,
  className = '',
  bordered = true,
}: DataTableProps<TData>) {
  // Internal state when not controlled
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(controlledPageSize);
  const [internalSearch, setInternalSearch] = useState('');
  const [internalDensity, setInternalDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [internalVisibility, setInternalVisibility] = useState<VisibilityState>({});
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({});
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);

  const isControlledPagination = controlledPage !== undefined && onPageChange !== undefined;
  const isControlledSorting = controlledSorting !== undefined && onSortingChange !== undefined;
  const isControlledDensity = controlledDensity !== undefined;
  const isControlledVisibility = controlledVisibility !== undefined;
  const isControlledSelection = selectionMap !== undefined && onSelectionChange !== undefined;

  const currentDensity = isControlledDensity ? controlledDensity : internalDensity;
  const currentVisibilityState = isControlledVisibility
    ? controlledVisibility
    : internalVisibility;
  const currentSelectionState = isControlledSelection ? selectionMap : internalSelection;
  const effectiveSearch = searchQuery !== undefined ? searchQuery : internalSearch;

  // Client-side filtering when not controlled externally
  const filteredData = useMemo(() => {
    if (searchQuery !== undefined) return data; // Handled externally
    if (!internalSearch.trim()) return data;
    const q = internalSearch.toLowerCase().trim();
    return data.filter((row: TData) => {
      const obj = row as Record<string, unknown>;
      return Object.values(obj).some((val) => {
        if (val == null) return false;
        if (typeof val === 'object') return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, searchQuery, internalSearch]);

  const table = useReactTable({
    data: isControlledPagination ? data : filteredData,
    columns,
    getRowId,
    state: {
      sorting: isControlledSorting ? controlledSorting : internalSorting,
      columnVisibility: currentVisibilityState,
      rowSelection: currentSelectionState,
    },
    onSortingChange: isControlledSorting ? onSortingChange : setInternalSorting,
    onColumnVisibilityChange: isControlledVisibility
      ? onColumnVisibilityChange
      : setInternalVisibility,
    onRowSelectionChange: isControlledSelection ? onSelectionChange : setInternalSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: !onSortBy ? getSortedRowModel() : undefined,
    manualPagination: isControlledPagination,
    manualSorting: !!onSortBy,
  });

  const totalItems = controlledTotal !== undefined ? controlledTotal : filteredData.length;
  const currentPage = isControlledPagination ? controlledPage : internalPage;
  const currentPageSize = isControlledPagination ? controlledPageSize : internalPageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / currentPageSize));

  const handlePageChange = (newPage: number) => {
    const clamped = Math.min(Math.max(1, newPage), totalPages);
    if (isControlledPagination) {
      onPageChange(clamped);
    } else {
      setInternalPage(clamped);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  };

  const handleDensityToggle = () => {
    const next = currentDensity === 'compact' ? 'comfortable' : 'compact';
    if (onDensityChange) {
      onDensityChange(next);
    } else {
      setInternalDensity(next);
    }
  };

  const handleSearchInput = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
      setInternalPage(1);
    }
  };

  // Compute selected row count
  const selectedCount = Object.values(currentSelectionState).filter(Boolean).length;

  // Uncontrolled pagination slice
  const rowsToDisplay = isControlledPagination
    ? table.getRowModel().rows
    : table
        .getRowModel()
        .rows.slice((currentPage - 1) * currentPageSize, currentPage * currentPageSize);

  return (
    <div
      className={`data-table-container ${currentDensity === 'compact' ? 'is-compact' : 'is-comfortable'} ${bordered ? 'data-table-bordered' : ''} ${renderMobileCard ? 'has-mobile-cards' : ''} ${className}`}
    >
      {/* Optional Status Tabs Bar */}
      {tabs && tabs.length > 0 && (
        <div className="data-table-tabs" role="tablist" aria-label="Filter status">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                className={`data-table-tab ${isActive ? 'is-active' : ''}`}
                onClick={() => onTabChange?.(tab.id)}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`data-table-tab-badge ${isActive ? 'is-active' : ''}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Interactive Toolbar */}
      <div className="data-table-toolbar">
        <div className="data-table-search">
          <MagnifyingGlass size={18} className="search-icon" weight="bold" />
          <input
            type="text"
            value={effectiveSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
          {effectiveSearch && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => handleSearchInput('')}
              aria-label="Clear search query"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>

        <div className="data-table-actions">
          {onOpenFilters && (
            <Button
              variant="outline"
              size="default"
              onClick={onOpenFilters}
              className="data-table-tool-btn"
            >
              <Funnel size={16} weight={filterCount > 0 ? 'fill' : 'regular'} />
              <span>Filters</span>
              {filterCount > 0 && (
                <span className="data-table-filter-badge">{filterCount}</span>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="default"
            onClick={() => setColumnsModalOpen(true)}
            className="data-table-tool-btn desktop-only"
            title="Toggle column visibility"
          >
            <Columns size={16} />
            <span>Columns</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleDensityToggle}
            className="data-table-tool-btn desktop-only"
            aria-label={currentDensity === 'compact' ? 'Comfortable density' : 'Compact density'}
            title={currentDensity === 'compact' ? 'Switch to comfortable rows' : 'Switch to compact rows'}
          >
            <Rows size={18} />
          </Button>

          {onExportAll && (
            <Button
              variant="outline"
              size="default"
              onClick={onExportAll}
              disabled={totalItems === 0}
              className="data-table-tool-btn"
            >
              <DownloadSimple size={16} />
              <span>Export</span>
            </Button>
          )}

          {extraTools}
        </div>
      </div>

      {/* Active Multi-Row Selection Banner */}
      {selectedCount > 0 && (
        <div className="data-table-selection-banner" role="status" aria-live="polite">
          <div className="selection-count">
            <span className="selection-dot" />
            <strong>{selectedCount}</strong> {selectedCount === 1 ? 'record' : 'records'} selected
          </div>
          <div className="selection-actions">
            {onExportSelected && (
              <Button
                variant="outline"
                size="default"
                onClick={onExportSelected}
                className="selection-btn"
              >
                <DownloadSimple size={15} />
                Export selected
              </Button>
            )}
            {selectionActions}
            {(onClearSelection || onSelectionChange) && (
              <Button
                variant="ghost"
                size="default"
                onClick={() => {
                  if (onClearSelection) onClearSelection();
                  else if (onSelectionChange) onSelectionChange({});
                  else setInternalSelection({});
                }}
                className="selection-btn selection-clear-btn"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Loading Skeleton View */}
      {isLoading ? (
        <div className="data-table-loading" aria-busy="true" aria-label="Loading table records">
          <div className="data-table-skeleton-header" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div className="data-table-skeleton-row" key={i} />
          ))}
        </div>
      ) : rowsToDisplay.length === 0 ? (
        /* Empty State */
        <div className="data-table-empty">
          <div className="empty-icon-wrap">
            <Tray size={36} weight="duotone" />
          </div>
          <h3 className="empty-title">{emptyTitle}</h3>
          <p className="empty-description">{emptyDescription}</p>
          {emptyAction && <div className="empty-actions">{emptyAction}</div>}
        </div>
      ) : (
        /* Primary Desktop Table Surface */
        <>
          <div className="data-table-scroll-wrapper" tabIndex={0} role="region" aria-label="Data table">
            <table className="data-table-core">
              {caption && <caption className="sr-only">{caption}</caption>}
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const isSorted =
                        currentSort !== undefined
                          ? currentSort === header.id
                            ? currentDirection
                            : false
                          : header.column.getIsSorted();

                      const canSort = header.column.getCanSort() || !!onSortBy;
                      const isActionOrSelect = ['select', 'open', 'actions', 'action'].includes(header.id);
                      const metaAlign = (header.column.columnDef.meta as { align?: ColumnAlignment })?.align;
                      const alignment = getColumnAlignment(header.id, header.column.columnDef.header, metaAlign);
                      const alignClass = `align-${alignment}`;

                      return (
                        <th
                          key={header.id}
                          data-column={header.id}
                          className={`data-table-th th-${header.id} ${alignClass} ${
                            isActionOrSelect ? 'th-fixed' : ''
                          }`}
                          aria-sort={
                            isSorted === 'asc'
                              ? 'ascending'
                              : isSorted === 'desc'
                                ? 'descending'
                                : undefined
                          }
                        >
                          {header.isPlaceholder ? null : isActionOrSelect || !canSort ? (
                            <div className={`th-content ${alignClass}`}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </div>
                          ) : (
                            <button
                              type="button"
                              className={`data-table-sort-btn ${alignClass} ${isSorted ? 'is-sorted' : ''}`}
                              onClick={() => {
                                if (onSortBy) {
                                  onSortBy(header.id);
                                } else {
                                  header.column.toggleSorting();
                                }
                              }}
                            >
                              <span>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </span>
                              <span className="sort-icon-box">
                                {isSorted === 'asc' ? (
                                  <ArrowUp size={13} weight="bold" />
                                ) : isSorted === 'desc' ? (
                                  <ArrowDown size={13} weight="bold" />
                                ) : (
                                  <ArrowsDownUp size={13} className="neutral-sort" />
                                )}
                              </span>
                            </button>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {rowsToDisplay.map((row) => {
                  const isSelected = row.getIsSelected();
                  return (
                    <tr
                      key={row.id}
                      data-selected={isSelected}
                      className={`data-table-row ${isSelected ? 'row-selected' : ''}`}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const cellMetaAlign = (cell.column.columnDef.meta as { align?: ColumnAlignment })?.align;
                        const cellAlignment = getColumnAlignment(cell.column.id, cell.column.columnDef.header, cellMetaAlign);
                        const cellAlignClass = `align-${cellAlignment}`;
                        return (
                          <td
                            key={cell.id}
                            data-column={cell.column.id}
                            className={`data-table-td td-${cell.column.id} ${cellAlignClass}`}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Fallback Card Stack */}
          {renderMobileCard && (
            <div className="data-table-mobile-cards">
              {rowsToDisplay.map((row, index) => (
                <div key={row.id} className="data-table-mobile-card-item">
                  {renderMobileCard(row.original, index)}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="data-table-pagination">
          <div className="pagination-info">
            <span>
              Showing{' '}
              <strong className="font-mono">
                {(currentPage - 1) * currentPageSize + 1}
              </strong>
              –
              <strong className="font-mono">
                {Math.min(currentPage * currentPageSize, totalItems)}
              </strong>{' '}
              of <strong className="font-mono">{totalItems}</strong> records
            </span>
          </div>

          <div className="pagination-controls">
            <label className="data-table-page-size-label">
              <span>Rows</span>
              <select
                value={currentPageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                aria-label="Records per page"
                className="data-table-page-size-select"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <div className="pagination-nav-group">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(1)}
                aria-label="First page"
                className="pagination-nav-btn desktop-only"
              >
                <CaretDoubleLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label="Previous page"
                className="pagination-nav-btn"
              >
                <CaretLeft size={16} />
              </Button>

              <div className="pagination-page-indicator">
                <span className="page-current font-mono">{currentPage}</span>
                <span className="page-divider">/</span>
                <span className="page-total font-mono">{totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label="Next page"
                className="pagination-nav-btn"
              >
                <CaretRight size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(totalPages)}
                aria-label="Last page"
                className="pagination-nav-btn desktop-only"
              >
                <CaretDoubleRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Column Visibility Configuration Modal */}
      <Modal
        open={columnsModalOpen}
        onOpenChange={setColumnsModalOpen}
        title="Customize columns"
        description="Choose which columns are visible in this data table."
      >
        <div className="column-visibility-modal-content">
          <div className="column-visibility-list">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== 'undefined' ||
                  (column.columnDef.header && !['select', 'open', 'actions'].includes(column.id)),
              )
              .map((column) => {
                const headerText =
                  typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : column.id;
                return (
                  <label key={column.id} className="column-visibility-item">
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      disabled={!column.getCanHide()}
                      onChange={column.getToggleVisibilityHandler()}
                    />
                    <span>{headerText}</span>
                  </label>
                );
              })}
          </div>
          <div className="column-visibility-footer">
            <Button
              variant="outline"
              size="default"
              onClick={() => {
                table.toggleAllColumnsVisible(true);
              }}
            >
              Reset to all
            </Button>
            <Button
              variant="default"
              size="default"
              onClick={() => setColumnsModalOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
