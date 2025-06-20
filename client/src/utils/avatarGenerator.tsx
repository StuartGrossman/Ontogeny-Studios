import React from 'react';

// Avatar Generator Utility
export const generateSimpleAvatar = (name: string, size: number = 40): string => {
  // Get initials from the name
  const getInitials = (fullName: string): string => {
    if (!fullName) return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Generate a consistent color based on the name
  const getColorFromName = (name: string): string => {
    const colors = [
      '#667eea', // Primary purple
      '#764ba2', // Secondary purple
      '#3b82f6', // Blue
      '#10b981', // Green
      '#f59e0b', // Yellow
      '#ef4444', // Red
      '#8b5cf6', // Violet
      '#06b6d4', // Cyan
      '#84cc16', // Lime
      '#f97316', // Orange
      '#ec4899', // Pink
      '#6366f1', // Indigo
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);
  const textColor = '#ffffff';

  // Create SVG avatar
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${backgroundColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" font-size="${size * 0.4}" font-weight="600" fill="${textColor}">
        ${initials}
      </text>
    </svg>
  `;

  // Convert SVG to data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Interface for UserAvatar props
interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  size?: number;
  className?: string;
}

// React component for avatar display
export const UserAvatar: React.FC<UserAvatarProps> = ({ photoURL, displayName, size = 40, className = '' }) => {
  const avatarSrc = photoURL || generateSimpleAvatar(displayName || 'User', size);
  
  return (
    <img
      src={avatarSrc}
      alt={displayName || 'User'}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover'
      }}
    />
  );
}; 