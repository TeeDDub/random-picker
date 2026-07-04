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
      url: toDisplayImageUrl(content),
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
 * Convert a Google Drive share link to a directly displayable thumbnail URL.
 * The uc?export=view endpoint is being blocked for direct embedding,
 * so the thumbnail endpoint is used instead (w640 is enough for display).
 * Non-Drive URLs are returned unchanged.
 */
export const toDisplayImageUrl = (url: string): string => {
  const fileIdMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
    || (url.includes('drive.google.com') ? url.match(/[?&]id=([a-zA-Z0-9_-]+)/) : null);
  if (fileIdMatch) {
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w640`;
  }
  return url;
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

  // Google Drive share links are treated as images (converted via toDisplayImageUrl)
  if (/drive\.google\.com\/(file\/d\/|open\?id=|uc\?)/i.test(url)) {
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

/**
 * YouTube thumbnail URL for a video ID — used as the roulette preview frame
 * (an iframe is too heavy to mount/unmount every spin) and for preloading.
 */
export const youtubeThumbnailUrl = (videoId: string): string =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

/**
 * Collect every preloadable image URL (images + YouTube thumbnails) from items,
 * so the roulette animation renders them instantly from cache instead of
 * flashing a raw URL while the image loads.
 */
export const collectPreloadUrls = (
  items: { properties: { [key: string]: string } }[]
): string[] => {
  const urls = new Set<string>();
  items.forEach(item => {
    Object.values(item.properties).forEach(value => {
      const media = detectMediaType(value);
      if (media.type === 'image' && media.url) {
        urls.add(media.url);
      } else if (media.type === 'youtube' && media.videoId) {
        urls.add(youtubeThumbnailUrl(media.videoId));
      }
    });
  });
  return Array.from(urls);
};

