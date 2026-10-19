'use client';

import React, { useState } from 'react';
import { X, MagnifyingGlass, UserPlus, UsersThree, Buildings, ChatCircle } from '@phosphor-icons/react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (title: string, type: 'site' | 'project' | 'group' | 'direct', subtitle: string) => void;
}

const AVAILABLE_CONTACTS = [
  { name: 'Kavita Reddy', role: 'Architect & MEP Lead', org: 'Green Valley Project', type: 'direct' as const },
  { name: 'Vikram Malhotra', role: 'Structural Consultant', org: 'Civil Design Dept', type: 'direct' as const },
  { name: 'Site B - Foundation Team', role: 'Site Group • 14 members', org: 'City Mall Project', type: 'site' as const },
  { name: 'Quality & Testing Lab', role: 'Cube Test & Slump Logs • 6 members', org: 'All Sites', type: 'group' as const },
  { name: 'Tata Steel Rep (Rajesh)', role: 'TMT Rebar Supplier', org: 'Vendor Coordination', type: 'direct' as const },
  { name: 'Electrical Contractors', role: 'Wiring & Conduit Team • 8 members', org: 'Green Valley Project', type: 'group' as const },
];

export function NewChatModal({ isOpen, onClose, onCreateChat }: NewChatModalProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'contacts' | 'new-group'>('contacts');
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<'site' | 'project' | 'group'>('site');
  const [groupDesc, setGroupDesc] = useState('');

  if (!isOpen) return null;

  const filteredContacts = AVAILABLE_CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      c.org.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    const typeLabel = groupType === 'site' ? 'Site Group' : groupType === 'project' ? 'Project Group' : 'Team Group';
    onCreateChat(groupName.trim(), groupType, `${typeLabel} • 1 member`);
    setGroupName('');
    setGroupDesc('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ChatCircle size={18} weight="bold" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">New Conversation</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'contacts'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Direct Message
          </button>
          <button
            onClick={() => setActiveTab('new-group')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'new-group'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create New Group / Channel
          </button>
        </div>

        {activeTab === 'contacts' ? (
          <div className="p-4 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search engineers, contractors, vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition"
              />
            </div>

            {/* Contacts List */}
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {filteredContacts.map((contact, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onCreateChat(contact.name, contact.type, `${contact.role} • ${contact.org}`);
                    onClose();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/60 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center">
                      {contact.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition">
                        {contact.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{contact.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700">
                    Chat
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateGroup} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Channel / Group Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tower B - Slab Concreting"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Channel Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'site', label: 'Site Group', icon: Buildings },
                  { id: 'project', label: 'Project Room', icon: UsersThree },
                  { id: 'group', label: 'Team Group', icon: UserPlus },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setGroupType(id as any)}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      groupType === id
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-[11px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description / Purpose
              </label>
              <textarea
                rows={2}
                placeholder="Purpose of this channel and members..."
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
            >
              Create Channel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
