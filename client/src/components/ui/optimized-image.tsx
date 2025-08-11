import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  blur?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  quality = 75,
  blur = true,
  placeholder,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, inView]);

  // Generate responsive srcset for different screen sizes
  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc || (!baseSrc.startsWith('http') && !baseSrc.startsWith('/'))) {
      return undefined;
    }

    const sizes = [320, 640, 768, 1024, 1280, 1536];
    return sizes
      .map(size => {
        // For external images, we can't generate different sizes
        // In a real app, you'd use a service like Cloudinary or Next.js Image
        return `${baseSrc} ${size}w`;
      })
      .join(', ');
  };

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  // Generate sizes attribute for responsive images
  const sizes = width && height 
    ? `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${width}px`
    : '100vw';

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        !loaded && blur && 'animate-pulse bg-gray-200 dark:bg-gray-800',
        className
      )}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!loaded && !error && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <span className="text-gray-400 text-sm">{placeholder}</span>
        </div>
      )}

      {/* Main Image */}
      {(inView || priority) && !error && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          srcSet={generateSrcSet(src)}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            'object-cover w-full h-full'
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center text-gray-400">
            <svg 
              className="w-8 h-8 mx-auto mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span className="text-xs">Failed to load image</span>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {!loaded && !error && blur && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-shimmer bg-[length:200%_100%]" />
      )}
    </div>
  );
}

// Preload function for critical images
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Image cache for frequently used images
class ImageCache {
  private cache = new Map<string, HTMLImageElement>();
  private maxSize = 50;

  preload(src: string): Promise<void> {
    if (this.cache.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Add to cache, removing oldest if needed
        if (this.cache.size >= this.maxSize) {
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey);
        }
        this.cache.set(src, img);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  get(src: string): HTMLImageElement | undefined {
    return this.cache.get(src);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache();