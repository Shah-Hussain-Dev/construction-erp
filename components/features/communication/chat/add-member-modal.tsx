'use client';

import React, { useState } from 'react';
import { X, MagnifyingGlass, UserPlus, Check } from '@phosphor-icons/react';
import { ChatMember } from './types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMembers: (members: ChatMember[]) => void;
  existingMemberIds: string[];
}

const CANDIDATES = [
  {
    id: 'kavita-reddy',
    name: 'Kavita Reddy',
    role: 'Architect & MEP Lead',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    online: true,
  },
  {
    id: 'vikram-malhotra',
    name: 'Vikram Malhotra',
    role: 'Structural Consultant',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    online: true,
  },
  {
    id: 'rahul-mehta',
    name: 'Rahul Mehta',
    role: 'Electrical Site Engineer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    online: false,
  },
  {
    id: 'deepak-sharma',
    name: 'Deepak Sharma',
    role: 'Surveyor & GPS Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    online: true,
  },
];

export function AddMemberModal({
  isOpen,
  onClose,
  onAddMembers,
  existingMemberIds,
}: AddMemberModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    const toAdd = CANDIDATES.filter((c) => selectedIds.includes(c.id)).map((c) => ({
      ...c,
      isAdmin: false,
    }));
    onAddMembers(toAdd);
    setSelectedIds([]);
    onClose();
  };

  const filtered = CANDIDATES.filter(
    (c) =>
      !existingMemberIds.includes(c.id) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus size={18} weight="bold" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Add Members to Site A</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search site staff, engineers, vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
            {filtered.map((candidate) => {
              const selected = selectedIds.includes(candidate.id);
              return (
                <div
                  key={candidate.id}
                  onClick={() => toggleSelect(candidate.id)}
                  className={`w-full p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selected
                      ? 'border-blue-500 bg-blue-50/70'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">{candidate.name}</h4>
                      <p className="text-[11px] text-slate-500">{candidate.role}</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      selected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {selected && <Check size={12} weight="bold" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedIds.length} member{selectedIds.length === 1 ? '' : 's'} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={selectedIds.length === 0}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition"
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
