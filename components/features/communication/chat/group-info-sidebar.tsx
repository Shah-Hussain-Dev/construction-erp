'use client';

import React from 'react';
import { ChatConversation, ChatMember, ChatTask } from './types';
import {
  FilePdf,
  DownloadSimple,
  Plus,
  Check,
  X,
  CaretLeft,
} from '@phosphor-icons/react';

interface GroupInfoSidebarProps {
  conversation: ChatConversation;
  onOpenAddMember: () => void;
  onToggleTask: (taskId: string) => void;
  onCloseMobile?: () => void;
}

export function GroupInfoSidebar({
  conversation,
  onOpenAddMember,
  onToggleTask,
  onCloseMobile,
}: GroupInfoSidebarProps) {
  const stats = conversation.stats || {
    members: 12,
    files: 48,
    tasks: 16,
    links: 5,
  };

  const members: ChatMember[] = conversation.members || [
    {
      id: 'ravi-kumar',
      name: 'Ravi Kumar',
      role: 'Site Supervisor',
      avatar: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop&q=80',
      online: true,
      isAdmin: true,
    },
    {
      id: 'amit-verma',
      name: 'Amit Verma',
      role: 'Project Manager',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      online: true,
    },
    {
      id: 'neha-singh',
      name: 'Neha Singh',
      role: 'Planning Engineer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      online: true,
    },
    {
      id: 'suresh-kumar',
      name: 'Suresh Kumar',
      role: 'Store Keeper',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      online: true,
    },
    {
      id: 'abc-constructions',
      name: 'ABC Constructions',
      role: 'Contractor',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      online: true,
    },
  ];

  const tasks: ChatTask[] = conversation.sharedTasks || [
    {
      id: 'task-1',
      title: 'Site cleanliness and safety check',
      assignee: 'Ravi Kumar',
      dueDate: 'Today',
      status: 'In Progress',
      completed: false,
    },
    {
      id: 'task-2',
      title: 'Material receipt verification',
      assignee: 'Suresh Kumar',
      dueDate: '18 Oct',
      status: 'Pending',
      completed: false,
    },
    {
      id: 'task-3',
      title: 'Photography of slab work',
      assignee: 'Neha Singh',
      dueDate: '18 Oct',
      status: 'Pending',
      completed: false,
    },
  ];

  const files = conversation.recentFiles || [
    {
      id: 'file-1',
      name: 'Site_Safety_Guidelines.pdf',
      size: '2.4 MB',
      type: 'pdf' as const,
      url: '#',
      timestamp: 'Today',
      author: 'Suresh Kumar',
    },
    {
      id: 'file-2',
      name: 'Structural_Drawing_BlockA.pdf',
      size: '5.8 MB',
      type: 'pdf' as const,
      url: '#',
      timestamp: 'Yesterday',
      author: 'Design Team',
    },
    {
      id: 'file-3',
      name: 'Material_Receipt_123.jpg',
      size: '1.2 MB',
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&auto=format&fit=crop&q=80',
      timestamp: 'Yesterday',
      author: 'Ravi Kumar',
    },
  ];

  return (
    <aside className="w-full lg:w-[320px] xl:w-[340px] shrink-0 bg-white border-l border-slate-200/80 flex flex-col h-full min-h-0 overflow-hidden select-none">
      {/* 1. Header */}
      <div className="h-14 sm:h-16 px-4 sm:px-5 border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 -ml-1 text-slate-700 hover:text-blue-600 rounded-full"
              aria-label="Back to chat"
            >
              <CaretLeft size={22} weight="bold" />
            </button>
          )}
          <h2 className="text-[15px] font-bold text-slate-900">Group Info</h2>
        </div>
        <button className="text-xs font-semibold text-[#1877F2] hover:underline">
          Edit
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-6">
        {/* 2. Group Identity / Profile Card */}
        <div className="space-y-3">
          <img
            src={conversation.avatar}
            alt={conversation.title}
            className="w-20 h-20 rounded-2xl object-cover border border-slate-200/80 shadow-2xs"
          />

          <div>
            <h3 className="text-base font-bold text-slate-900">
              {conversation.title}
            </h3>
            <p className="text-xs text-slate-500">
              {conversation.project || 'Green Valley Project'}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-600 font-semibold">Active</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {conversation.description ||
              'Discussion related to Site A - civil work, material requests, updates, drawings and daily progress.'}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#EBF3FF] text-[#1877F2]">
              Project: Green Valley
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
              Site: Site A
            </span>
          </div>
        </div>

        {/* 3. Stats Row */}
        <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-100 text-center">
          <div>
            <div className="text-base font-bold text-slate-900">{stats.members}</div>
            <div className="text-[11px] text-slate-400 font-medium">Members</div>
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">{stats.files}</div>
            <div className="text-[11px] text-slate-400 font-medium">Files</div>
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">{stats.tasks}</div>
            <div className="text-[11px] text-slate-400 font-medium">Tasks</div>
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">{stats.links}</div>
            <div className="text-[11px] text-slate-400 font-medium">Links</div>
          </div>
        </div>

        {/* 4. Members Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">
              Members ({stats.members})
            </h4>
            <button className="text-xs font-semibold text-[#1877F2] hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {members.slice(0, 5).map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    {member.online && (
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-semibold text-slate-800 truncate">
                      {member.name}
                    </h5>
                    <p className="text-[11px] text-slate-400 truncate">
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {member.isAdmin && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Admin
                    </span>
                  )}
                  {member.online && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Members Button */}
          <button
            onClick={onOpenAddMember}
            className="w-full mt-2 py-2 px-3 border border-blue-200 hover:border-blue-300 hover:bg-blue-50/50 text-[#1877F2] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Plus size={14} weight="bold" />
            <span>Add Members</span>
          </button>
        </div>

        {/* 5. Shared Tasks Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">
              Shared Tasks ({tasks.length})
            </h4>
            <button className="text-xs font-semibold text-[#1877F2] hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className="flex items-start justify-between gap-2 p-1.5 -mx-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition ${
                      task.completed
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {task.completed && <Check size={11} weight="bold" />}
                  </div>
                  <div className="min-w-0">
                    <h5
                      className={`text-xs font-medium leading-tight truncate ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {task.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {task.assignee} • {task.dueDate}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    task.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Recent Files Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">Recent Files</h4>
            <button className="text-xs font-semibold text-[#1877F2] hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-1.5 -mx-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-md bg-red-500 text-white flex items-center justify-center shrink-0">
                      <FilePdf size={18} weight="fill" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h5 className="text-xs font-medium text-slate-800 truncate">
                      {file.name}
                    </h5>
                    <p className="text-[11px] text-slate-400">{file.size}</p>
                  </div>
                </div>

                <button
                  title="Download file"
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                >
                  <DownloadSimple size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
