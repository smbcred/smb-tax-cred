import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTouch, useSwipe, useTap } from "@/hooks/useTouch";
import { useViewport, useDeviceType, useSafeAreaInsets } from "@/hooks/useViewport";
import { hapticFeedback, announceToScreenReader, isMobileDevice } from "@/utils/mobileOptimizations";

export default function MobileDemo() {
  const viewport = useViewport();
  const deviceType = useDeviceType();
  const safeArea = useSafeAreaInsets();
  
  const [swipeCount, setSwipeCount] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [gestureLog, setGestureLog] = useState<string[]>([]);
  
  const swipeAreaRef = useRef<HTMLDivElement>(null);
  const tapAreaRef = useRef<HTMLDivElement>(null);
  const touchAreaRef = useRef<HTMLDivElement>(null);
  
  // Touch gesture handling
  const { gestureHistory } = useTouch(
    touchAreaRef,
    (gesture) => {
      const logEntry = `${gesture.type} ${gesture.direction || ''} at (${Math.round(gesture.clientX)}, ${Math.round(gesture.clientY)})`;
      setGestureLog(prev => [...prev.slice(-4), logEntry]);
      hapticFeedback('light');
    },
    { threshold: 30 }
  );

  // Swipe handling
  useSwipe(
    swipeAreaRef,
    (direction) => {
      setSwipeCount(prev => prev + 1);
      announceToScreenReader(`Swiped ${direction}`);
      hapticFeedback('medium');
    },
    50
  );

  // Tap handling with double-tap support
  useTap(
    tapAreaRef,
    () => {
      setTapCount(prev => prev + 1);
      hapticFeedback('light');
    },
    () => {
      announceToScreenReader('Double tap detected');
      hapticFeedback('heavy');
    }
  );

  return (
    <div className="container mx-auto py-8 space-y-8" style={{ paddingTop: `calc(2rem + ${safeArea.top}px)` }}>
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold mobile-heading">Mobile Optimization Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mobile-text">
          Experience touch-friendly interactions, responsive design, and mobile-optimized UI components.
        </p>
      </div>

      {/* Device Info */}
      <Card className="mobile-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Device Information
            <Badge variant={isMobileDevice() ? "default" : "secondary"}>
              {deviceType.deviceType}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="mobile-spacing">
          <div className="grid grid-cols-2 gap-4 mobile-stack">
            <div>
              <Label className="text-sm font-medium">Viewport</Label>
              <p className="mobile-text">{viewport.width} × {viewport.height}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Orientation</Label>
              <p className="mobile-text">{viewport.orientation}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Touch Support</Label>
              <p className="mobile-text">{viewport.isTouch ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Hover Support</Label>
              <p className="mobile-text">{viewport.hasHover ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Device Pixel Ratio</Label>
              <p className="mobile-text">{viewport.devicePixelRatio}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Reduced Motion</Label>
              <p className="mobile-text">{viewport.prefersReducedMotion ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          {(safeArea.top > 0 || safeArea.bottom > 0) && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Safe Area Insets</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <span>Top: {safeArea.top}px</span>
                <span>Bottom: {safeArea.bottom}px</span>
                <span>Left: {safeArea.left}px</span>
                <span>Right: {safeArea.right}px</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="gestures" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mobile-nav">
          <TabsTrigger value="gestures" className="touch-target">Gestures</TabsTrigger>
          <TabsTrigger value="forms" className="touch-target">Forms</TabsTrigger>
          <TabsTrigger value="responsive" className="touch-target">Responsive</TabsTrigger>
          <TabsTrigger value="performance" className="touch-target">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="gestures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Touch Gestures</CardTitle>
              <CardDescription>
                Test swipe, tap, and multi-touch gestures with haptic feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Swipe Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Swipe Area</Label>
                  <Badge>Swipes: {swipeCount}</Badge>
                </div>
                <div
                  ref={swipeAreaRef}
                  className="h-32 border-2 border-dashed border-primary rounded-lg flex items-center justify-center text-muted-foreground cursor-pointer touch-manipulation mobile-full"
                >
                  Swipe in any direction
                </div>
              </div>

              {/* Tap Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Tap Area (supports double-tap)</Label>
                  <Badge>Taps: {tapCount}</Badge>
                </div>
                <div
                  ref={tapAreaRef}
                  className="h-32 border-2 border-dashed border-green-500 rounded-lg flex items-center justify-center text-muted-foreground cursor-pointer touch-manipulation mobile-full"
                >
                  Tap or double-tap here
                </div>
              </div>

              {/* Advanced Touch Area */}
              <div className="space-y-4">
                <Label>All Gestures Area</Label>
                <div
                  ref={touchAreaRef}
                  className="h-40 border-2 border-dashed border-orange-500 rounded-lg flex items-center justify-center text-muted-foreground cursor-pointer touch-manipulation mobile-full"
                >
                  Try pinch, long press, swipe, tap
                </div>
                {gestureLog.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">Recent Gestures:</Label>
                    <div className="text-sm space-y-1 mt-2">
                      {gestureLog.map((log, index) => (
                        <div key={index} className="text-muted-foreground">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mobile-Optimized Forms</CardTitle>
              <CardDescription>
                Forms with proper input types, touch targets, and mobile keyboards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mobile-form space-y-6">
                <div className="form-group">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="mobile-full"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="mobile-full"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="mobile-full"
                    inputMode="numeric"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    className="mobile-full"
                    autoComplete="url"
                    inputMode="url"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    type="search"
                    placeholder="Search..."
                    className="mobile-full"
                    inputMode="search"
                  />
                </div>

                <Button className="touch-target mobile-full" size="lg">
                  Submit Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responsive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Responsive Components</CardTitle>
              <CardDescription>
                Components that adapt to different screen sizes and orientations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Responsive Grid */}
                <div>
                  <Label className="text-lg font-semibold">Responsive Grid</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 tablet-grid">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="p-4 border rounded-lg text-center">
                        Item {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Navigation */}
                <div>
                  <Label className="text-lg font-semibold">Mobile Navigation</Label>
                  <div className="mt-4 p-4 border rounded-lg">
                    <div className="mobile-nav flex justify-between items-center">
                      <Button variant="ghost" size="sm" className="touch-target">
                        ☰ Menu
                      </Button>
                      <h3 className="font-semibold">Page Title</h3>
                      <Button variant="ghost" size="sm" className="touch-target">
                        ⋮ More
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Touch-Friendly Buttons */}
                <div>
                  <Label className="text-lg font-semibold">Touch-Friendly Buttons</Label>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <Button className="touch-target" size="lg">
                      Primary Action
                    </Button>
                    <Button variant="outline" className="touch-target" size="lg">
                      Secondary
                    </Button>
                    <Button variant="ghost" className="touch-target" size="lg">
                      Tertiary
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Features</CardTitle>
              <CardDescription>
                Mobile performance optimizations and accessibility features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-lg font-semibold">Gesture History</Label>
                    <div className="mt-2 p-3 bg-muted rounded-lg min-h-[100px]">
                      {gestureHistory.length > 0 ? (
                        <div className="space-y-1 text-sm">
                          {gestureHistory.slice(-5).map((gesture, index) => (
                            <div key={index} className="text-muted-foreground">
                              {gesture.type} {gesture.direction && `(${gesture.direction})`}
                              {gesture.duration && ` - ${gesture.duration}ms`}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No gestures recorded yet</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold">Performance Metrics</Label>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Touch Events:</span>
                        <span>{gestureHistory.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Viewport Updates:</span>
                        <span>Auto-detected</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GPU Acceleration:</span>
                        <span>Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Smooth Scrolling:</span>
                        <span>Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold">Accessibility Features</Label>
                  <div className="mt-4 space-y-2">
                    <Button
                      className="touch-target mobile-full"
                      onClick={() => announceToScreenReader('Screen reader announcement test')}
                    >
                      Test Screen Reader Announcement
                    </Button>
                    
                    <Button
                      className="touch-target mobile-full"
                      variant="outline"
                      onClick={() => hapticFeedback('heavy')}
                    >
                      Test Haptic Feedback
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}