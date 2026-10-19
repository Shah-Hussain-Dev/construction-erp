'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ChatMessage,
  ChatConversation,
  MaterialRequestData,
} from './types';
import {
  VideoCamera,
  Phone,
  MagnifyingGlass,
  DotsThreeVertical,
  Users,
  Paperclip,
  Image as ImageIcon,
  Camera,
  MapPin,
  FileText,
  Smiley,
  PaperPlaneTilt,
  Microphone,
  FilePdf,
  DownloadSimple,
  Info,
  Package,
  CaretLeft,
  X,
  ClipboardText,
} from '@phosphor-icons/react';

interface ChatFeedProps {
  conversation: ChatConversation;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendAttachment?: (type: 'location' | 'document' | 'image' | 'materialRequest') => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onOpenMaterialRequest: (request: MaterialRequestData) => void;
  onOpenPhotoLightbox: (photos: string[], index: number) => void;
  onToggleInfoSidebar?: () => void;
  onBackMobile?: () => void;
  activeSubTab: string;
  onChangeSubTab: (tab: string) => void;
}

export function ChatFeed({
  conversation,
  messages,
  onSendMessage,
  onSendAttachment,
  onToggleReaction,
  onOpenMaterialRequest,
  onOpenPhotoLightbox,
  onToggleInfoSidebar,
  onBackMobile,
  activeSubTab,
  onChangeSubTab,
}: ChatFeedProps) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const composerRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the composer visible above the mobile on-screen keyboard.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      const form = composerRef.current;
      if (!form) return;
      const hidden = window.innerHeight - (vv.height + vv.offsetTop);
      form.style.marginBottom = hidden > 0 ? `${hidden}px` : '';
    };
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    sync();
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
    };
  }, []);

  // Auto-scroll to the newest message, like WhatsApp.
  useEffect(() => {
    if (activeSubTab !== 'Chat') return;
    const el = scrollRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, activeSubTab, conversation.id]);

  const subTabs = ['Chat', 'Files', 'Tasks', 'Site Photos', 'Reports'];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setIsAttachMenuOpen(false);
  };

  const handleAttachmentClick = (type: 'location' | 'document' | 'image' | 'materialRequest') => {
    setIsAttachMenuOpen(false);
    if (onSendAttachment) {
      onSendAttachment(type);
    } else {
      if (type === 'location') {
        onSendMessage('📍 Shared live GPS coordinates from Site A (26.8467° N, 80.9462° E)');
      } else if (type === 'document') {
        onSendMessage('📄 Attached document: Site_Inspection_Checklist_Rev1.pdf');
      } else if (type === 'image') {
        onSendMessage('📷 Uploaded site inspection photo from Block A foundation.');
      } else if (type === 'materialRequest') {
        onSendMessage('📦 New Material Indent: 100 Bags OPC 53 Cement requested for Block B.');
      }
    }
  };

  return (
    <section className="flex-1 min-w-0 min-h-0 flex flex-col h-full bg-[#f8fafc] md:bg-[#fcfdfe] relative overflow-hidden">
      {/* 1. Header Bar (WhatsApp Native Style with Back Arrow on Mobile) */}
      <div className="h-14 sm:h-16 px-2.5 sm:px-4 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* Back button for mobile native navigation */}
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="p-1.5 -ml-1 text-slate-700 hover:text-blue-600 active:bg-slate-100 rounded-full md:hidden flex items-center justify-center transition"
              aria-label="Back to chats list"
            >
              <CaretLeft size={22} weight="bold" />
            </button>
          )}

          {/* Avatar and Group title — tapping opens Group Info on mobile */}
          <div
            onClick={onToggleInfoSidebar}
            className="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer group"
          >
            <div className="relative shrink-0">
              <img
                src={conversation.avatar}
                alt={conversation.title}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-slate-200/70"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/20" />
            </div>

            <div className="min-w-0">
              <h2 className="text-[14px] sm:text-[15px] font-bold text-slate-900 leading-tight truncate group-hover:text-blue-600 transition">
                {conversation.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {conversation.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0 text-slate-600">
          <button
            title="Start video call"
            className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded-full transition"
          >
            <VideoCamera size={19} />
          </button>
          <button
            title="Start audio call"
            className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded-full transition"
          >
            <Phone size={19} />
          </button>
          <button
            title="Search in conversation"
            className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded-full transition hidden sm:inline-flex"
          >
            <MagnifyingGlass size={19} />
          </button>
          <button
            title="More options"
            className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded-full transition hidden sm:inline-flex"
          >
            <DotsThreeVertical size={19} />
          </button>
          {onToggleInfoSidebar && (
            <button
              onClick={onToggleInfoSidebar}
              title="Group info"
              className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded-full transition lg:hidden"
            >
              <Info size={19} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-navigation tabs strip */}
      <div className="h-10 px-3 sm:px-4 border-b border-slate-200/70 bg-white flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold overflow-x-auto scrollbar-none py-1">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onChangeSubTab(tab)}
                className={`py-1 relative transition whitespace-nowrap ${
                  isActive
                    ? 'text-[#1877F2]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab}</span>
                {isActive && (
                  <span className="absolute -bottom-2 left-0 right-0 h-[2.5px] bg-[#1877F2] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Member count pill */}
        <div className="flex items-center gap-1 text-slate-500 text-xs font-medium pl-2 shrink-0">
          <Users size={14} />
          <span>{conversation.stats?.members || 12}</span>
        </div>
      </div>

      {/* 3. Messages Stream or Active Sub-Tab View */}
      {activeSubTab === 'Chat' ? (
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5 space-y-4 sm:space-y-5"
        >
          {/* Date pill */}
          <div className="flex justify-center my-0.5">
            <span className="px-3 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-full border border-slate-200/60 shadow-2xs">
              Today
            </span>
          </div>

          {messages.map((msg) => {
            return (
              <div key={msg.id} className="flex items-start gap-2.5 sm:gap-3 group">
                {/* Sender Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  <img
                    src={msg.sender.avatar}
                    alt={msg.sender.name}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200"
                  />
                  {msg.sender.online && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/20" />
                  )}
                </div>

                {/* Message Body Container */}
                <div className="flex-1 min-w-0 max-w-2xl space-y-2">
                  {/* Sender Name & Time */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-[#1877F2]">
                      {msg.sender.name}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Text content */}
                  {msg.text && (
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                      {msg.text}
                    </p>
                  )}

                  {/* Image Gallery Grid (Message 1 style) */}
                  {msg.images && msg.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-1 max-w-xl">
                      {msg.images.slice(0, 4).map((imgUrl, idx) => {
                        const isFourth = idx === 3;
                        return (
                          <div
                            key={idx}
                            onClick={() => onOpenPhotoLightbox(msg.images!, idx)}
                            className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 cursor-pointer group/img border border-slate-200/80 shadow-2xs hover:shadow-xs transition"
                          >
                            <img
                              src={imgUrl}
                              alt="Site progress"
                              className="w-full h-full object-cover group-hover/img:scale-105 transition duration-200"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80';
                              }}
                            />
                            {isFourth && (
                              <div className="absolute inset-0 bg-black/55 backdrop-blur-2xs flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg group-hover/img:bg-black/65 transition">
                                +3
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Location card */}
                  {msg.location && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs max-w-md flex items-center justify-between gap-3 hover:border-blue-300 transition">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs">
                          <MapPin size={15} weight="fill" />
                          <span>{msg.location.name}</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium truncate">
                          {msg.location.address}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {msg.location.coordinates}
                        </p>
                      </div>

                      {/* Map thumbnail representation */}
                      <div className="w-20 sm:w-24 h-14 sm:h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative flex items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:8px_8px]">
                        <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 60">
                          <line x1="0" y1="20" x2="100" y2="40" stroke="#94a3b8" strokeWidth="3" />
                          <line x1="30" y1="0" x2="70" y2="60" stroke="#cbd5e1" strokeWidth="2.5" />
                          <line x1="60" y1="0" x2="20" y2="60" stroke="#e2e8f0" strokeWidth="2" />
                        </svg>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md animate-bounce">
                          <MapPin size={11} weight="fill" />
                        </div>
                        <span className="absolute bottom-1 right-1 text-[8px] bg-white/90 px-1 rounded font-mono text-slate-600">
                          09:16 AM
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Material Request Card (Message 3 style) */}
                  {msg.materialRequest && (
                    <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-[#FFFDF5] to-[#FFFBEB] p-3.5 sm:p-4 shadow-2xs max-w-lg">
                      <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/60">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-700 flex items-center justify-center">
                            <Package size={15} weight="bold" />
                          </div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            Material Request
                          </h4>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/80">
                          {msg.materialRequest.status}
                        </span>
                      </div>

                      <div className="py-2.5 grid grid-cols-2 gap-y-1.5 text-xs">
                        <div className="text-slate-500">Request No</div>
                        <div className="font-semibold text-slate-900 text-right sm:text-left">
                          {msg.materialRequest.requestNo}
                        </div>

                        <div className="text-slate-500">Material</div>
                        <div className="font-semibold text-slate-900 text-right sm:text-left">
                          {msg.materialRequest.material}
                        </div>

                        <div className="text-slate-500">Quantity</div>
                        <div className="font-semibold text-slate-900 text-right sm:text-left">
                          {msg.materialRequest.quantity}
                        </div>

                        <div className="text-slate-500">Required Date</div>
                        <div className="font-semibold text-slate-900 text-right sm:text-left">
                          {msg.materialRequest.requiredDate}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-amber-200/60">
                        <button
                          onClick={() => onOpenMaterialRequest(msg.materialRequest!)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 shadow-2xs transition"
                        >
                          View Request
                        </button>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Attachment Card (Message 5 style) */}
                  {msg.attachment && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs max-w-md flex items-center justify-between gap-3 hover:bg-slate-50/80 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-[10px]">
                          <FilePdf size={20} weight="fill" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {msg.attachment.name}
                          </p>
                          <span className="text-[10px] sm:text-[11px] text-slate-400">
                            {msg.attachment.size}
                          </span>
                        </div>
                      </div>

                      <button
                        title="Download attachment"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <DownloadSimple size={18} />
                      </button>
                    </div>
                  )}

                  {/* Reactions row */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {msg.reactions?.map((react, i) => (
                      <button
                        key={i}
                        onClick={() => onToggleReaction(msg.id, react.emoji)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition duration-150 ${
                          react.reactedByMe
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-transparent'
                        }`}
                      >
                        <span>{react.emoji}</span>
                        <span>{react.count}</span>
                      </button>
                    ))}

                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowEmojiPicker(
                            showEmojiPicker === msg.id ? null : msg.id
                          )
                        }
                        className="w-6 h-6 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs transition opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Add reaction"
                      >
                        <Smiley size={14} />
                      </button>

                      {showEmojiPicker === msg.id && (
                        <div className="absolute left-0 bottom-full mb-1 flex items-center gap-1 bg-white p-1 rounded-full shadow-lg border border-slate-200 z-20">
                          {['👍', '❤️', '👏', '🔥', '✅'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                onToggleReaction(msg.id, emoji);
                                setShowEmojiPicker(null);
                              }}
                              className="w-7 h-7 hover:scale-125 transition flex items-center justify-center text-sm"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : activeSubTab === 'Files' ? (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Shared Documents & Drawings (48 Files)
            </h3>
            <span className="text-xs text-slate-500">Site A - Green Valley</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {conversation.recentFiles?.map((file) => (
              <div
                key={file.id}
                className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between hover:shadow-2xs transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <FilePdf size={20} weight="fill" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">
                      {file.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {file.size} • Uploaded by {file.author}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition shrink-0">
                  <DownloadSimple size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : activeSubTab === 'Tasks' ? (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Site Tasks & Coordination (16 Tasks)
            </h3>
            <button className="text-xs font-semibold text-blue-600 hover:underline">
              + Add New Task
            </button>
          </div>

          <div className="space-y-2">
            {conversation.sharedTasks?.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    readOnly
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-800 truncate">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      Assignee: {task.assignee} • Due: {task.dueDate}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
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
      ) : activeSubTab === 'Site Photos' ? (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Daily Progress Photos Gallery
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            {[
              'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80',
            ].map((img, i) => (
              <div
                key={i}
                onClick={() =>
                  onOpenPhotoLightbox(
                    [
                      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80',
                    ],
                    i % 4
                  )
                }
                className="aspect-4/3 rounded-xl overflow-hidden cursor-pointer shadow-2xs hover:shadow-md transition relative group"
              >
                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-2 flex items-end">
                  <span className="text-[11px] text-white font-medium">Foundation Pour Block A</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Site Diary & Inspection Reports</h3>
          <div className="space-y-2.5 sm:space-y-3">
            {[
              { title: 'Daily Progress Report (DPR) - 17 Oct', status: 'Submitted', author: 'Ravi Kumar' },
              { title: 'Concrete Cube 7-Day Compressive Strength Test', status: 'Passed', author: 'QA Lab' },
              { title: 'Safety Audit Checklist - Scaffolding Inspection', status: 'Approved', author: 'Manoj Gupta' },
            ].map((rep, idx) => (
              <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{rep.title}</h4>
                  <p className="text-[11px] text-slate-400">By {rep.author} • Updated today</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {rep.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. WhatsApp-Style Animated Attachment Drawer / Sheet */}
      {isAttachMenuOpen && (
        <div className="absolute bottom-16 sm:bottom-18 left-3 right-3 sm:left-6 sm:right-auto sm:w-88 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200/90 z-30 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">Share or Attach</span>
            <button
              type="button"
              onClick={() => setIsAttachMenuOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {/* Document */}
            <button
              type="button"
              onClick={() => handleAttachmentClick('document')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition">
                <FileText size={22} weight="fill" />
              </div>
              <span className="text-[11px] font-medium text-slate-700">Document</span>
            </button>

            {/* Camera */}
            <button
              type="button"
              onClick={() => handleAttachmentClick('image')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition">
                <Camera size={22} weight="fill" />
              </div>
              <span className="text-[11px] font-medium text-slate-700">Camera</span>
            </button>

            {/* Gallery */}
            <button
              type="button"
              onClick={() => handleAttachmentClick('image')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 to-purple-500 text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition">
                <ImageIcon size={22} weight="fill" />
              </div>
              <span className="text-[11px] font-medium text-slate-700">Gallery</span>
            </button>

            {/* Location */}
            <button
              type="button"
              onClick={() => handleAttachmentClick('location')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition">
                <MapPin size={22} weight="fill" />
              </div>
              <span className="text-[11px] font-medium text-slate-700">Location</span>
            </button>

            {/* Material Request */}
            <button
              type="button"
              onClick={() => handleAttachmentClick('materialRequest')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition">
                <Package size={22} weight="fill" />
              </div>
              <span className="text-[11px] font-medium text-slate-700">Material</span>
            </button>

            {/* Site Task */}
            <button
              type="button"
              onClick={() => {
                setIsAttachMenuOpen(false);
                onChangeSubTab('Tasks');
              }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition">
                <ClipboardText size={22} weight="fill" />
              </div>
              <span className="text-[11px] font-medium text-slate-700">Site Task</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Bottom Message Composer (WhatsApp Native Mobile Style) */}
      <form
        ref={composerRef}
        onSubmit={handleSend}
        className="chat-composer-bar p-2 sm:px-4 sm:py-2.5 bg-[#f0f2f5] md:bg-white border-t border-slate-200/90 shrink-0 flex items-center gap-1.5 sm:gap-2 z-20"
      >
        {/* WhatsApp signature rounded input capsule */}
        <div className="chat-composer-capsule flex-1">
          {/* Emoji button */}
          <button
            type="button"
            title="Insert emoji"
            onClick={() => setShowEmojiPicker(showEmojiPicker ? null : 'composer')}
            className="p-1.5 text-slate-400 hover:text-slate-700 active:scale-95 transition-all rounded-full shrink-0 flex items-center justify-center"
          >
            <Smiley size={22} weight="regular" />
          </button>

          {/* Seamless Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="chat-composer-input"
          />

          {/* Attachment Paperclip Button (Opens WhatsApp-style action sheet) */}
          <button
            type="button"
            onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
            title="Attach file or media"
            className={`p-1.5 rounded-full transition-all shrink-0 active:scale-95 flex items-center justify-center ${
              isAttachMenuOpen
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Paperclip size={21} className="transform -rotate-45" weight="bold" />
          </button>

          {/* Quick Camera button */}
          <button
            type="button"
            onClick={() => handleAttachmentClick('image')}
            title="Take photo"
            className="p-1.5 text-slate-400 hover:text-slate-700 active:scale-95 transition-all rounded-full shrink-0 flex items-center justify-center"
          >
            <Camera size={21} weight="regular" />
          </button>
        </div>

        {/* WhatsApp Signature Floating Action Circle Button */}
        <button
          type={inputText.trim() ? 'submit' : 'button'}
          onClick={() => {
            if (!inputText.trim()) {
              onSendMessage('🎙️ Voice message (0:14) shared by Site Supervisor.');
            } else {
              handleSend();
            }
          }}
          title={inputText.trim() ? 'Send message' : 'Voice note'}
          className="w-11 h-11 rounded-full bg-[#1877F2] hover:bg-[#166fe5] active:scale-92 text-white flex items-center justify-center shadow-[0_2px_8px_rgba(24,119,242,0.35)] shrink-0 transition-all duration-150"
        >
          {inputText.trim() ? (
            <PaperPlaneTilt size={19} weight="fill" className="translate-x-0.5" />
          ) : (
            <Microphone size={21} weight="fill" />
          )}
        </button>
      </form>
    </section>
  );
}
