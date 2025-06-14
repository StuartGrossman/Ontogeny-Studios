export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  displayName?: string;
  photoURL?: string;
}

export type WindowName = 
  | 'businessProfile'
  | 'resources'
  | 'coreServices'
  | 'systemAnalysis'
  | 'createProject'
  | 'userManagement'
  | 'login'
  | 'signup';

export interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
}

export interface Metric {
  label: string;
  value: string | number;
  trend: number;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  readTime?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  year: string;
  image?: string;
}

export interface LoginModalProps {
  onClose: () => void;
  onSignupClick: () => void;
  onLoginSuccess: (user: User) => void;
}

export interface SignupModalProps {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupSuccess: (user: User) => void;
}

export interface CreateProjectModalProps {
  onClose: () => void;
  onCreateSuccess: (project: Project) => void;
}

export interface UserManagementModalProps {
  onClose: () => void;
  onUpdateSuccess: (user: User) => void;
} 