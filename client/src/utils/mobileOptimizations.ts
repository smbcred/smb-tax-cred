// Mobile Performance and UX Optimization Utilities

// Mobile Performance and UX Optimization Utilities

export interface MobileOptimizationConfig {
  enableVirtualKeyboardFix: boolean;
  enableTouchOptimizations: boolean;
  enablePerformanceOptimizations: boolean;
  enableA11yEnhancements: boolean;
}

const defaultConfig: MobileOptimizationConfig = {
  enableVirtualKeyboardFix: true,
  enableTouchOptimizations: true,
  enablePerformanceOptimizations: true,
  enableA11yEnhancements: true
};

/**
 * Initialize mobile optimizations for the application
 */
export function initMobileOptimizations(config: Partial<MobileOptimizationConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  if (typeof window === 'undefined') return;

  // Virtual keyboard fix for iOS
  if (finalConfig.enableVirtualKeyboardFix) {
    initVirtualKeyboardFix();
  }

  // Touch optimizations
  if (finalConfig.enableTouchOptimizations) {
    initTouchOptimizations();
  }

  // Performance optimizations
  if (finalConfig.enablePerformanceOptimizations) {
    initPerformanceOptimizations();
  }

  // Accessibility enhancements
  if (finalConfig.enableA11yEnhancements) {
    initA11yEnhancements();
  }

  console.log('Mobile optimizations initialized:', finalConfig);
}

/**
 * Fix virtual keyboard viewport issues on iOS
 */
function initVirtualKeyboardFix() {
  if (!window.visualViewport) return;

  const viewport = window.visualViewport;
  const originalHeight = window.innerHeight;

  function handleViewportChange() {
    const currentHeight = viewport.height;
    const heightDifference = originalHeight - currentHeight;
    
    // If keyboard is likely open (height reduced significantly)
    if (heightDifference > 150) {
      document.documentElement.style.setProperty('--keyboard-height', `${heightDifference}px`);
      document.body.classList.add('keyboard-open');
    } else {
      document.documentElement.style.removeProperty('--keyboard-height');
      document.body.classList.remove('keyboard-open');
    }
  }

  viewport.addEventListener('resize', handleViewportChange);
  
  // Cleanup function
  return () => {
    viewport.removeEventListener('resize', handleViewportChange);
    document.documentElement.style.removeProperty('--keyboard-height');
    document.body.classList.remove('keyboard-open');
  };
}

/**
 * Initialize touch optimizations
 */
function initTouchOptimizations() {
  // Prevent iOS bounce scroll
  document.addEventListener('touchmove', (e) => {
    if (e.target === document.body) {
      e.preventDefault();
    }
  }, { passive: false });

  // Improve touch target accessibility
  const style = document.createElement('style');
  style.textContent = `
    /* Improve touch targets on mobile */
    @media (hover: none) and (pointer: coarse) {
      button, [role="button"], input, select, textarea, a {
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Improve form inputs */
      input, textarea, select {
        font-size: 16px; /* Prevent zoom on iOS */
        border-radius: 8px;
      }
      
      /* Better focus indicators for touch */
      *:focus-visible {
        outline: 3px solid hsl(var(--ring));
        outline-offset: 2px;
      }
    }
  `;
  document.head.appendChild(style);

  // Add touch classes to html element
  document.documentElement.classList.add('touch-optimized');
}

/**
 * Initialize performance optimizations for mobile
 */
function initPerformanceOptimizations() {
  // Enable GPU acceleration for transforms
  const style = document.createElement('style');
  style.textContent = `
    .gpu-accelerated {
      transform: translateZ(0);
      will-change: transform;
    }
    
    /* Optimize scroll performance */
    .smooth-scroll {
      -webkit-overflow-scrolling: touch;
      overflow-scrolling: touch;
    }
    
    /* Reduce repaints during scrolling */
    .scroll-optimized {
      contain: layout style paint;
    }
  `;
  document.head.appendChild(style);

  // Preload critical resources
  preloadCriticalResources();

  // Implement intersection observer for lazy loading
  setupLazyLoading();
}

/**
 * Initialize accessibility enhancements for mobile
 */
function initA11yEnhancements() {
  // Announce screen reader updates for mobile
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.id = 'mobile-announcer';
  document.body.appendChild(announcer);

  // Add mobile-specific ARIA attributes
  document.documentElement.setAttribute('data-mobile-optimized', 'true');

  // Improve focus management for mobile
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (target && isMobileDevice()) {
      // Scroll focused element into view on mobile
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

/**
 * Preload critical resources for better mobile performance
 */
function preloadCriticalResources() {
  const criticalAssets = [
    // Add your critical CSS/JS/font resources here
    '/fonts/inter-var.woff2',
  ];

  criticalAssets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = asset;
    
    if (asset.endsWith('.woff2') || asset.endsWith('.woff')) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    } else if (asset.endsWith('.css')) {
      link.as = 'style';
    } else if (asset.endsWith('.js')) {
      link.as = 'script';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Setup lazy loading for images and components
 */
function setupLazyLoading() {
  if (!('IntersectionObserver' in window)) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.1
  });

  // Observe all images with data-src attribute
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Mobile device detection
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth < 768
  );
}

/**
 * Check if device is in landscape mode
 */
export function isLandscape(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > window.innerHeight;
}

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const computedStyle = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0')
  };
}

/**
 * Optimize form input behavior for mobile
 */
export function optimizeFormInput(inputElement: HTMLInputElement | HTMLTextAreaElement) {
  // Prevent zoom on iOS
  inputElement.style.fontSize = '16px';
  
  // Add better input attributes for mobile keyboards
  const inputType = inputElement.type || 'text';
  
  switch (inputType) {
    case 'email':
      inputElement.setAttribute('inputmode', 'email');
      inputElement.setAttribute('autocomplete', 'email');
      break;
    case 'tel':
      inputElement.setAttribute('inputmode', 'tel');
      inputElement.setAttribute('autocomplete', 'tel');
      break;
    case 'number':
      inputElement.setAttribute('inputmode', 'numeric');
      break;
    case 'search':
      inputElement.setAttribute('inputmode', 'search');
      break;
    case 'url':
      inputElement.setAttribute('inputmode', 'url');
      inputElement.setAttribute('autocomplete', 'url');
      break;
  }

  // Add touch-friendly styling
  inputElement.classList.add('mobile-input');
}

/**
 * Create a mobile-friendly modal
 */
export function createMobileModal(content: HTMLElement): {
  show: () => void;
  hide: () => void;
  destroy: () => void;
} {
  const overlay = document.createElement('div');
  overlay.className = 'mobile-modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  `;

  const modal = document.createElement('div');
  modal.className = 'mobile-modal';
  modal.style.cssText = `
    background: white;
    border-radius: 16px 16px 0 0;
    max-height: 90vh;
    width: 100%;
    max-width: 500px;
    margin: 0 16px;
    overflow: hidden;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  `;

  modal.appendChild(content);
  overlay.appendChild(modal);

  let isVisible = false;

  const show = () => {
    if (isVisible) return;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    // Trigger reflow
    overlay.offsetHeight;
    
    overlay.style.opacity = '1';
    overlay.style.visibility = 'visible';
    modal.style.transform = 'translateY(0)';
    
    isVisible = true;
  };

  const hide = () => {
    if (!isVisible) return;
    
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    modal.style.transform = 'translateY(100%)';
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      document.body.style.overflow = '';
      isVisible = false;
    }, 300);
  };

  const destroy = () => {
    hide();
  };

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hide();
    }
  });

  return { show, hide, destroy };
}

/**
 * Debounce touch events to improve performance
 */
export function debounceTouch<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 16
): T {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

/**
 * Throttle scroll events for better performance
 */
export function throttleScroll<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 16
): T {
  let lastCall = 0;
  
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  }) as T;
}

/**
 * Add haptic feedback (where supported)
 */
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') {
  if (typeof window === 'undefined' || !('navigator' in window)) return;

  const navigator = window.navigator as any;
  
  if (navigator.vibrate) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      selection: [5]
    };
    navigator.vibrate(patterns[type]);
  }
}

/**
 * Announce to screen readers (mobile-optimized)
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcer = document.getElementById('mobile-announcer');
  if (!announcer) return;

  announcer.setAttribute('aria-live', priority);
  announcer.textContent = message;

  // Clear after announcement
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

/**
 * Fix input focus zoom on iOS
 */
export function preventInputZoom() {
  if (typeof window === 'undefined') return;

  const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  if (!meta) return;

  const originalContent = meta.content;

  const preventZoom = () => {
    meta.content = originalContent + ', user-scalable=no';
  };

  const allowZoom = () => {
    meta.content = originalContent;
  };

  // Prevent zoom on input focus
  document.addEventListener('focusin', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      preventZoom();
    }
  });

  // Allow zoom when input loses focus
  document.addEventListener('focusout', () => {
    setTimeout(allowZoom, 100);
  });
}