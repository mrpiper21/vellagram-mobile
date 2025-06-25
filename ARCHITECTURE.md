# Vedify Mobile App Architecture

## Overview
This is a React Native Expo app with real-time chat functionality, contact management, and user authentication. The app uses Zustand for state management, Socket.io for real-time communication, and follows a clean architecture pattern with optimized theme management.

## Core Architecture

### 1. State Management (Zustand Stores)

#### `store/useUserStore.ts`
- **Purpose**: Manages user authentication state and user data
- **Features**: 
  - Persistent storage with AsyncStorage
  - User login/logout functionality
  - User profile updates
- **Key Methods**: `setUser`, `logout`, `updateUser`
- **Convenience Hooks**: `useUser`, `useIsAuthenticated`, `useSetUser`, `useLogout`, `useUpdateUser`

#### `store/useChatStore.ts`
- **Purpose**: Manages chat conversations and messages
- **Features**:
  - Persistent message storage
  - Real-time message updates
  - Conversation management
  - Unread message tracking
  - Message status tracking (sending, sent, delivered, read)
- **Key Methods**: `addMessage`, `addSocketMessage`, `updateMessageStatus`, `markConversationAsRead`
- **Convenience Hooks**: `useConversations`, `useActiveConversation`, `useConversationMessages`

#### `store/useContactStore.ts`
- **Purpose**: Manages device contacts and registration status
- **Features**:
  - Device contact syncing
  - Phone number registration checking
  - Background contact processing
  - Caching and persistence
- **Key Methods**: `syncContacts`, `checkContactRegistration`, `updateContactStatus`

### 2. Theme Management (Optimized)

#### `context/ThemeContext.tsx`
- **Purpose**: Provides centralized theme management without hook nesting
- **Features**:
  - Single `useColorScheme()` call at the provider level
  - Context-based theme distribution
  - Type-safe theme access
  - Performance optimized (no repeated hook calls)
- **Key Hooks**: `useAppTheme`, `useAppColorScheme`, `useAppIsDark`

#### `hooks/useTheme.ts`
- **Purpose**: Legacy theme hook (deprecated in favor of ThemeContext)
- **Note**: Avoids calling hooks within hooks by using direct React Native imports

### 3. Real-time Communication

#### `context/useSockectContext.tsx`
- **Purpose**: Provides Socket.io connection management
- **Features**:
  - Automatic connection to backend server
  - Connection status tracking
  - User registration with socket
  - Message delivery acknowledgments
- **Server URL**: `http://192.168.86.184:3000`

#### `hooks/useSocketChat.ts`
- **Purpose**: Handles real-time chat functionality
- **Features**:
  - Socket message listeners
  - Message sending via socket
  - Typing indicators
  - Message read acknowledgments
  - Connection status monitoring

### 4. Background Services

#### `services/contactBackgroundService.ts`
- **Purpose**: Handles background contact processing
- **Features**:
  - Periodic contact syncing
  - Phone number registration checking
  - Smart caching and batching
  - Error handling and retry logic
- **Singleton Pattern**: Ensures only one instance runs

#### `services/contact.service.ts`
- **Purpose**: API calls for contact registration checking
- **Features**:
  - Phone number validation
  - Registration status checking
  - Error handling

### 5. User Inactivity Management

#### `context/UserInactivityContext.tsx`
- **Purpose**: Manages user inactivity and app state
- **Features**:
  - App state change detection
  - Inactivity timeout handling
  - Background processing
  - Caching and debouncing
  - Contact registration checking on app focus

### 6. UI Components

#### Main Screens
- **`app/(tabs)/index.tsx`**: Main chat list with conversations
- **`app/conversation/[id].tsx`**: Individual conversation screen
- **`app/contacts/index.tsx`**: Contacts list with registration status
- **`app/(tabs)/groups/index.tsx`**: Groups management

#### Conversation Components
- **`app/conversation/components/Header.tsx`**: Conversation header
- **`app/conversation/components/AnnouncementBanner.tsx`**: Group announcements
- **`app/conversation/components/MenuDropdown.tsx`**: Conversation menu
- **`app/conversation/components/GroupDetailsSheet.tsx`**: Group details modal
- **`app/conversation/components/MembersSheet.tsx`**: Group members list
- **`app/conversation/components/ContributionModal.tsx`**: Contribution management

#### Filter Components
- **`app/(tabs)/groups/components/FilterSheets.tsx`**: Amount and date filters
- **`app/(tabs)/groups/components/FilterDropdown.tsx`**: Filter dropdown UI
- **`app/(tabs)/groups/components/SearchHeader.tsx`**: Search functionality

### 7. Context Providers

#### `app/context/FilterSheetContext.tsx`
- **Purpose**: Manages filter sheet visibility state
- **Features**: Amount and date filter sheet controls

#### `app/context/GroupDetailsContext.tsx`
- **Purpose**: Manages group details modal state
- **Features**: Group selection and modal visibility

### 8. Configuration

#### `config/api.ts`
- **Purpose**: API endpoint configuration
- **Endpoints**:
  - OTP generation and verification
  - User authentication (login/register)
  - Phone number registration checking

#### `constants/Colors.ts`
- **Purpose**: Theme color definitions
- **Features**: Light and dark mode color schemes

### 9. Type Definitions

#### `@types/user-auth-types.ts`
- **Purpose**: TypeScript interfaces for user data
- **Interfaces**: `IUser`, `IUserRegistrationData`, `Group`

## Data Flow

### Chat Flow
1. User sends message → `useSocketChat.sendMessage()`
2. Message added to local store → `useChatStore.addMessage()`
3. Message sent via socket → Backend processes
4. Recipient receives message → `useSocketChat` listeners
5. Message added to recipient's store → `useChatStore.addSocketMessage()`
6. Message status updated → `useChatStore.updateMessageStatus()`

### Contact Flow
1. App starts → `contactBackgroundService` initializes
2. Device contacts synced → `useContactStore.syncContacts()`
3. Phone numbers checked → `checkPhoneNumberRegisteration()`
4. Results cached → AsyncStorage persistence
5. UI updates → Contact status indicators

### Authentication Flow
1. User login → `useUserStore.setUser()`
2. Socket connection → `SocketProvider` registers user
3. Chat listeners initialized → `useSocketChat` setup
4. Background services start → Contact processing begins

### Theme Flow
1. App starts → `ThemeProvider` calls `useColorScheme()` once
2. Theme context created → Distributed to all components
3. Components use `useAppTheme()` → No additional hook calls
4. Theme changes → Automatic re-renders with new theme

## Key Features

### Real-time Messaging
- Instant message delivery via Socket.io
- Message status tracking (sending, sent, delivered, read)
- Typing indicators
- Offline message queuing

### Contact Management
- Automatic device contact syncing
- Phone number registration checking
- Background processing for performance
- Smart caching to reduce API calls

### User Experience
- Dark/light theme support with optimized performance
- Smooth animations and transitions
- Haptic feedback
- Offline status indicators

### Performance Optimizations
- **Theme Optimization**: Single `useColorScheme()` call at provider level
- Zustand stores with selective subscriptions
- Memoized components to prevent re-renders
- Background processing for heavy operations
- Efficient caching strategies
- No hook nesting (avoids calling hooks within hooks)

## Development Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- React Native development environment

### Installation
```bash
npm install
# or
yarn install
```

### Running the App
```bash
npx expo start
```

### Backend Requirements
- Socket.io server running on `http://192.168.86.184:3000`
- API endpoints for authentication and contact checking
- Message delivery and acknowledgment system

## File Structure Summary

```
vedify-mobile/
├── app/                          # Main app screens and components
│   ├── (tabs)/                   # Tab-based navigation
│   ├── conversation/             # Chat conversation screens
│   ├── contacts/                 # Contact management
│   ├── auth/                     # Authentication screens
│   ├── components/               # App-specific components
│   └── context/                  # App-level context providers
├── components/                   # Reusable UI components
├── store/                        # Zustand state stores
├── services/                     # API and background services
├── hooks/                        # Custom React hooks
├── context/                      # Global context providers
├── config/                       # Configuration files
├── constants/                    # App constants
├── @types/                       # TypeScript type definitions
└── assets/                       # Static assets
```

## Performance Best Practices

### Theme Management
- ✅ Single `useColorScheme()` call at provider level
- ✅ Context-based theme distribution
- ✅ No hook nesting or repeated calls
- ✅ Type-safe theme access

### State Management
- ✅ Selective Zustand subscriptions
- ✅ Memoized selectors
- ✅ Persistent storage optimization

### Component Optimization
- ✅ Memoized components where needed
- ✅ Stable hook dependencies
- ✅ Efficient re-render prevention

This architecture provides a scalable, maintainable, and performant foundation for the Vedify mobile app with real-time chat capabilities, efficient contact management, and optimized theme handling. 