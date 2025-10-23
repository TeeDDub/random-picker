import { MediaInfo, MediaType } from '@/types';

/**
 * Detect media type from URL or text
 */
export const detectMediaType = (content: string): MediaInfo => {
  if (!content) {
    return { type: 'text', text: content };
  }
  
  // Check for YouTube URL
  const youtubeVideoId = extractYoutubeVideoId(content);
  if (youtubeVideoId) {
    return {
      type: 'youtube',
      videoId: youtubeVideoId,
      url: content,
    };
  }
  
  // Check for image URL
  if (isImageUrl(content)) {
    return {
      type: 'image',
      url: content,
    };
  }
  
  // Default to text
  return {
    type: 'text',
    text: content,
  };
};

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
const extractYoutubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Check if URL is an image
 */
const isImageUrl = (url: string): boolean => {
  // Check for image file extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
  if (imageExtensions.test(url)) {
    return true;
  }
  
  // Check for common image hosting domains
  const imageHosts = [
    'imgur.com',
    'i.imgur.com',
    'flickr.com',
    'unsplash.com',
    'pexels.com',
    'pixabay.com',
    'cloudinary.com',
    'googleusercontent.com',
  ];
  
  try {
    const urlObj = new URL(url);
    return imageHosts.some(host => urlObj.hostname.includes(host));
  } catch {
    return false;
  }
};

/**
 * Check if content is a valid URL
 */
export const isValidUrl = (content: string): boolean => {
  try {
    new URL(content);
    return true;
  } catch {
    return false;
  }
};

