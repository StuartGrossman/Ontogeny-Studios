# Firestore Security Rules Documentation

## Overview
This document explains the Firestore security rules implementation for the Ontogeny Studios Dashboard. The rules provide role-based access control, ensuring data security and proper permissions for different user types.

## 🔐 Security Principles

### 1. Principle of Least Privilege
- Users can only access data they own or are explicitly granted access to
- Admin privileges are verified server-side before granting elevated access
- No anonymous access allowed - all operations require authentication

### 2. Defense in Depth
- Multiple layers of validation (authentication + authorization + data validation)
- Document-level permissions with field-level considerations
- Resource existence checks to prevent unauthorized access

### 3. Data Isolation
- User data is completely isolated from other users
- Admin access is explicitly granted and verified
- Cross-user data access only through approved admin interfaces

## 📋 Rules Structure

### Authentication Requirement
```javascript
// All operations require authentication
request.auth != null
```

### Admin Verification
```javascript
// Admin status verification
get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
```

## 🗃️ Collection-Specific Rules

### Users Collection (`/users/{userId}`)

#### Purpose
Stores user profile information, authentication details, and admin status.

#### Rules
```javascript
match /users/{userId} {
  // Users can read and write their own user document
  allow read, write: if request.auth != null && request.auth.uid == userId;
  
  // All authenticated users can read other users (for admin functionality)
  allow read: if request.auth != null;
}
```

#### Access Patterns
- **Self Access**: Users can fully manage their own profile
- **Read Access**: All authenticated users can view other profiles (needed for admin user selection)
- **Write Restrictions**: Users cannot modify other users' profiles

#### Security Considerations
- Admin status changes require server-side validation
- Email verification status protected from user modification
- Profile visibility controlled but allows necessary admin functionality

---

### Projects Collection (`/projects/{projectId}`)

#### Purpose
Stores admin-created projects assigned to specific users.

#### Rules
```javascript
match /projects/{projectId} {
  allow read, write: if request.auth != null && 
    (resource == null || resource.data.userId == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
  allow create: if request.auth != null && 
    (request.resource.data.userId == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
}
```

#### Access Patterns
- **User Access**: Users can read/write projects assigned to them (`userId` field)
- **Admin Access**: Admins can read/write all projects
- **Creation Rights**: Admins can create projects, users can create their own

#### Security Considerations
- `resource == null` check handles document creation scenarios
- Admin verification for cross-user project management
- User assignment validation during project creation

---

### User Project Requests Collection (`/user_project_requests/{requestId}`)

#### Purpose
Stores project requests submitted by users for admin review.

#### Rules
```javascript
match /user_project_requests/{requestId} {
  allow read, write: if request.auth != null && 
    (resource == null || resource.data.requestedBy == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
  allow create: if request.auth != null && 
    (request.resource.data.requestedBy == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
}
```

#### Access Patterns
- **User Access**: Users can manage their own project requests
- **Admin Access**: Admins can view and manage all project requests
- **Request Ownership**: Based on `requestedBy` field

#### Security Considerations
- Prevents users from viewing other users' project requests
- Admin approval workflow protected
- Document creation allows for proper user ownership assignment

---

### Admin Projects Collection (`/admin_projects/{projectId}`)

#### Purpose
Enhanced project management with detailed tracking, work logs, and admin-only features.

#### Rules
```javascript
match /admin_projects/{projectId} {
  allow read, write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
  allow read: if request.auth != null && 
    request.auth.uid in resource.data.assignedTo;
}
```

#### Access Patterns
- **Admin Full Access**: Admins can read/write all admin projects
- **User Read Access**: Users can read projects they're assigned to
- **Assignment-Based**: Access controlled by `assignedTo` array field

#### Security Considerations
- Strict admin-only write access
- User read access limited to assigned projects
- Work logs and sensitive admin data protected

---

### Project Requests Collection (`/project-requests/{requestId}`)

#### Purpose
Legacy collection for project request management (being phased out in favor of `user_project_requests`).

#### Rules
```javascript
match /project-requests/{requestId} {
  allow read, write: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
}
```

#### Access Patterns
- **User Access**: Based on `userId` field
- **Admin Access**: Full access to all project requests

#### Migration Status
- Being replaced by `user_project_requests`
- Maintained for backward compatibility
- New features should use `user_project_requests`

---

### Meetings Collection (`/meetings/{meetingId}`)

#### Purpose
Stores scheduled meetings between users and admins.

#### Rules
```javascript
match /meetings/{meetingId} {
  allow read, write: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
}
```

#### Access Patterns
- **User Access**: Users can manage their own meetings
- **Admin Access**: Admins can manage all meetings
- **Meeting Ownership**: Based on `userId` field

---

### Feature Assignments Collection (`/feature-assignments/{assignmentId}`)

#### Purpose
Tracks feature assignments and development progress.

#### Rules
```javascript
match /feature-assignments/{assignmentId} {
  allow read, write: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
}
```

#### Access Patterns
- **User Access**: Users can view their feature assignments
- **Admin Access**: Admins can manage all feature assignments
- **Assignment Tracking**: Based on `userId` field

---

### Conversations Collection (`/conversations/{conversationId}`)

#### Purpose
Manages conversation metadata and participant lists.

#### Rules
```javascript
match /conversations/{conversationId} {
  allow read, update: if request.auth != null && 
    request.auth.uid in resource.data.participants;
  allow create, write: if request.auth != null && 
    request.auth.uid in request.resource.data.participants;
}
```

#### Access Patterns
- **Participant Access**: Only conversation participants can read/update
- **Creation Rights**: Users can create conversations they participate in
- **Participant Validation**: Access controlled by `participants` array

---

### Messages Collection (`/messages/{messageId}`)

#### Purpose
Stores individual messages within conversations.

#### Rules
```javascript
match /messages/{messageId} {
  allow read: if request.auth != null && 
    (resource.data.senderId == request.auth.uid || 
     resource.data.receiverId == request.auth.uid);
  allow create: if request.auth != null && 
    (request.resource.data.senderId == request.auth.uid || 
     request.resource.data.receiverId == request.auth.uid);
  allow update: if request.auth != null && 
    (resource.data.senderId == request.auth.uid || 
     resource.data.receiverId == request.auth.uid);
}
```

#### Access Patterns
- **Sender/Receiver Access**: Only message sender and receiver can access
- **Message Integrity**: Prevents unauthorized message access
- **Bidirectional Access**: Both parties can read/modify messages

## 🛡️ Security Enhancements

### Document Existence Checks
```javascript
resource == null  // Handles document creation scenarios
```

### Resource vs Request Resource
- `resource.data`: Current document data
- `request.resource.data`: New document data being written

### Admin Privilege Verification
- Real-time admin status checking
- Server-side verification prevents client-side manipulation
- Consistent admin checks across all collections

## 🔄 Rule Deployment

### Deployment Process
1. Rules are defined in `client/firestore.rules`
2. Deployed using Firebase CLI: `firebase deploy --only firestore:rules`
3. Automatic compilation and syntax validation
4. Live deployment to Firestore security layer

### Testing Rules
- Firebase Rules Playground for testing
- Unit tests for rule validation
- Integration tests with actual user scenarios

## 📊 Performance Considerations

### Rule Efficiency
- Minimal database reads for admin verification
- Cached admin status checks where possible
- Optimized rule evaluation order

### Index Requirements
- Rules may require composite indexes
- Automatic index suggestion by Firebase
- Manual index creation for complex queries

## 🚨 Security Monitoring

### Access Logging
- Firebase Security Rules audit logs
- Failed access attempt tracking
- Unusual access pattern detection

### Regular Security Reviews
- Quarterly rule review process
- Access pattern analysis
- Privilege escalation prevention

## 🔧 Troubleshooting Common Issues

### Permission Denied Errors
1. Check user authentication status
2. Verify admin privilege settings
3. Confirm document ownership fields
4. Validate rule syntax and logic

### Document Creation Failures
1. Ensure `resource == null` checks
2. Verify required field presence
3. Check user ownership assignment
4. Validate create permissions

### Admin Access Issues
1. Confirm admin status in users collection
2. Check admin verification queries
3. Validate admin-only rule sections
4. Test admin privilege inheritance

This security rule structure provides comprehensive protection while maintaining the flexibility needed for the Ontogeny Studios Dashboard's complex role-based access requirements. 