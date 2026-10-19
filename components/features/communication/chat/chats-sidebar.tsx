'use client';

import React from 'react';
import { ChatConversation } from './types';
import {
  MagnifyingGlass,
  Plus,
  PushPinSimple,
  UsersThree,
  Megaphone,
} from '@phosphor-icons/react';

interface ChatsSidebarProps {
  conversations: ChatConversation[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  activeFilter: string;
  onChangeFilter: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewChat: () => void;
}

export function ChatsSidebar({
  conversations,
  activeChatId,
  onSelectChat,
  activeFilter,
  onChangeFilter,
  searchQuery,
  onSearchChange,
  onOpenNewChat,
}: ChatsSidebarProps) {
  const filterTabs = [
    { id: 'All', label: 'All' },
    { id: 'Unread', label: 'Unread', badge: 3 },
    { id: 'Groups', label: 'Groups' },
    { id: 'Projects', label: 'Projects' },
    { id: 'Sites', label: 'Sites' },
  ];

  return (
    <aside className="w-full md:w-[320px] lg:w-[340px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col h-full min-h-0 overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-4 pb-2 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Chats</h1>
        <button
          onClick={onOpenNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-xs transition duration-150"
        >
          <Plus size={14} weight="bold" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none py-1 shrink-0">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeFilter(tab.id)}
              className={`relative py-2 px-2 text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'text-[#1877F2]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-4 h-4 rounded-full bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#1877F2] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="p-3 shrink-0">
        <div className="relative flex items-center">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100/90 hover:bg-slate-100 text-slate-800 placeholder-slate-400 text-xs rounded-xl border border-transparent focus:border-slate-300 focus:bg-white outline-none transition duration-150"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-2 space-y-1 pb-4">
        {conversations.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No chats found
          </div>
        ) : (
          conversations.map((item) => {
            const isSelected = activeChatId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectChat(item.id)}
                className={`w-full p-2.5 rounded-xl cursor-pointer text-left transition duration-150 flex items-start gap-3 relative ${
                  isSelected
                    ? 'bg-[#EBF3FF] text-slate-900 shadow-xs'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  {item.avatar === 'team-icon' ? (
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
                      <UsersThree size={22} weight="bold" />
                    </div>
                  ) : item.avatar === 'announcement-icon' ? (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 to-rose-400 text-white flex items-center justify-center shadow-xs">
                      <Megaphone size={20} weight="fill" />
                    </div>
                  ) : (
                    <img
                      src={item.avatar}
                      alt={item.title}
                      className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200/60"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-[13px] font-bold text-slate-900 truncate">
                      {item.title}
                    </h3>
                    <span
                      className={`text-[10px] shrink-0 font-medium ${
                        isSelected ? 'text-[#1877F2]' : 'text-slate-400'
                      }`}
                    >
                      {item.lastTime}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {item.subtitle}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-[11px] text-slate-600 truncate flex-1">
                      {item.lastMessage}
                    </p>

                    {item.isPinned && (
                      <PushPinSimple
                        size={13}
                        weight="fill"
                        className="text-slate-800 shrink-0 transform rotate-45"
                      />
                    )}

                    {typeof item.unreadCount === 'number' && item.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {item.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
