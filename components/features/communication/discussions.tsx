'use client';

import React, { useState } from 'react';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES_SITE_A,
} from './chat/chat-data';
import {
  ChatConversation,
  ChatMessage,
  MaterialRequestData,
  ChatMember,
} from './chat/types';
import { ChatsSidebar } from './chat/chats-sidebar';
import { ChatFeed } from './chat/chat-feed';
import { GroupInfoSidebar } from './chat/group-info-sidebar';
import { MaterialRequestModal } from './chat/material-request-modal';
import { PhotoLightboxModal } from './chat/photo-lightbox-modal';
import { NewChatModal } from './chat/new-chat-modal';
import { AddMemberModal } from './chat/add-member-modal';

export function DiscussionsPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string>('site-a-civil-work');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<string>('Chat');

  // Messages state mapped by chat ID
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    'site-a-civil-work': INITIAL_MESSAGES_SITE_A,
  });

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequestData | null>(null);
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    photos: string[];
    index: number;
  }>({
    isOpen: false,
    photos: [],
    index: 0,
  });
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Responsive mobile view state
  const [mobilePanel, setMobilePanel] = useState<'sidebar' | 'feed' | 'info'>('feed');

  // Active conversation object
  const activeChat =
    conversations.find((c) => c.id === activeChatId) || conversations[1] || conversations[0];

  const currentMessages = chatMessages[activeChatId] || [];

  // Filter conversations based on tab & search query
  const filteredConversations = conversations.filter((item) => {
    // Filter tab
    if (activeFilter === 'Unread' && (!item.unreadCount || item.unreadCount === 0)) {
      return false;
    }
    if (activeFilter === 'Groups' && item.type !== 'group' && item.type !== 'site') {
      return false;
    }
    if (activeFilter === 'Projects' && item.type !== 'project') {
      return false;
    }
    if (activeFilter === 'Sites' && item.type !== 'site') {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.lastMessage.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Actions
  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setActiveSubTab('Chat');
    setMobilePanel('feed');

    // Clear unread count when opened
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatId: activeChatId,
      sender: {
        id: 'current-user',
        name: 'Shah Hussain',
        role: 'Admin',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        online: true,
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      reactions: [],
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage],
    }));

    // Update last message in sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              lastMessage: `You: ${text}`,
              lastTime: 'Just now',
            }
          : c
      )
    );
  };

  const handleToggleReaction = (messageId: string, emoji: string) => {
    setChatMessages((prev) => {
      const list = prev[activeChatId] || [];
      const updated = list.map((msg) => {
        if (msg.id !== messageId) return msg;

        const reactions = [...(msg.reactions || [])];
        const existing = reactions.find((r) => r.emoji === emoji);

        if (existing) {
          if (existing.reactedByMe) {
            existing.count -= 1;
            existing.reactedByMe = false;
          } else {
            existing.count += 1;
            existing.reactedByMe = true;
          }
        } else {
          reactions.push({ emoji, count: 1, reactedByMe: true });
        }

        return {
          ...msg,
          reactions: reactions.filter((r) => r.count > 0),
        };
      });

      return {
        ...prev,
        [activeChatId]: updated,
      };
    });
  };

  const handleToggleTask = (taskId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeChatId) return c;
        const tasks = c.sharedTasks?.map((t) =>
          t.id === taskId
            ? {
                ...t,
                completed: !t.completed,
                status: !t.completed ? ('Completed' as const) : ('Pending' as const),
              }
            : t
        );
        return { ...c, sharedTasks: tasks };
      })
    );
  };

  const handleAddMembers = (newMembers: ChatMember[]) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeChatId) return c;
        const currentMembers = c.members || [];
        const updated = [...currentMembers, ...newMembers];
        return {
          ...c,
          members: updated,
          stats: {
            ...(c.stats || { members: 12, files: 48, tasks: 16, links: 5 }),
            members: updated.length,
          },
        };
      })
    );
  };

  const handleCreateChat = (
    title: string,
    type: 'site' | 'project' | 'group' | 'direct',
    subtitle: string
  ) => {
    const newId = `chat-${Date.now()}`;
    const newChat: ChatConversation = {
      id: newId,
      title,
      subtitle,
      type,
      avatar:
        type === 'project'
          ? 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=200&auto=format&fit=crop&q=80'
          : type === 'site'
            ? 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      lastMessage: 'Conversation started',
      lastTime: 'Just now',
      description: `Channel created for ${title}`,
      status: 'Active',
      stats: { members: 1, files: 0, tasks: 0, links: 0 },
      members: [
        {
          id: 'current-user',
          name: 'Shah Hussain',
          role: 'Admin',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          online: true,
          isAdmin: true,
        },
      ],
    };

    setConversations([newChat, ...conversations]);
    setActiveChatId(newId);
    setChatMessages((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `msg-welcome-${Date.now()}`,
          chatId: newId,
          sender: {
            id: 'system',
            name: 'System',
            role: 'Notification',
            avatar:
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          },
          timestamp: 'Just now',
          text: `Welcome to ${title}. All messages and material requests shared here are synced across project coordinators.`,
        },
      ],
    }));
  };

  const handleUpdateMaterialRequestStatus = (newStatus: 'Approved' | 'Rejected') => {
    if (!selectedRequest) return;
    setChatMessages((prev) => {
      const list = prev[activeChatId] || [];
      const updated = list.map((msg) => {
        if (msg.materialRequest?.requestNo === selectedRequest.requestNo) {
          return {
            ...msg,
            materialRequest: {
              ...msg.materialRequest,
              status: newStatus,
            },
          };
        }
        return msg;
      });
      return {
        ...prev,
        [activeChatId]: updated,
      };
    });
  };

  const handleSendAttachment = (type: 'location' | 'document' | 'image' | 'materialRequest') => {
    let newMsg: ChatMessage;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sender = {
      id: 'current-user',
      name: 'Shah Hussain',
      role: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      online: true,
    };

    if (type === 'location') {
      newMsg = {
        id: `msg-${Date.now()}`,
        chatId: activeChatId,
        sender,
        timestamp: now,
        text: 'Live GPS verification from site entrance.',
        location: {
          name: 'Location',
          address: 'Site A - Green Valley, Gate 2, Lucknow, UP',
          coordinates: '26.8467° N, 80.9462° E',
        },
        reactions: [],
      };
    } else if (type === 'document') {
      newMsg = {
        id: `msg-${Date.now()}`,
        chatId: activeChatId,
        sender,
        timestamp: now,
        text: 'Here is the approved checklist for today.',
        attachment: {
          name: 'Site_Safety_Audit_Checklist.pdf',
          size: '1.8 MB',
          type: 'pdf',
          url: '#',
        },
        reactions: [],
      };
    } else if (type === 'image') {
      newMsg = {
        id: `msg-${Date.now()}`,
        chatId: activeChatId,
        sender,
        timestamp: now,
        text: 'Site foundation and curing photos taken right now.',
        images: [
          'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80',
        ],
        reactions: [],
      };
    } else {
      newMsg = {
        id: `msg-${Date.now()}`,
        chatId: activeChatId,
        sender,
        timestamp: now,
        materialRequest: {
          requestNo: 'MR-002',
          material: 'TMT Steel 16mm (Fe 550D)',
          quantity: '10 MT',
          requiredDate: '20 Oct 2026',
          status: 'Pending Approval',
          requestedBy: 'Shah Hussain (Admin)',
          site: 'Site A - Civil Work',
          notes: 'Required for Block B column cage reinforcement.',
          estimatedCost: '₹5,40,000',
        },
        reactions: [],
      };
    }

    setChatMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              lastMessage: `You: ${newMsg.text || 'Shared attachment'}`,
              lastTime: 'Just now',
            }
          : c
      )
    );
  };

  return (
    <div className="w-full h-full flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* 3-Column Chat Application Container */}
      <div className="w-full h-full flex flex-1 min-h-0 overflow-hidden bg-white md:rounded-2xl md:border md:border-slate-200/90 md:shadow-sm">
        {/* Left Column: Chats List */}
        <div
          className={`${
            mobilePanel === 'sidebar' ? 'flex' : 'hidden'
          } md:flex h-full min-h-0 flex-col shrink-0 w-full md:w-[320px] lg:w-[340px]`}
        >
          <ChatsSidebar
            conversations={filteredConversations}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            activeFilter={activeFilter}
            onChangeFilter={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenNewChat={() => setIsNewChatOpen(true)}
          />
        </div>

        {/* Middle Column: Chat Conversation Stream & Composer */}
        <div
          className={`${
            mobilePanel === 'feed' ? 'flex' : 'hidden'
          } md:flex flex-1 min-w-0 min-h-0 h-full flex-col`}
        >
          <ChatFeed
            conversation={activeChat}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onSendAttachment={handleSendAttachment}
            onToggleReaction={handleToggleReaction}
            onOpenMaterialRequest={(req) => setSelectedRequest(req)}
            onOpenPhotoLightbox={(photos, index) =>
              setLightboxState({ isOpen: true, photos, index })
            }
            onToggleInfoSidebar={() =>
              setMobilePanel(mobilePanel === 'info' ? 'feed' : 'info')
            }
            onBackMobile={() => setMobilePanel('sidebar')}
            activeSubTab={activeSubTab}
            onChangeSubTab={setActiveSubTab}
          />
        </div>

        {/* Right Column: Group Info & Metadata */}
        <div
          className={`${
            mobilePanel === 'info' ? 'flex' : 'hidden'
          } lg:flex h-full min-h-0 flex-col shrink-0 w-full lg:w-[320px] xl:w-[340px]`}
        >
          <GroupInfoSidebar
            conversation={activeChat}
            onOpenAddMember={() => setIsAddMemberOpen(true)}
            onToggleTask={handleToggleTask}
            onCloseMobile={() => setMobilePanel('feed')}
          />
        </div>
      </div>

      {/* Modals & Dialogs */}
      <MaterialRequestModal
        request={selectedRequest}
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        onStatusChange={handleUpdateMaterialRequestStatus}
      />

      <PhotoLightboxModal
        photos={lightboxState.photos}
        currentIndex={lightboxState.index}
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
        onSelectIndex={(index) => setLightboxState((prev) => ({ ...prev, index }))}
      />

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onCreateChat={handleCreateChat}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMembers={handleAddMembers}
        existingMemberIds={activeChat.members?.map((m) => m.id) || []}
      />
    </div>
  );
}
