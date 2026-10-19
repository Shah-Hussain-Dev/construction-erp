export interface TrainingStep {
  stepNumber: number;
  title: string;
  content: string;
}

export interface TrainingLesson {
  id: string;
  number: string;
  title: string;
  description: string;
  type: 'video' | 'guide';
  duration: string;
  completed?: boolean;
  videoMockUrl?: string;
  steps?: TrainingStep[];
}

export interface TrainingModule {
  id: number;
  number: number;
  title: string;
  name: string;
  summary: string;
  description: string;
  status: 'ready' | 'coming_soon';
  completedCount: number;
  totalCount: number;
  icon: string;
  lessons?: TrainingLesson[];
  comingSoonMessage?: string;
  upcomingTopics?: string[];
}

export interface PopularTopic {
  id: string;
  moduleId: number;
  title: string;
  lessonsCount: number;
  theme: 'blue' | 'green' | 'purple' | 'amber' | 'rose' | 'emerald';
}

export interface TrainingFaq {
  id: string;
  question: string;
  answer: string;
}

export interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface TrainingData {
  overview: {
    welcomeTitle: string;
    welcomeHeadline: string;
    welcomeDescription: string;
    badges: Array<{
      id: string;
      title: string;
      subtitle: string;
      icon: string;
    }>;
  };
  progress: {
    completionPercentage: number;
    completedModules: number;
    totalModules: number;
    completedLessons: number;
    totalLessons: number;
    learningHours: number;
  };
  popularTopics: PopularTopic[];
  modules: TrainingModule[];
  quickLinks: QuickLink[];
  faqs: TrainingFaq[];
}
