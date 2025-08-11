import { useEffect, useRef, useCallback, useState } from 'react';

export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'longpress';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  scale?: number;
  duration?: number;
  clientX: number;
  clientY: number;
}

export interface TouchOptions {
  threshold?: number; // Minimum distance for swipe
  longPressDelay?: number; // Delay for long press in ms
  preventScroll?: boolean; // Prevent default scroll behavior
  enabled?: boolean; // Enable/disable touch handling
}

export interface UseTouchResult {
  isTouch: boolean;
  gestureHistory: TouchGesture[];
  clearHistory: () => void;
}

export function useTouch(
  elementRef: React.RefObject<HTMLElement>,
  onGesture: (gesture: TouchGesture) => void,
  options: TouchOptions = {}
): UseTouchResult {
  const {
    threshold = 50,
    longPressDelay = 500,
    preventScroll = false,
    enabled = true
  } = options;

  const [isTouch, setIsTouch] = useState(false);
  const [gestureHistory, setGestureHistory] = useState<TouchGesture[]>([]);
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null);

  const clearHistory = useCallback(() => {
    setGestureHistory([]);
  }, []);

  const addToHistory = useCallback((gesture: TouchGesture) => {
    setGestureHistory(prev => [...prev.slice(-9), gesture]); // Keep last 10 gestures
  }, []);

  const calculateDistance = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }, []);

  const calculatePinchDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return calculateDistance(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY);
  }, [calculateDistance]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    // Detect touch capability
    setIsTouch(true);

    if (preventScroll) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Handle pinch gesture initialization
    if (e.touches.length === 2) {
      const distance = calculatePinchDistance(e.touches);
      pinchStartRef.current = { distance, scale: 1 };
    }

    // Start long press timer
    if (e.touches.length === 1) {
      longPressTimerRef.current = setTimeout(() => {
        if (touchStartRef.current) {
          const gesture: TouchGesture = {
            type: 'longpress',
            clientX: touchStartRef.current.x,
            clientY: touchStartRef.current.y,
            duration: Date.now() - touchStartRef.current.time
          };
          onGesture(gesture);
          addToHistory(gesture);
        }
      }, longPressDelay);
    }
  }, [enabled, preventScroll, onGesture, addToHistory, longPressDelay, calculatePinchDistance]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    if (preventScroll) {
      e.preventDefault();
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && pinchStartRef.current) {
      const currentDistance = calculatePinchDistance(e.touches);
      const scale = currentDistance / pinchStartRef.current.distance;
      
      if (Math.abs(scale - pinchStartRef.current.scale) > 0.1) {
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        
        const gesture: TouchGesture = {
          type: 'pinch',
          scale: scale,
          clientX: centerX,
          clientY: centerY
        };
        onGesture(gesture);
        addToHistory(gesture);
        pinchStartRef.current.scale = scale;
      }
    }

    // Clear long press timer on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, [enabled, preventScroll, onGesture, addToHistory, calculatePinchDistance]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    if (preventScroll) {
      e.preventDefault();
    }

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const touch = e.changedTouches[0];
    const endTime = Date.now();
    const duration = endTime - touchStartRef.current.time;
    const distance = calculateDistance(
      touchStartRef.current.x,
      touchStartRef.current.y,
      touch.clientX,
      touch.clientY
    );

    // Determine gesture type
    if (distance < threshold && duration < longPressDelay) {
      // Tap gesture
      const gesture: TouchGesture = {
        type: 'tap',
        clientX: touch.clientX,
        clientY: touch.clientY,
        duration
      };
      onGesture(gesture);
      addToHistory(gesture);
    } else if (distance >= threshold) {
      // Swipe gesture
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      
      let direction: 'left' | 'right' | 'up' | 'down';
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const gesture: TouchGesture = {
        type: 'swipe',
        direction,
        distance,
        clientX: touch.clientX,
        clientY: touch.clientY,
        duration
      };
      onGesture(gesture);
      addToHistory(gesture);
    }

    // Reset state
    touchStartRef.current = null;
    pinchStartRef.current = null;
  }, [enabled, preventScroll, onGesture, addToHistory, threshold, longPressDelay, calculateDistance]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventScroll });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll]);

  // Detect touch capability on first interaction
  useEffect(() => {
    const detectTouch = () => setIsTouch(true);
    
    window.addEventListener('touchstart', detectTouch, { once: true, passive: true });
    
    return () => {
      window.removeEventListener('touchstart', detectTouch);
    };
  }, []);

  return {
    isTouch,
    gestureHistory,
    clearHistory
  };
}

// Utility hook for simple swipe detection
export function useSwipe(
  elementRef: React.RefObject<HTMLElement>,
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void,
  threshold: number = 50
) {
  return useTouch(
    elementRef,
    (gesture) => {
      if (gesture.type === 'swipe' && gesture.direction) {
        onSwipe(gesture.direction);
      }
    },
    { threshold }
  );
}

// Utility hook for tap detection with double-tap support
export function useTap(
  elementRef: React.RefObject<HTMLElement>,
  onTap: () => void,
  onDoubleTap?: () => void,
  doubleTapDelay: number = 300
) {
  const lastTapRef = useRef<number>(0);

  return useTouch(
    elementRef,
    (gesture) => {
      if (gesture.type === 'tap') {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapRef.current;

        if (onDoubleTap && timeSinceLastTap < doubleTapDelay) {
          onDoubleTap();
          lastTapRef.current = 0; // Reset to prevent triple-tap
        } else {
          onTap();
          lastTapRef.current = now;
        }
      }
    }
  );
}