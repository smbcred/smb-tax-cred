/**
 * ProgressTracker Component
 * 
 * Comprehensive progress tracking for intake form completion with:
 * - Visual progress bar with animated completion
 * - Section completion indicators with status badges
 * - Time estimates based on completion rates
 * - Next action prompts with clear CTAs
 * - Percentage complete calculation
 * - Save indicator for form progress
 * 
 * @dependencies React, UI Components, Progress utilities
 * @knowledgeBase Progress tracking for intake form completion workflow
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProgressSection {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  estimatedMinutes: number;
  completedFields: number;
  totalFields: number;
  icon: string;
}

interface ProgressTrackerProps {
  sections: ProgressSection[];
  overallProgress: number;
  currentSection?: string;
  isSaving?: boolean;
  lastSavedAt?: Date;
  onSectionClick?: (sectionId: string) => void;
  onContinue?: () => void;
}

export default function ProgressTracker({
  sections,
  overallProgress,
  currentSection,
  isSaving = false,
  lastSavedAt,
  onSectionClick,
  onContinue
}: ProgressTrackerProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(overallProgress);
    }, 300);
    return () => clearTimeout(timer);
  }, [overallProgress]);

  // Calculate completion statistics
  const completedSections = sections.filter(s => s.status === 'completed').length;
  const inProgressSections = sections.filter(s => s.status === 'in_progress').length;
  const totalFields = sections.reduce((sum, s) => sum + s.totalFields, 0);
  const completedFields = sections.reduce((sum, s) => sum + s.completedFields, 0);

  // Calculate time estimates
  const remainingMinutes = sections
    .filter(s => s.status !== 'completed')
    .reduce((sum, s) => {
      const sectionProgress = s.totalFields > 0 ? s.completedFields / s.totalFields : 0;
      return sum + (s.estimatedMinutes * (1 - sectionProgress));
    }, 0);

  const getStatusBadge = (status: ProgressSection['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-rd-secondary-500 text-white">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-rd-primary-500 text-white">In Progress</Badge>;
      case 'not_started':
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const getSectionProgress = (section: ProgressSection) => {
    if (section.totalFields === 0) return 0;
    return (section.completedFields / section.totalFields) * 100;
  };

  const formatTimeEstimate = (minutes: number) => {
    if (minutes < 1) return "< 1 min";
    if (minutes < 60) return `${Math.ceil(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = Math.ceil(minutes % 60);
    if (remainingMins === 0) return `${hours} hr`;
    return `${hours}h ${remainingMins}m`;
  };

  const currentSectionData = sections.find(s => s.id === currentSection);
  const nextSection = sections.find(s => s.status === 'not_started');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <i className="fas fa-chart-line text-rd-primary-500 mr-2"></i>
            Intake Form Progress
          </div>
          <div className="flex items-center space-x-2">
            {/* Save Indicator */}
            {isSaving ? (
              <div className="flex items-center text-rd-primary-600">
                <div className="animate-spin mr-2">
                  <i className="fas fa-spinner"></i>
                </div>
                <span className="text-sm">Saving...</span>
              </div>
            ) : lastSavedAt ? (
              <div className="flex items-center text-rd-secondary-600">
                <i className="fas fa-check-circle mr-2"></i>
                <span className="text-sm">
                  Saved {lastSavedAt.toLocaleTimeString()}
                </span>
              </div>
            ) : null}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Overall Progress
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {Math.round(animatedProgress)}% Complete
            </span>
          </div>
          <Progress value={animatedProgress} className="h-3" />
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{completedFields} of {totalFields} fields completed</span>
            <span>
              {completedSections} of {sections.length} sections done
            </span>
          </div>
        </div>

        {/* Time Estimate */}
        {remainingMinutes > 0 && (
          <div className="bg-rd-primary-50 dark:bg-rd-primary-950 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-clock text-rd-primary-500 mr-2"></i>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  Time Remaining
                </span>
              </div>
              <span className="text-lg font-bold text-rd-primary-600">
                {formatTimeEstimate(remainingMinutes)}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Estimated time to complete all remaining sections
            </p>
          </div>
        )}

        {/* Section Progress */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Section Progress
          </h3>
          <div className="space-y-3">
            {sections.map((section, index) => {
              const sectionProgress = getSectionProgress(section);
              const isActive = section.id === currentSection;
              
              return (
                <div
                  key={section.id}
                  className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-sm ${
                    isActive 
                      ? 'border-rd-primary-500 bg-rd-primary-50 dark:bg-rd-primary-950' 
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                  onClick={() => onSectionClick?.(section.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        section.status === 'completed'
                          ? 'bg-rd-secondary-500 text-white'
                          : section.status === 'in_progress'
                          ? 'bg-rd-primary-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {section.status === 'completed' ? (
                          <i className="fas fa-check text-xs"></i>
                        ) : (
                          <i className={`${section.icon} text-xs`}></i>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          {section.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(section.status)}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTimeEstimate(section.estimatedMinutes)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Section Progress Bar */}
                  {section.status !== 'not_started' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>
                          {section.completedFields} of {section.totalFields} fields
                        </span>
                        <span>{Math.round(sectionProgress)}%</span>
                      </div>
                      <Progress value={sectionProgress} className="h-2" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Action Prompts */}
        {(currentSectionData || nextSection) && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Next Actions
            </h3>
            
            {currentSectionData && currentSectionData.status === 'in_progress' && (
              <div className="bg-rd-primary-50 dark:bg-rd-primary-950 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      Continue with {currentSectionData.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {currentSectionData.completedFields} of {currentSectionData.totalFields} fields completed
                    </p>
                  </div>
                  <Button 
                    onClick={onContinue}
                    className="bg-rd-primary-500 hover:bg-rd-primary-600"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {nextSection && (!currentSectionData || currentSectionData.status === 'completed') && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      Start {nextSection.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Estimated time: {formatTimeEstimate(nextSection.estimatedMinutes)}
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => onSectionClick?.(nextSection.id)}
                  >
                    Start Section
                  </Button>
                </div>
              </div>
            )}

            {overallProgress === 100 && (
              <div className="bg-rd-secondary-50 dark:bg-rd-secondary-950 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      Form Complete!
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      All sections have been completed. You can now submit your intake form.
                    </p>
                  </div>
                  <Button className="bg-rd-secondary-500 hover:bg-rd-secondary-600">
                    Submit Form
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}