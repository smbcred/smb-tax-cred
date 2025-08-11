// Micro-interactions and animation utilities

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface SpringConfig {
  tension?: number;
  friction?: number;
  mass?: number;
}

// Predefined animation configurations
export const ANIMATION_PRESETS = {
  // Basic transitions
  fadeIn: {
    duration: 300,
    easing: 'ease-out',
    fill: 'forwards'
  } as AnimationConfig,
  
  fadeOut: {
    duration: 200,
    easing: 'ease-in',
    fill: 'forwards'
  } as AnimationConfig,
  
  slideIn: {
    duration: 400,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fill: 'forwards'
  } as AnimationConfig,
  
  slideOut: {
    duration: 300,
    easing: 'cubic-bezier(0.7, 0, 0.84, 0)',
    fill: 'forwards'
  } as AnimationConfig,
  
  // Interactive elements
  buttonHover: {
    duration: 150,
    easing: 'ease-out'
  } as AnimationConfig,
  
  buttonPress: {
    duration: 100,
    easing: 'ease-in'
  } as AnimationConfig,
  
  // Success/error states
  success: {
    duration: 500,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    fill: 'forwards'
  } as AnimationConfig,
  
  error: {
    duration: 400,
    easing: 'ease-out',
    fill: 'forwards'
  } as AnimationConfig,
  
  // Loading states
  pulse: {
    duration: 1000,
    easing: 'ease-in-out'
  } as AnimationConfig,
  
  spin: {
    duration: 1000,
    easing: 'linear'
  } as AnimationConfig,
  
  // Bounce effects
  bounce: {
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  } as AnimationConfig
};

// Spring animation physics
export const SPRING_PRESETS = {
  gentle: { tension: 120, friction: 14, mass: 1 },
  wobbly: { tension: 180, friction: 12, mass: 1 },
  stiff: { tension: 210, friction: 20, mass: 1 },
  slow: { tension: 280, friction: 60, mass: 1 },
  molasses: { tension: 280, friction: 120, mass: 1 }
};

// Animation keyframes
export const KEYFRAMES = {
  fadeIn: [
    { opacity: 0 },
    { opacity: 1 }
  ],
  
  fadeOut: [
    { opacity: 1 },
    { opacity: 0 }
  ],
  
  slideInFromTop: [
    { transform: 'translateY(-100%)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 }
  ],
  
  slideInFromBottom: [
    { transform: 'translateY(100%)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 }
  ],
  
  slideInFromLeft: [
    { transform: 'translateX(-100%)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 }
  ],
  
  slideInFromRight: [
    { transform: 'translateX(100%)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 }
  ],
  
  scaleIn: [
    { transform: 'scale(0.8)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1 }
  ],
  
  scaleOut: [
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(0.8)', opacity: 0 }
  ],
  
  bounce: [
    { transform: 'scale(1)' },
    { transform: 'scale(1.1)' },
    { transform: 'scale(1)' }
  ],
  
  shake: [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(0)' }
  ],
  
  pulse: [
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(1.05)', opacity: 0.8 },
    { transform: 'scale(1)', opacity: 1 }
  ],
  
  spin: [
    { transform: 'rotate(0deg)' },
    { transform: 'rotate(360deg)' }
  ],
  
  heartbeat: [
    { transform: 'scale(1)' },
    { transform: 'scale(1.3)' },
    { transform: 'scale(1)' },
    { transform: 'scale(1.3)' },
    { transform: 'scale(1)' }
  ],
  
  wobble: [
    { transform: 'translateX(0%)' },
    { transform: 'translateX(-25%) rotate(-5deg)' },
    { transform: 'translateX(20%) rotate(3deg)' },
    { transform: 'translateX(-15%) rotate(-3deg)' },
    { transform: 'translateX(10%) rotate(2deg)' },
    { transform: 'translateX(-5%) rotate(-1deg)' },
    { transform: 'translateX(0%)' }
  ],
  
  rubberBand: [
    { transform: 'scale(1)' },
    { transform: 'scale(1.25, 0.75)' },
    { transform: 'scale(0.75, 1.25)' },
    { transform: 'scale(1.15, 0.85)' },
    { transform: 'scale(0.95, 1.05)' },
    { transform: 'scale(1)' }
  ]
};

// Animation utility functions
export function animate(
  element: HTMLElement,
  keyframes: PropertyIndexedKeyframes | Keyframe[],
  config: AnimationConfig = {}
): Animation {
  const options: KeyframeAnimationOptions = {
    duration: config.duration || 300,
    easing: config.easing || 'ease-out',
    delay: config.delay || 0,
    fill: config.fill || 'forwards'
  };
  
  return element.animate(keyframes, options);
}

export function fadeIn(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, KEYFRAMES.fadeIn as Keyframe[], { ...ANIMATION_PRESETS.fadeIn, ...config });
}

export function fadeOut(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, KEYFRAMES.fadeOut as Keyframe[], { ...ANIMATION_PRESETS.fadeOut, ...config });
}

export function slideIn(
  element: HTMLElement, 
  direction: 'top' | 'bottom' | 'left' | 'right' = 'top',
  config?: AnimationConfig
): Animation {
  const keyframeMap = {
    top: KEYFRAMES.slideInFromTop,
    bottom: KEYFRAMES.slideInFromBottom,
    left: KEYFRAMES.slideInFromLeft,
    right: KEYFRAMES.slideInFromRight
  };
  
  return animate(element, keyframeMap[direction] as Keyframe[], { ...ANIMATION_PRESETS.slideIn, ...config });
}

export function scaleIn(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, KEYFRAMES.scaleIn as Keyframe[], { ...ANIMATION_PRESETS.fadeIn, ...config });
}

export function bounce(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, KEYFRAMES.bounce as Keyframe[], { ...ANIMATION_PRESETS.bounce, ...config });
}

export function shake(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, KEYFRAMES.shake as Keyframe[], { 
    ...ANIMATION_PRESETS.error, 
    duration: 500,
    ...config 
  });
}

export function pulse(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, KEYFRAMES.pulse as Keyframe[], { ...ANIMATION_PRESETS.pulse, ...config });
}

export function heartbeat(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, KEYFRAMES.heartbeat as Keyframe[], { 
    duration: 1000,
    easing: 'ease-in-out',
    ...config 
  });
}

// Stagger animation utility
export function staggerAnimation(
  elements: HTMLElement[],
  animationFn: (element: HTMLElement) => Animation,
  staggerDelay: number = 100
): Promise<void> {
  const animations = elements.map((element, index) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const animation = animationFn(element);
        animation.addEventListener('finish', () => resolve());
      }, index * staggerDelay);
    });
  });
  
  return Promise.all(animations).then(() => {});
}

// Intersection Observer for scroll-triggered animations
export function createScrollAnimationObserver(
  animationFn: (element: HTMLElement) => Animation,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        animationFn(element);
        observer.unobserve(element);
      }
    });
  }, { ...defaultOptions, ...options });
  
  return observer;
}

// Reduced motion handling
export function respectsReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animateWithReducedMotion(
  element: HTMLElement,
  keyframes: Keyframe[],
  config: AnimationConfig = {}
): Animation {
  if (respectsReducedMotion()) {
    // Provide reduced motion alternative
    const reducedKeyframes = (keyframes as Keyframe[]).map(keyframe => ({
      ...keyframe,
      transform: undefined // Remove transform animations
    }));
    
    return animate(element, reducedKeyframes, {
      ...config,
      duration: Math.min(config.duration || 300, 150) // Shorter duration
    });
  }
  
  return animate(element, keyframes, config);
}

// Micro-interaction helpers
export const microInteractions = {
  // Button interactions
  buttonPress: (button: HTMLElement) => {
    const animation = animate(button, [
      { transform: 'scale(1)' },
      { transform: 'scale(0.95)' },
      { transform: 'scale(1)' }
    ], ANIMATION_PRESETS.buttonPress);
    
    return animation;
  },
  
  // Input focus effect
  inputFocus: (input: HTMLElement) => {
    return animate(input, [
      { transform: 'scale(1)' },
      { transform: 'scale(1.02)' }
    ], {
      duration: 200,
      easing: 'ease-out',
      fill: 'forwards'
    });
  },
  
  // Card hover effect
  cardHover: (card: HTMLElement) => {
    return animate(card, [
      { transform: 'translateY(0) scale(1)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
      { transform: 'translateY(-2px) scale(1.02)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
    ], {
      duration: 200,
      easing: 'ease-out',
      fill: 'forwards'
    });
  },
  
  // Success checkmark
  successCheck: (element: HTMLElement) => {
    return animate(element, [
      { transform: 'scale(0) rotate(0deg)', opacity: 0 },
      { transform: 'scale(1.2) rotate(180deg)', opacity: 1 },
      { transform: 'scale(1) rotate(360deg)', opacity: 1 }
    ], ANIMATION_PRESETS.success);
  },
  
  // Error shake
  errorShake: (element: HTMLElement) => {
    return shake(element, { duration: 400 });
  },
  
  // Loading pulse
  loadingPulse: (element: HTMLElement) => {
    const animation = animate(element, KEYFRAMES.pulse as Keyframe[], {
      ...ANIMATION_PRESETS.pulse,
      iterations: Infinity
    } as KeyframeAnimationOptions);
    
    return animation;
  },
  
  // Notification slide in
  notificationSlideIn: (notification: HTMLElement) => {
    return slideIn(notification, 'right', {
      duration: 300,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    });
  },
  
  // Modal backdrop fade
  modalBackdropFade: (backdrop: HTMLElement) => {
    return fadeIn(backdrop, {
      duration: 200,
      easing: 'ease-out'
    });
  },
  
  // Tooltip appear
  tooltipAppear: (tooltip: HTMLElement) => {
    return animate(tooltip, [
      { opacity: 0, transform: 'scale(0.8) translateY(10px)' },
      { opacity: 1, transform: 'scale(1) translateY(0)' }
    ], {
      duration: 150,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }
};

// Performance monitoring for animations
export class AnimationProfiler {
  private static measurements: Map<string, number[]> = new Map();
  
  static start(label: string): string {
    const id = `${label}_${Date.now()}`;
    performance.mark(`${id}_start`);
    return id;
  }
  
  static end(id: string): number {
    performance.mark(`${id}_end`);
    performance.measure(id, `${id}_start`, `${id}_end`);
    
    const measure = performance.getEntriesByName(id)[0];
    const duration = measure.duration;
    
    const label = id.split('_')[0];
    if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }
    this.measurements.get(label)!.push(duration);
    
    return duration;
  }
  
  static getAverageTime(label: string): number {
    const times = this.measurements.get(label) || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }
  
  static report(): Record<string, { average: number; count: number }> {
    const report: Record<string, { average: number; count: number }> = {};
    
    this.measurements.forEach((times, label) => {
      report[label] = {
        average: times.reduce((a, b) => a + b, 0) / times.length,
        count: times.length
      };
    });
    
    return report;
  }
}

// Export all utilities are already exported above