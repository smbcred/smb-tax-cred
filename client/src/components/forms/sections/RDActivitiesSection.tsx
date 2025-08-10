import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Lightbulb, Calendar, Target, Beaker, Cog } from 'lucide-react';
import { projectTemplates, aiToolOptions, rdMethodologyExamples, generateProjectId } from '@/data/rd-project-templates';
import { rdActivitiesSchema, rdProjectSchema } from '@shared/schema';

interface RDActivitiesSectionProps {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function RDActivitiesSection({ 
  data = {}, 
  onDataChange, 
  onValidationChange 
}: RDActivitiesSectionProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    onDataChange(newData);
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProjectChange = (projectIndex: number, field: string, value: any) => {
    const projects = [...(data.projects || [])];
    projects[projectIndex] = { ...projects[projectIndex], [field]: value };
    handleInputChange('projects', projects);
  };

  const addNewProject = () => {
    const newProject = {
      id: generateProjectId(),
      projectName: '',
      projectDescription: '',
      technicalChallenges: '',
      startDate: '',
      endDate: '',
      successCriteria: '',
      businessPurpose: '',
      technicalUncertainty: '',
      processOfExperimentation: '',
      technologicalNature: '',
    };
    
    const projects = [...(data.projects || []), newProject];
    handleInputChange('projects', projects);
    setExpandedProject(newProject.id);
  };

  const removeProject = (projectIndex: number) => {
    const projects = [...(data.projects || [])];
    const removedProject = projects.splice(projectIndex, 1)[0];
    handleInputChange('projects', projects);
    
    if (expandedProject === removedProject?.id) {
      setExpandedProject(null);
    }
  };

  const applyTemplate = (projectIndex: number, templateName: string) => {
    const template = projectTemplates.find(t => t.name === templateName);
    if (template) {
      const projects = [...(data.projects || [])];
      projects[projectIndex] = {
        ...projects[projectIndex],
        projectName: template.name,
        projectDescription: template.description,
        technicalChallenges: template.technicalChallenges,
        businessPurpose: template.businessPurpose,
        technicalUncertainty: template.technicalUncertainty,
        processOfExperimentation: template.processOfExperimentation,
        technologicalNature: template.technologicalNature,
        successCriteria: template.successCriteria,
      };
      handleInputChange('projects', projects);
    }
  };

  const handleAIToolChange = (toolValue: string, checked: boolean) => {
    const currentTools = data.aiToolsUsed || [];
    const newTools = checked 
      ? [...currentTools, toolValue]
      : currentTools.filter((tool: string) => tool !== toolValue);
    handleInputChange('aiToolsUsed', newTools);
  };

  // Validate section
  useEffect(() => {
    try {
      rdActivitiesSchema.parse(data);
      setValidationErrors({});
      onValidationChange(true);
    } catch (error: any) {
      const errors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
      }
      setValidationErrors(errors);
      onValidationChange(false);
    }
  }, [data, onValidationChange]);

  const currentYear = new Date().getFullYear();
  const projects = data.projects || [];

  return (
    <div className="space-y-6">
      {/* Overall R&D Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Overall R&D Objectives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="overallObjectives">
              Describe your company's overall R&D objectives and goals *
            </Label>
            <Textarea
              id="overallObjectives"
              value={data.overallObjectives || ''}
              onChange={(e) => handleInputChange('overallObjectives', e.target.value)}
              placeholder="Explain your company's strategic R&D goals, innovation priorities, and how these projects align with your business objectives..."
              rows={4}
              className={validationErrors['overallObjectives'] ? 'border-red-500' : ''}
              required
            />
            {validationErrors['overallObjectives'] && (
              <p className="text-sm text-red-600">{validationErrors['overallObjectives']}</p>
            )}
            <p className="text-xs text-slate-500">
              Minimum 50 characters required. Describe your innovation strategy and business alignment.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rdMethodology">R&D Methodology *</Label>
            <Select
              value={data.rdMethodology || ''}
              onValueChange={(value) => handleInputChange('rdMethodology', value)}
            >
              <SelectTrigger className={validationErrors['rdMethodology'] ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your R&D methodology" />
              </SelectTrigger>
              <SelectContent>
                {rdMethodologyExamples.map((methodology, index) => (
                  <SelectItem key={index} value={methodology}>
                    {methodology}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors['rdMethodology'] && (
              <p className="text-sm text-red-600">{validationErrors['rdMethodology']}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Tools Used */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Cog className="w-5 h-5 mr-2 text-blue-600" />
            AI Tools & Technologies
          </CardTitle>
          <p className="text-sm text-slate-600">
            Select the AI tools and technologies your company uses for R&D activities
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {aiToolOptions.map((tool) => (
              <div key={tool.value} className="flex items-start space-x-2">
                <Checkbox
                  id={tool.value}
                  checked={data.aiToolsUsed?.includes(tool.value) || false}
                  onCheckedChange={(checked) => handleAIToolChange(tool.value, checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor={tool.value} className="text-sm font-medium">
                    {tool.label}
                  </Label>
                  <p className="text-xs text-slate-500">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* R&D Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center">
              <Beaker className="w-5 h-5 mr-2 text-blue-600" />
              R&D Projects
            </div>
            <Button onClick={addNewProject} size="sm" className="flex items-center">
              <Plus className="w-4 h-4 mr-1" />
              Add Project
            </Button>
          </CardTitle>
          <p className="text-sm text-slate-600">
            Document each R&D project with technical details and four-part test alignment
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationErrors['projects'] && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{validationErrors['projects']}</p>
            </div>
          )}

          {projects.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
              <Lightbulb className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <p className="text-slate-600 mb-2">No R&D projects added yet</p>
              <p className="text-sm text-slate-500 mb-4">
                Add your first R&D project to document your innovation activities
              </p>
              <Button onClick={addNewProject} variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Your First Project
              </Button>
            </div>
          )}

          {projects.map((project: any, index: number) => (
            <Card key={project.id || index} className="border border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Project {index + 1}</Badge>
                    {project.projectName && (
                      <span className="font-medium text-slate-900">{project.projectName}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedProject(
                        expandedProject === project.id ? null : project.id
                      )}
                    >
                      {expandedProject === project.id ? 'Collapse' : 'Expand'}
                    </Button>
                    {projects.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProject(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedProject === project.id && (
                <CardContent className="space-y-6">
                  {/* Template Selection */}
                  <div className="space-y-2">
                    <Label>Use Project Template (Optional)</Label>
                    <Select onValueChange={(value) => applyTemplate(index, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template to get started" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTemplates.map((template) => (
                          <SelectItem key={template.name} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      Templates provide example content you can customize for your project
                    </p>
                  </div>

                  <Separator />

                  {/* Basic Project Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Basic Project Information</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`projectName-${index}`}>Project Name *</Label>
                      <Input
                        id={`projectName-${index}`}
                        value={project.projectName || ''}
                        onChange={(e) => handleProjectChange(index, 'projectName', e.target.value)}
                        placeholder="Enter a descriptive project name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`projectDescription-${index}`}>Project Description *</Label>
                      <Textarea
                        id={`projectDescription-${index}`}
                        value={project.projectDescription || ''}
                        onChange={(e) => handleProjectChange(index, 'projectDescription', e.target.value)}
                        placeholder="Provide a detailed description of what this project aims to accomplish..."
                        rows={3}
                        required
                      />
                      <p className="text-xs text-slate-500">Minimum 50 characters required</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`startDate-${index}`}>Start Date *</Label>
                        <Input
                          id={`startDate-${index}`}
                          type="date"
                          value={project.startDate || ''}
                          onChange={(e) => handleProjectChange(index, 'startDate', e.target.value)}
                          max={`${currentYear}-12-31`}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`endDate-${index}`}>End Date *</Label>
                        <Input
                          id={`endDate-${index}`}
                          type="date"
                          value={project.endDate || ''}
                          onChange={(e) => handleProjectChange(index, 'endDate', e.target.value)}
                          min={project.startDate}
                          max={`${currentYear}-12-31`}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Four-Part Test Alignment */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-slate-900">Four-Part Test Alignment</h4>
                      <Badge variant="secondary">Required for R&D Credit</Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Each project must demonstrate these four elements to qualify for R&D tax credits
                    </p>

                    <div className="space-y-2">
                      <Label htmlFor={`businessPurpose-${index}`}>
                        1. Business Purpose *
                      </Label>
                      <Textarea
                        id={`businessPurpose-${index}`}
                        value={project.businessPurpose || ''}
                        onChange={(e) => handleProjectChange(index, 'businessPurpose', e.target.value)}
                        placeholder="Explain how this project serves a business purpose and creates new functionality, performance, reliability, or quality..."
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`technicalUncertainty-${index}`}>
                        2. Technical Uncertainty *
                      </Label>
                      <Textarea
                        id={`technicalUncertainty-${index}`}
                        value={project.technicalUncertainty || ''}
                        onChange={(e) => handleProjectChange(index, 'technicalUncertainty', e.target.value)}
                        placeholder="Describe the technical uncertainties and challenges that existed at the start of this project..."
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`processOfExperimentation-${index}`}>
                        3. Process of Experimentation *
                      </Label>
                      <Textarea
                        id={`processOfExperimentation-${index}`}
                        value={project.processOfExperimentation || ''}
                        onChange={(e) => handleProjectChange(index, 'processOfExperimentation', e.target.value)}
                        placeholder="Detail your systematic approach to experimentation, testing, and evaluation methods..."
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`technologicalNature-${index}`}>
                        4. Technological in Nature *
                      </Label>
                      <Textarea
                        id={`technologicalNature-${index}`}
                        value={project.technologicalNature || ''}
                        onChange={(e) => handleProjectChange(index, 'technologicalNature', e.target.value)}
                        placeholder="Explain how this project relies on principles of engineering, computer science, or physical/biological sciences..."
                        rows={2}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Project Details */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Additional Project Details</h4>

                    <div className="space-y-2">
                      <Label htmlFor={`technicalChallenges-${index}`}>Technical Challenges *</Label>
                      <Textarea
                        id={`technicalChallenges-${index}`}
                        value={project.technicalChallenges || ''}
                        onChange={(e) => handleProjectChange(index, 'technicalChallenges', e.target.value)}
                        placeholder="Describe the specific technical challenges and obstacles encountered during this project..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`successCriteria-${index}`}>Success Criteria *</Label>
                      <Textarea
                        id={`successCriteria-${index}`}
                        value={project.successCriteria || ''}
                        onChange={(e) => handleProjectChange(index, 'successCriteria', e.target.value)}
                        placeholder="Define the measurable criteria used to determine project success..."
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}