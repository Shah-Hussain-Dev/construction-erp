export interface ChatMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
  isAdmin?: boolean;
}

export interface ChatTask {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: 'In Progress' | 'Pending' | 'Completed';
  completed: boolean;
}

export interface ChatFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'doc' | 'cad';
  url: string;
  timestamp: string;
  author: string;
}

export interface MaterialRequestData {
  requestNo: string;
  material: string;
  quantity: string;
  requiredDate: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  requestedBy: string;
  site: string;
  notes?: string;
  estimatedCost?: string;
}

export interface LocationData {
  name: string;
  address: string;
  coordinates: string;
  mapImage?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  sender: {
    id: string;
    name: string;
    role: string;
    avatar: string;
    online?: boolean;
  };
  timestamp: string;
  text?: string;
  images?: string[];
  location?: LocationData;
  materialRequest?: MaterialRequestData;
  attachment?: {
    name: string;
    size: string;
    type: 'pdf' | 'image' | 'doc';
    url: string;
  };
  reactions?: {
    emoji: string;
    count: number;
    reactedByMe?: boolean;
  }[];
}

export interface ChatConversation {
  id: string;
  title: string;
  subtitle: string;
  type: 'site' | 'project' | 'group' | 'direct' | 'announcement';
  avatar: string;
  isPinned?: boolean;
  lastMessage: string;
  lastTime: string;
  unreadCount?: number;
  project?: string;
  site?: string;
  description?: string;
  status?: string;
  stats?: {
    members: number;
    files: number;
    tasks: number;
    links: number;
  };
  members?: ChatMember[];
  sharedTasks?: ChatTask[];
  recentFiles?: ChatFile[];
  subTabs?: string[];
}
