import React from 'react';
import './ProfilePicture.css';

interface ProfilePictureProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  username?: string;
  className?: string;
  onClick?: () => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src,
  alt,
  size = 'medium',
  username = 'User',
  className = '',
  onClick
}) => {
  // Generate initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate a consistent color based on username
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 50%)`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Hide the image and show initials fallback
    e.currentTarget.style.display = 'none';
  };

  return (
    <div 
      className={`profile-picture ${size} ${className} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      title={alt || username}
    >
      {src && (
        <img
          src={src}
          alt={alt || `${username}'s profile picture`}
          onError={handleImageError}
          className="profile-picture-img"
        />
      )}
      <div 
        className="profile-picture-fallback"
        style={{ backgroundColor: getAvatarColor(username) }}
      >
        {getInitials(username)}
      </div>
    </div>
  );
};

export default ProfilePicture;
