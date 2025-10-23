'use client';

import React from 'react';
import Image from 'next/image';
import { detectMediaType, isValidUrl } from '@/lib/mediaDetector';

interface MediaRendererProps {
  content: string;
  className?: string;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const mediaInfo = detectMediaType(content);

  switch (mediaInfo.type) {
    case 'youtube':
      return (
        <div className={`w-full aspect-video ${className}`}>
          <iframe
            className="w-full h-full rounded-lg shadow-lg"
            src={`https://www.youtube.com/embed/${mediaInfo.videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );

    case 'image':
      return (
        <div className={`relative w-full aspect-video ${className}`}>
          <Image
            src={mediaInfo.url!}
            alt="Content"
            fill
            className="object-contain rounded-lg shadow-lg"
            unoptimized
          />
        </div>
      );

    case 'text':
    default:
      // Check if it's a clickable link
      if (isValidUrl(content)) {
        return (
          <a
            href={content}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg ${className}`}
          >
            <span>🔗 바로 가기</span>
          </a>
        );
      }
      return <span className={className}>{content}</span>;
  }
};

