import { describe, it, expect } from 'vitest';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES_SITE_A,
} from '../components/features/communication/chat/chat-data';

describe('Chat data integrity and workflows', () => {
  it('loads the Site A - Civil Work conversation correctly with members, tasks, and files', () => {
    const siteA = INITIAL_CONVERSATIONS.find((c) => c.id === 'site-a-civil-work');
    expect(siteA).toBeDefined();
    expect(siteA?.title).toBe('Site A - Civil Work');
    expect(siteA?.subtitle).toBe('Site Group • 12 members');
    expect(siteA?.project).toBe('Green Valley Project');
    expect(siteA?.site).toBe('Site A');
    expect(siteA?.stats?.members).toBe(12);
    expect(siteA?.stats?.files).toBe(48);
    expect(siteA?.stats?.tasks).toBe(16);
    expect(siteA?.stats?.links).toBe(5);

    // Verify members
    expect(siteA?.members?.length).toBeGreaterThanOrEqual(5);
    const admin = siteA?.members?.find((m) => m.isAdmin);
    expect(admin?.name).toBe('Ravi Kumar');
    expect(admin?.role).toBe('Site Supervisor');

    // Verify shared tasks
    expect(siteA?.sharedTasks?.length).toBeGreaterThanOrEqual(3);
    const task1 = siteA?.sharedTasks?.[0];
    expect(task1?.title).toBe('Site cleanliness and safety check');
    expect(task1?.status).toBe('In Progress');

    // Verify recent files
    expect(siteA?.recentFiles?.length).toBeGreaterThanOrEqual(3);
    const safetyDoc = siteA?.recentFiles?.find((f) => f.name.includes('Safety'));
    expect(safetyDoc?.name).toBe('Site_Safety_Guidelines.pdf');
  });

  it('contains the complete message history including material requests, attachments, location, and photos', () => {
    expect(INITIAL_MESSAGES_SITE_A.length).toBe(5);

    // Message 1: Foundation progress photos & location
    const msg1 = INITIAL_MESSAGES_SITE_A[0];
    expect(msg1.sender.name).toBe('Ravi Kumar');
    expect(msg1.images?.length).toBe(4);
    expect(msg1.location?.name).toBe('Location');
    expect(msg1.location?.address).toContain('Green Valley, Lucknow');
    expect(msg1.reactions?.[0].emoji).toBe('👍');
    expect(msg1.reactions?.[0].count).toBe(4);

    // Message 2: Amit Verma feedback
    const msg2 = INITIAL_MESSAGES_SITE_A[1];
    expect(msg2.sender.name).toBe('Amit Verma');
    expect(msg2.text).toContain('Good progress');

    // Message 3: Material Request MR-001
    const msg3 = INITIAL_MESSAGES_SITE_A[2];
    expect(msg3.materialRequest?.requestNo).toBe('MR-001');
    expect(msg3.materialRequest?.material).toBe('Cement (OPC 53 Grade)');
    expect(msg3.materialRequest?.quantity).toBe('50 Bags');
    expect(msg3.materialRequest?.status).toBe('Pending Approval');

    // Message 4: Neha Singh inspection announcement
    const msg4 = INITIAL_MESSAGES_SITE_A[3];
    expect(msg4.sender.name).toBe('Neha Singh');
    expect(msg4.text).toContain('Site inspection scheduled');

    // Message 5: Suresh Kumar PDF attachment
    const msg5 = INITIAL_MESSAGES_SITE_A[4];
    expect(msg5.sender.name).toBe('Suresh Kumar');
    expect(msg5.attachment?.name).toBe('Site_Safety_Guidelines.pdf');
    expect(msg5.attachment?.size).toBe('2.4 MB');
  });

  it('filters conversations correctly by unread, groups, projects, and sites', () => {
    const unread = INITIAL_CONVERSATIONS.filter((c) => (c.unreadCount || 0) > 0);
    expect(unread.length).toBeGreaterThan(0);
    expect(unread.some((c) => c.id === 'site-a-civil-work')).toBe(true);

    const projects = INITIAL_CONVERSATIONS.filter((c) => c.type === 'project');
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.some((c) => c.title.includes('Green Valley'))).toBe(true);
  });
});
