// CDN and resource optimization utilities

// CDN configuration
export const CDN_CONFIG = {
  images: {
    cloudinary: {
      cloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME || '',
      baseUrl: 'https://res.cloudinary.com',
    },
    aws: {
      region: process.env.VITE_AWS_REGION || 'us-east-1',
      bucket: process.env.VITE_AWS_BUCKET || '',
    },
  },
  fonts: {
    google: 'https://fonts.googleapis.com',
    adobe: 'https://use.typekit.net',
  },
  scripts: {
    jsdelivr: 'https://cdn.jsdelivr.net',
    unpkg: 'https://unpkg.com',
  },
};

// Image optimization utility
export class ImageOptimizer {
  private cloudinaryBaseUrl = `${CDN_CONFIG.images.cloudinary.baseUrl}/${CDN_CONFIG.images.cloudinary.cloudName}`;

  generateCloudinaryUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
      crop?: 'fill' | 'fit' | 'scale' | 'crop';
      gravity?: 'auto' | 'face' | 'center';
      fetchFormat?: 'auto';
    } = {}
  ): string {
    const {
      width,
      height,
      quality = 80,
      format = 'auto',
      crop = 'fill',
      gravity = 'auto',
      fetchFormat = 'auto',
    } = options;

    const transformations = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (crop) transformations.push(`c_${crop}`);
    if (gravity) transformations.push(`g_${gravity}`);
    if (fetchFormat) transformations.push(`f_${fetchFormat}`);

    const transformString = transformations.join(',');

    return `${this.cloudinaryBaseUrl}/image/upload/${transformString}/${publicId}`;
  }

  generateResponsiveImageSet(
    publicId: string,
    sizes: number[] = [320, 640, 768, 1024, 1280, 1536],
    options: Parameters<ImageOptimizer['generateCloudinaryUrl']>[1] = {}
  ): {
    srcSet: string;
    sizes: string;
  } {
    const srcSet = sizes
      .map(size => {
        const url = this.generateCloudinaryUrl(publicId, {
          ...options,
          width: size,
        });
        return `${url} ${size}w`;
      })
      .join(', ');

    const sizesAttr = [
      '(max-width: 320px) 280px',
      '(max-width: 640px) 600px',
      '(max-width: 768px) 728px',
      '(max-width: 1024px) 984px',
      '(max-width: 1280px) 1240px',
      '1200px',
    ].join(', ');

    return {
      srcSet,
      sizes: sizesAttr,
    };
  }
}

// Font optimization
export class FontOptimizer {
  private preloadedFonts = new Set<string>();

  preloadFont(fontUrl: string, type: 'woff2' | 'woff' = 'woff2'): void {
    if (this.preloadedFonts.has(fontUrl)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = `font/${type}`;
    link.href = fontUrl;
    link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
    this.preloadedFonts.add(fontUrl);
  }

  preloadGoogleFonts(families: string[]): void {
    const fontDisplay = 'swap';
    const familiesQuery = families.join('&family=');
    const url = `${CDN_CONFIG.fonts.google}/css2?family=${familiesQuery}&display=${fontDisplay}`;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = url;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    
    document.head.appendChild(link);
  }

  optimizeWebFonts(): void {
    // Preload critical system fonts
    this.preloadGoogleFonts([
      'Inter:wght@400;500;600;700',
      'JetBrains+Mono:wght@400;500',
    ]);

    // Font display optimization
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
      @font-face {
        font-family: 'JetBrains Mono';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }
}

// Script optimization
export class ScriptOptimizer {
  private loadedScripts = new Set<string>();

  async loadScript(src: string, options: {
    async?: boolean;
    defer?: boolean;
    module?: boolean;
    integrity?: string;
    crossOrigin?: 'anonymous' | 'use-credentials';
  } = {}): Promise<void> {
    if (this.loadedScripts.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = options.async ?? true;
      script.defer = options.defer ?? false;
      
      if (options.module) script.type = 'module';
      if (options.integrity) script.integrity = options.integrity;
      if (options.crossOrigin) script.crossOrigin = options.crossOrigin;

      script.onload = () => {
        this.loadedScripts.add(src);
        resolve();
      };
      script.onerror = reject;

      document.head.appendChild(script);
    });
  }

  preloadScript(src: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
  }

  loadCriticalScripts(): void {
    // Preload critical third-party scripts
    this.preloadScript('https://js.stripe.com/v3/');
    this.preloadScript('https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID');
  }
}

// Resource hints utility
export class ResourceHints {
  addDNSPrefetch(domains: string[]): void {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  addPreconnect(domains: string[]): void {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `https://${domain}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  addCriticalResourceHints(): void {
    // DNS prefetch for external domains
    this.addDNSPrefetch([
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'js.stripe.com',
      'api.stripe.com',
      'www.googletagmanager.com',
      'res.cloudinary.com',
    ]);

    // Preconnect to critical domains
    this.addPreconnect([
      'fonts.googleapis.com',
      'js.stripe.com',
      'api.stripe.com',
    ]);
  }
}

// Main CDN optimization class
export class CDNOptimizer {
  private imageOptimizer = new ImageOptimizer();
  private fontOptimizer = new FontOptimizer();
  private scriptOptimizer = new ScriptOptimizer();
  private resourceHints = new ResourceHints();

  initializeOptimizations(): void {
    // Add resource hints
    this.resourceHints.addCriticalResourceHints();
    
    // Optimize fonts
    this.fontOptimizer.optimizeWebFonts();
    
    // Load critical scripts
    this.scriptOptimizer.loadCriticalScripts();
    
    // Set up service worker for caching
    this.setupServiceWorker();
  }

  private async setupServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  getImageOptimizer(): ImageOptimizer {
    return this.imageOptimizer;
  }

  getFontOptimizer(): FontOptimizer {
    return this.fontOptimizer;
  }

  getScriptOptimizer(): ScriptOptimizer {
    return this.scriptOptimizer;
  }
}

// Singleton instance
export const cdnOptimizer = new CDNOptimizer();

// Utility functions
export function optimizeImageUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
): string {
  // If it's already optimized or external, return as-is
  if (src.includes('cloudinary.com') || src.startsWith('http')) {
    return src;
  }

  // For local images, you might want to implement a different strategy
  // or integrate with your image processing pipeline
  return src;
}

export function generateImageSrcSet(
  src: string,
  sizes: number[] = [320, 640, 768, 1024, 1280]
): string {
  return sizes
    .map(size => `${optimizeImageUrl(src, { width: size })} ${size}w`)
    .join(', ');
}

// Initialize CDN optimizations when module loads
if (typeof window !== 'undefined') {
  cdnOptimizer.initializeOptimizations();
}