/**
 * BadgeService.ts
 * Mock service for badges, user statistics, and gamification data
 */

// Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Date;
  progress?: number; // 0-100 for badges not yet earned
  requirement: string;
  xpReward: number;
}

export interface UserStats {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  streak: number;
  longestStreak: number;
  casesCompleted: number;
  accuracy: number;
  badgesEarned: number;
  rank: number;
  totalStudents: number;
  dailyGoal: number;
  dailyCasesCompleted: number;
  joinedDate: Date;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarUrl?: string;
  level: number;
  totalXP: number;
  streak: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface ClassItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  instructor: string;
  studentsCount: number;
  casesCount: number;
  progress: number;
}

export interface DiagnosisOption {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Mock Data

const mockBadges: Badge[] = [
  {
    id: 'first-diagnosis',
    name: 'First Steps',
    description: 'Complete your first diagnosis case',
    icon: '🎯',
    rarity: 'common',
    requirement: 'Complete 1 case',
    xpReward: 50,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    rarity: 'rare',
    requirement: '7-day streak',
    xpReward: 150,
  },
  {
    id: 'perfect-10',
    name: 'Perfect Ten',
    description: 'Get 10 diagnoses correct in a row',
    icon: '⭐',
    rarity: 'epic',
    requirement: '10 correct in a row',
    xpReward: 300,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a diagnosis in under 2 minutes',
    icon: '⚡',
    rarity: 'rare',
    requirement: 'Complete case < 2 min',
    xpReward: 100,
  },
  {
    id: 'endodontist',
    name: 'Endodontist Expert',
    description: 'Master 20 pulp-related cases',
    icon: '🦷',
    rarity: 'epic',
    requirement: 'Complete 20 endo cases',
    xpReward: 500,
  },
  {
    id: 'periodontal-pro',
    name: 'Periodontal Pro',
    description: 'Master 20 periodontal cases',
    icon: '🩺',
    rarity: 'epic',
    requirement: 'Complete 20 perio cases',
    xpReward: 500,
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    rarity: 'legendary',
    requirement: '30-day streak',
    xpReward: 1000,
  },
  {
    id: 'diagnostician',
    name: 'Master Diagnostician',
    description: 'Complete 100 diagnosis cases',
    icon: '👑',
    rarity: 'legendary',
    requirement: 'Complete 100 cases',
    xpReward: 2000,
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a case before 7 AM',
    icon: '🌅',
    rarity: 'common',
    requirement: 'Practice before 7 AM',
    xpReward: 25,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a case after 11 PM',
    icon: '🦉',
    rarity: 'common',
    requirement: 'Practice after 11 PM',
    xpReward: 25,
  },
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Join 3 different classes',
    icon: '🤝',
    rarity: 'rare',
    requirement: 'Join 3 classes',
    xpReward: 100,
  },
  {
    id: 'radiograph-reader',
    name: 'Radiograph Reader',
    description: 'Use the X-ray tool in 50 cases',
    icon: '📷',
    rarity: 'rare',
    requirement: 'Use X-ray 50 times',
    xpReward: 200,
  },
];

const mockUserStats: UserStats = {
  id: 'user-001',
  name: 'Dr. Sarah Chen',
  email: 'sarah.chen@dental.edu',
  avatarUrl: undefined,
  level: 12,
  currentXP: 750,
  xpToNextLevel: 1000,
  totalXP: 8750,
  streak: 14,
  longestStreak: 21,
  casesCompleted: 45,
  accuracy: 87,
  badgesEarned: 6,
  rank: 3,
  totalStudents: 156,
  dailyGoal: 3,
  dailyCasesCompleted: 2,
  joinedDate: new Date('2024-01-10'),
};

const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: 'user-005',
    name: 'Dr. James Wilson',
    level: 15,
    totalXP: 12500,
    streak: 28,
    rank: 1,
  },
  {
    id: 'user-003',
    name: 'Dr. Emily Park',
    level: 14,
    totalXP: 10200,
    streak: 21,
    rank: 2,
  },
  {
    id: 'user-001',
    name: 'Dr. Sarah Chen',
    level: 12,
    totalXP: 8750,
    streak: 14,
    rank: 3,
    isCurrentUser: true,
  },
  {
    id: 'user-007',
    name: 'Dr. Michael Brown',
    level: 11,
    totalXP: 7800,
    streak: 12,
    rank: 4,
  },
  {
    id: 'user-002',
    name: 'Dr. Lisa Thompson',
    level: 11,
    totalXP: 7500,
    streak: 9,
    rank: 5,
  },
  {
    id: 'user-008',
    name: 'Dr. David Kim',
    level: 10,
    totalXP: 6900,
    streak: 7,
    rank: 6,
  },
  {
    id: 'user-004',
    name: 'Dr. Anna Rodriguez',
    level: 10,
    totalXP: 6400,
    streak: 15,
    rank: 7,
  },
  {
    id: 'user-006',
    name: 'Dr. Chris Lee',
    level: 9,
    totalXP: 5800,
    streak: 5,
    rank: 8,
  },
  {
    id: 'user-009',
    name: 'Dr. Rachel Green',
    level: 8,
    totalXP: 4500,
    streak: 3,
    rank: 9,
  },
  {
    id: 'user-010',
    name: 'Dr. Tom Martinez',
    level: 7,
    totalXP: 3200,
    streak: 2,
    rank: 10,
  },
];

const mockClasses: ClassItem[] = [
  {
    id: 'class-001',
    name: 'Endodontics 301',
    icon: '🦷',
    color: '#6366f1',
    instructor: 'Prof. Williams',
    studentsCount: 32,
    casesCount: 45,
    progress: 67,
  },
  {
    id: 'class-002',
    name: 'Periodontics Lab',
    icon: '🔬',
    color: '#10b981',
    instructor: 'Dr. Martinez',
    studentsCount: 28,
    casesCount: 38,
    progress: 42,
  },
  {
    id: 'class-003',
    name: 'Oral Pathology',
    icon: '📚',
    color: '#f59e0b',
    instructor: 'Prof. Johnson',
    studentsCount: 45,
    casesCount: 52,
    progress: 23,
  },
];

const mockDiagnosisOptions: DiagnosisOption[] = [
  {
    id: 'reversible-pulpitis',
    name: 'Reversible Pulpitis',
    description: 'Inflammation of the pulp that can heal if the cause is removed',
    category: 'Pulpal',
  },
  {
    id: 'irreversible-pulpitis',
    name: 'Irreversible Pulpitis with Periapical Abscess',
    description: 'Severe pulp inflammation with periapical involvement requiring treatment',
    category: 'Pulpal',
  },
  {
    id: 'pulp-necrosis',
    name: 'Pulp Necrosis',
    description: 'Death of the pulp tissue',
    category: 'Pulpal',
  },
  {
    id: 'chronic-periodontitis',
    name: 'Chronic Periodontitis',
    description: 'Progressive loss of alveolar bone with periodontal pocket formation',
    category: 'Periodontal',
  },
  {
    id: 'periapical-abscess',
    name: 'Acute Periapical Abscess',
    description: 'Localized collection of pus in the periapical region',
    category: 'Periapical',
  },
  {
    id: 'cracked-tooth',
    name: 'Cracked Tooth Syndrome',
    description: 'Incomplete fracture of a vital posterior tooth',
    category: 'Structural',
  },
  {
    id: 'dentinal-hypersensitivity',
    name: 'Dentinal Hypersensitivity',
    description: 'Pain from exposed dentin in response to stimuli',
    category: 'Other',
  },
  {
    id: 'acute-gingivitis',
    name: 'Acute Gingivitis',
    description: 'Inflammation of the gingiva without attachment loss',
    category: 'Periodontal',
  },
];

// Service Functions

export const getAllBadges = (): Badge[] => {
  return mockBadges;
};

export const getEarnedBadges = (): Badge[] => {
  return mockBadges.filter((badge) => badge.earnedAt !== undefined);
};

export const getUnlockedBadges = (): Badge[] => {
  return mockBadges.filter((badge) => badge.earnedAt === undefined);
};

export const getBadgeById = (id: string): Badge | undefined => {
  return mockBadges.find((badge) => badge.id === id);
};

export const getUserStats = (): UserStats => {
  return mockUserStats;
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  return mockLeaderboard;
};

export const getJoinedClasses = (): ClassItem[] => {
  return mockClasses;
};

export const getDiagnosisOptions = (): DiagnosisOption[] => {
  return mockDiagnosisOptions;
};

// Badge rarity colors
export const getBadgeRarityColor = (rarity: Badge['rarity']): string => {
  const colors = {
    common: '#9ca3af', // gray
    rare: '#3b82f6', // blue
    epic: '#a855f7', // purple
    legendary: '#f59e0b', // amber/gold
  };
  return colors[rarity];
};

export const getBadgeRarityGradient = (rarity: Badge['rarity']): string => {
  const gradients = {
    common: 'from-gray-200 to-gray-300',
    rare: 'from-blue-200 to-blue-400',
    epic: 'from-purple-300 to-pink-400',
    legendary: 'from-yellow-300 to-amber-500',
  };
  return gradients[rarity];
};

// XP Calculations
export const calculateLevelFromXP = (totalXP: number): number => {
  // Simple level formula: level = floor(sqrt(totalXP / 100))
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
};

export const calculateXPForLevel = (level: number): number => {
  // XP needed to reach a level
  return Math.pow(level - 1, 2) * 100;
};

export const calculateXPToNextLevel = (
  currentLevel: number,
  totalXP: number
): number => {
  const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  return xpForNextLevel - totalXP;
};

// Utility function to get user initials for avatar
export const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
