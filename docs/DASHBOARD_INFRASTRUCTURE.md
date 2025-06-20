# Dashboard Infrastructure Documentation

## Overview
The Ontogeny Studios Dashboard is a comprehensive project management and customer portal system built with React, TypeScript, and Firebase. It provides role-based access for both administrators and users to manage projects, features, and communications.

## 🏗️ Architecture Overview

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules with custom component styling
- **State Management**: React Context API + Custom Hooks
- **Routing**: React Router
- **UI Components**: Custom components with Lucide React icons

### Backend Stack
- **Database**: Google Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **File Storage**: Firebase Storage
- **Hosting**: Firebase Hosting
- **API Server**: Node.js/Express (Port 3005)

## 📂 Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── modals/         # Modal dialogs
│   │   ├── AdminDashboard.tsx
│   │   ├── UserDashboard.tsx
│   │   └── ...
│   ├── pages/              # Main page components
│   │   ├── Dashboard.tsx   # Main dashboard orchestrator
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useDashboardData.ts
│   │   └── useProjectModals.ts
│   ├── contexts/           # React Context providers
│   │   └── AuthContext.tsx
│   ├── services/           # Business logic services
│   ├── styles/            # Component-specific CSS
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
server/
├── index.js               # Express server
└── routes/               # API routes
```

## 🔧 Core Components

### Dashboard.tsx (Main Orchestrator)
- **Role**: Central component that manages the entire dashboard experience
- **Responsibilities**:
  - User authentication state management
  - Admin/User view mode switching
  - Modal state coordination
  - Project workflow management
  - Data refresh orchestration

### AdminDashboard.tsx
- **Role**: Administrative interface for managing users and projects
- **Features**:
  - User selection and management
  - Project overview for selected users
  - Project creation and editing
  - User project request management
  - Alert and notification system

### UserDashboard.tsx
- **Role**: Customer-facing interface for project management
- **Features**:
  - Personal project portfolio view
  - Feature request submission
  - Project progress tracking
  - AI-powered project consultation

## 🔄 Data Flow Architecture

### 1. Authentication Flow
```
User Login → Firebase Auth → AuthContext → Dashboard Component
```

### 2. Data Loading Flow
```
Dashboard → useDashboardData Hook → Firestore Collections → Component State
```

### 3. Modal Management Flow
```
User Action → useProjectModals Hook → Modal State Update → Component Render
```

### 4. Project Management Flow
```
Admin Creates Project → projects collection → User Dashboard Display
User Requests Project → user_project_requests collection → Admin Review
```

## 🗃️ Database Collections

### Collections Structure

#### `users`
- **Purpose**: User profile and authentication data
- **Key Fields**: `displayName`, `email`, `isAdmin`, `createdAt`
- **Access**: Users can read/write own data, admins can read all

#### `projects` 
- **Purpose**: Admin-created projects assigned to users
- **Key Fields**: `name`, `description`, `userId`, `status`, `progress`, `tasks`
- **Access**: Users can read/write own projects, admins can manage all

#### `user_project_requests`
- **Purpose**: User-submitted project requests pending admin review
- **Key Fields**: `projectName`, `description`, `requestedBy`, `status`, `features`
- **Access**: Users can manage own requests, admins can manage all

#### `admin_projects`
- **Purpose**: Enhanced project management with detailed tracking
- **Key Fields**: `workLogs`, `milestones`, `estimatedHours`, `actualHours`
- **Access**: Admins can read/write all, assigned users can read

#### `conversations` & `messages`
- **Purpose**: Internal messaging system
- **Access**: Participants can read/write their conversations

## 🎯 Key Features

### Admin Features
- **User Management**: View all users, search, and select for project management
- **Project Creation**: Create and assign projects to users
- **Request Management**: Review and approve user project requests
- **Progress Tracking**: Monitor project completion and task progress
- **Enhanced Project Tools**: Advanced project management with work logs

### User Features
- **Project Portfolio**: View assigned projects and their progress
- **Feature Requests**: Request new features for existing projects
- **AI Consultation**: Get AI-powered project recommendations
- **Progress Tracking**: Monitor personal project advancement

### Shared Features
- **Real-time Updates**: Live data synchronization across users
- **Modal-based UI**: Consistent modal dialogs for all interactions
- **Responsive Design**: Works on desktop and mobile devices
- **Role-based Access**: Automatic permission management

## 🔐 Security Architecture

### Authentication
- Firebase Authentication with email/password
- JWT tokens for secure API communication
- Automatic session management

### Authorization
- Role-based access control (Admin vs User)
- Firestore security rules enforce permissions
- Document-level access control

### Data Protection
- All data encrypted in transit and at rest
- User data isolation
- Admin privilege verification

## 🚀 Performance Optimizations

### Frontend
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo and useMemo for expensive operations
- **Optimistic Updates**: Immediate UI feedback with rollback capability

### Backend
- **Firestore Indexes**: Optimized queries for complex operations
- **Data Pagination**: Efficient loading of large datasets
- **Caching**: Strategic caching of frequently accessed data

## 🔄 State Management

### Global State (AuthContext)
- User authentication status
- User profile information
- Admin privileges

### Component State (Custom Hooks)
- **useDashboardData**: Manages all dashboard data (users, projects, requests)
- **useProjectModals**: Manages modal states and workflows

### Local State
- Form data and input states
- UI interaction states (loading, errors)
- Component-specific data

## 🛠️ Development Workflow

### Hot Module Replacement
- Vite provides instant updates during development
- Component state preservation during code changes

### Type Safety
- Full TypeScript implementation
- Strict type checking enabled
- Interface definitions for all data structures

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Automatic error recovery where possible

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

### Adaptive Features
- Collapsible sidebar on mobile
- Touch-friendly interactions
- Responsive modal sizing

## 🔄 Real-time Capabilities

### Firestore Real-time Listeners
- Live project updates
- Instant notification of changes
- Automatic UI synchronization

### WebSocket Alternative
- Firestore's built-in real-time features
- No additional WebSocket infrastructure needed
- Automatic reconnection handling

## 📊 Monitoring & Analytics

### Performance Monitoring
- Firebase Performance Monitoring
- Core Web Vitals tracking
- User interaction analytics

### Error Tracking
- Console error logging
- User action tracking
- Performance bottleneck identification

## 🚀 Deployment

### Frontend Deployment
- Firebase Hosting
- Automatic HTTPS
- CDN distribution

### Backend Deployment  
- Node.js server on port 3005
- Health check endpoint available
- API route management

This infrastructure provides a robust, scalable foundation for the Ontogeny Studios project management platform with room for future enhancements and feature additions. 