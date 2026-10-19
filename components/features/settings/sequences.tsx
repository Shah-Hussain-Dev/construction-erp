'use client';

import React from 'react';
import {
  Hash,
  ArrowsClockwise,
  FloppyDisk,
  Sparkle,
} from '@phosphor-icons/react';
import type { SequenceConfig } from './types';
import { Button } from '../../ui/button';

interface SequencesProps {
  sequences: SequenceConfig[];
  onChange: (sequences: SequenceConfig[]) => void;
  onSave: () => void;
  onReset: () => void;
}

export function SequencesSection({ sequences, onChange, onSave, onReset }: SequencesProps) {
  const updateSequence = (id: string, patch: Partial<SequenceConfig>) => {
    onChange(
      sequences.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...patch };
        const numStr = String(updated.nextNumber).padStart(updated.padding, '0');
        updated.sample = `${updated.prefix}${numStr}${updated.suffix}`;
        return updated;
      }),
    );
  };

  return (
    <div className="settings-section-stack">
      {/* Top Action Toolbar */}
      <div className="settings-section-head">
        <div>
          <h2 className="settings-section-title">Numbering Sequences & Series Prefixes</h2>
          <p className="settings-section-subtitle">
            Define standardized numbering schemes and annual prefixes for all enterprise construction documents.
          </p>
        </div>
        <div className="settings-head-actions">
          <Button variant="outline" size="default" onClick={onReset}>
            <ArrowsClockwise size={16} />
            <span>Reset Defaults</span>
          </Button>
          <Button variant="default" size="default" onClick={onSave}>
            <FloppyDisk size={16} weight="bold" />
            <span>Save Sequences</span>
          </Button>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-head">
          <div className="settings-card-icon-wrap">
            <Hash size={20} weight="duotone" />
          </div>
          <div>
            <h3 className="settings-card-title">Document Number Series</h3>
            <p className="settings-card-desc">Prefix, padding, and counter sequences</p>
          </div>
        </div>

        <div className="settings-form-body">
          <div className="sequences-table-wrapper">
            <table className="sequences-table">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>Prefix</th>
                  <th className="text-center">Digits (Padding)</th>
                  <th className="text-center">Next Value</th>
                  <th>Suffix</th>
                  <th className="text-right">Preview Sample</th>
                </tr>
              </thead>
              <tbody>
                {sequences.map((seq) => (
                  <tr key={seq.id}>
                    <td>
                      <strong className="text-slate-900 font-semibold">{seq.documentName}</strong>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={seq.prefix}
                        onChange={(e) => updateSequence(seq.id, { prefix: e.target.value })}
                        className="settings-input font-mono w-28"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        min={2}
                        max={8}
                        value={seq.padding}
                        onChange={(e) =>
                          updateSequence(seq.id, { padding: Number(e.target.value) })
                        }
                        className="settings-input font-mono w-16 text-center"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        min={1}
                        value={seq.nextNumber}
                        onChange={(e) =>
                          updateSequence(seq.id, { nextNumber: Number(e.target.value) })
                        }
                        className="settings-input font-mono w-24 text-center"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={seq.suffix}
                        onChange={(e) => updateSequence(seq.id, { suffix: e.target.value })}
                        className="settings-input font-mono w-20"
                        placeholder="—"
                      />
                    </td>
                    <td className="text-right">
                      <span className="sequence-sample-badge font-mono font-bold">
                        {seq.sample}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
