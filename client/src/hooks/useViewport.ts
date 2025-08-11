import { useState, useEffect, useCallback } from 'react';

export interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  devicePixelRatio: number;
  isTouch: boolean;
  hasHover: boolean;
  prefersReducedMotion: boolean;
  colorScheme: 'light' | 'dark';
}

export interface ViewportBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

const defaultBreakpoints: ViewportBreakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280
};

export function useViewport(breakpoints: ViewportBreakpoints = defaultBreakpoints): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>(() => {
    // Initialize with safe defaults for SSR
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        orientation: 'portrait',
        devicePixelRatio: 1,
        isTouch: false,
        hasHover: true,
        prefersReducedMotion: false,
        colorScheme: 'light'
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      width,
      height,
      isMobile: width < breakpoints.mobile,
      isTablet: width >= breakpoints.mobile && width < breakpoints.desktop,
      isDesktop: width >= breakpoints.desktop,
      orientation: width > height ? 'landscape' : 'portrait',
      devicePixelRatio: window.devicePixelRatio || 1,
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasHover: window.matchMedia('(hover: hover)').matches,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    };
  });

  const updateViewport = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    setViewport({
      width,
      height,
      isMobile: width < breakpoints.mobile,
      isTablet: width >= breakpoints.mobile && width < breakpoints.desktop,
      isDesktop: width >= breakpoints.desktop,
      orientation: width > height ? 'landscape' : 'portrait',
      devicePixelRatio: window.devicePixelRatio || 1,
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasHover: window.matchMedia('(hover: hover)').matches,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    });
  }, [breakpoints]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update viewport on resize
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    // Listen for media query changes
    const mediaQueries = [
      window.matchMedia('(hover: hover)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-color-scheme: dark)')
    ];

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', updateViewport);
    });

    // Initial viewport calculation
    updateViewport();

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', updateViewport);
      });
    };
  }, [updateViewport]);

  return viewport;
}

// Hook for safe area insets (iPhone X+ notch, etc.)
export function useSafeAreaInsets() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
}

// Hook for device type detection
export function useDeviceType() {
  const viewport = useViewport();
  
  const deviceType = (() => {
    if (viewport.isMobile) {
      return viewport.orientation === 'landscape' ? 'mobile-landscape' : 'mobile-portrait';
    }
    if (viewport.isTablet) {
      return viewport.orientation === 'landscape' ? 'tablet-landscape' : 'tablet-portrait';
    }
    return 'desktop';
  })();

  return {
    ...viewport,
    deviceType,
    isMobileDevice: viewport.isMobile,
    isTabletDevice: viewport.isTablet,
    isDesktopDevice: viewport.isDesktop,
    isTouchDevice: viewport.isTouch,
    isRetina: viewport.devicePixelRatio > 1
  };
}

// Hook for responsive values based on breakpoints
export function useResponsiveValue<T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T {
  const viewport = useViewport();
  
  if (viewport.isMobile) {
    return values.mobile;
  }
  if (viewport.isTablet) {
    return values.tablet ?? values.mobile;
  }
  return values.desktop ?? values.tablet ?? values.mobile;
}

// Hook for window dimensions with debouncing
export function useWindowSize(debounceMs: number = 100) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [debounceMs]);

  return windowSize;
}

// Hook for scroll lock (useful for mobile modals)
export function useScrollLock() {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isLocked) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isLocked]);

  return [isLocked, setIsLocked] as const;
}