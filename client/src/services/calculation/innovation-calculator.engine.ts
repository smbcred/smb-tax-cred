/**
 * @file innovation-calculator.engine.ts
 * @description Innovation and experimentation tax credit calculation engine
 * @author SMBTaxCredits.com Team
 * @date 2024-01-15
 * @knowledgeBase Updated R&D Knowledge Base, Market Positioning Brief
 * 
 * PURPOSE: Calculate federal tax credits for business innovation and experimentation
 * TARGET: Sophisticated business owners investing in technology-enabled innovation
 * 
 * CORE PRINCIPLES:
 * - Professional tone without condescension
 * - Broad innovation focus (not just AI)
 * - Federal credits simplified to 10-14%
 * - Clear value proposition
 * 
 * QUALIFYING ACTIVITIES:
 * - Custom solution development
 * - Process automation and optimization
 * - System integration engineering
 * - Digital transformation initiatives
 * - Experimental implementations
 * 
 * CALCULATION METHODOLOGY:
 * - Personnel time valued at market rates
 * - Full recognition of contractor expertise
 * - Technology investments (experimentation portion)
 * - Infrastructure supporting innovation
 */

import { 
  InnovationInput, 
  InnovationResult, 
  ExpenseBreakdown,
  ValidationResult,
  InnovationActivity
} from '@/types/innovation-calculation.types';

export class InnovationCalculatorEngine {
  // Federal credit rates based on innovation intensity
  private static readonly BASE_CREDIT_RATE = 0.10;
  private static readonly STANDARD_CREDIT_RATE = 0.12;
  private static readonly ENHANCED_CREDIT_RATE = 0.14;
  
  // Professional hourly valuations
  private static readonly HOURLY_VALUATIONS = {
    principal: { min: 125, max: 250, default: 175 },
    senior: { min: 100, max: 200, default: 150 },
    professional: { min: 75, max: 150, default: 100 },
    support: { min: 50, max: 100, default: 75 }
  };
  
  /**
   * Main calculation entry point for innovation credits
   * @param input Business innovation and experimentation data
   * @returns Comprehensive calculation results with professional insights
   */
  public static calculate(input: InnovationInput): InnovationResult {
    // Validate with constructive feedback
    const validation = this.validateInputs(input);
    if (!validation.isValid) {
      throw new Error(validation.errors[0]);
    }

    // Calculate innovation expenses by category
    const expenseBreakdown = this.calculateInnovationExpenses(input);
    
    // Determine appropriate credit rate
    const creditRate = this.determineCreditRate(input);
    
    // Calculate federal credit
    const federalCredit = Math.round(expenseBreakdown.total * creditRate);
    
    // Determine service tier and ROI
    const serviceFee = this.determineServiceTier(federalCredit);
    const roi = Math.round(federalCredit / serviceFee);
    
    return {
      expenseBreakdown,
      federalCredit,
      creditRate,
      serviceFee,
      roi,
      insights: this.generateInsights(input, federalCredit),
      qualifyingActivities: this.analyzeActivities(input),
      recommendations: this.generateRecommendations(input, expenseBreakdown),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate innovation expenses across all categories
   * Recognizes various forms of business innovation
   */
  private static calculateInnovationExpenses(input: InnovationInput): ExpenseBreakdown {
    // Personnel investment in innovation
    const personnelInvestment = this.calculatePersonnelInvestment(input);
    
    // External expertise and contractors
    const externalExpertise = this.calculateExternalExpertise(input);
    
    // Technology and tool investments
    const technologyInvestment = this.calculateTechnologyInvestment(input);
    
    // Infrastructure and systems
    const infrastructureCosts = this.calculateInfrastructureCosts(input);
    
    const total = personnelInvestment + externalExpertise + 
                  technologyInvestment + infrastructureCosts;
    
    return {
      personnelTime: Math.round(personnelInvestment),
      externalExperts: Math.round(externalExpertise),
      technologyTools: Math.round(technologyInvestment),
      infrastructure: Math.round(infrastructureCosts),
      total: Math.round(total),
      distribution: {
        personnel: (personnelInvestment / total) * 100,
        external: (externalExpertise / total) * 100,
        technology: (technologyInvestment / total) * 100,
        infrastructure: (infrastructureCosts / total) * 100
      }
    };
  }

  /**
   * Calculate personnel investment in innovation
   * Values the time and expertise of team members
   */
  private static calculatePersonnelInvestment(input: InnovationInput): number {
    const {
      leadershipHours = 0,
      technicalHours = 0,
      supportHours = 0,
      teamSize = 1,
      averageCompensation,
      innovationPercentage = 100
    } = input;

    // Leadership/owner time on strategic innovation
    const leadershipRate = averageCompensation?.leadership || 
                          this.HOURLY_VALUATIONS.principal.default;
    const leadershipValue = leadershipHours * leadershipRate;
    
    // Technical team experimentation
    const technicalRate = averageCompensation?.technical || 
                         this.HOURLY_VALUATIONS.professional.default;
    const technicalValue = technicalHours * technicalRate;
    
    // Support staff contribution
    const supportRate = averageCompensation?.support || 
                       this.HOURLY_VALUATIONS.support.default;
    const supportValue = supportHours * supportRate;
    
    // Annual projection
    const weeklyValue = leadershipValue + technicalValue + supportValue;
    const annualValue = weeklyValue * 50; // 50 working weeks
    
    // Apply innovation percentage
    return annualValue * (innovationPercentage / 100);
  }

  /**
   * Calculate external expertise investments
   * Recognizes value of specialized contractors and consultants
   */
  private static calculateExternalExpertise(input: InnovationInput): number {
    const { 
      contractorInvestment = 0,
      specializedConsulting = 0,
      trainingInvestment = 0
    } = input;
    
    // Full value of external innovation expertise
    return contractorInvestment + specializedConsulting + trainingInvestment;
  }

  /**
   * Calculate technology tool investments
   * Includes modern tools and platforms for innovation
   */
  private static calculateTechnologyInvestment(input: InnovationInput): number {
    const { 
      softwareSubscriptions = 0,
      platformCosts = 0,
      apiIntegrations = 0,
      experimentationAllocation = 60 // Default 60% for experimentation
    } = input;
    
    // Calculate based on experimentation usage
    const totalToolCosts = softwareSubscriptions + platformCosts + apiIntegrations;
    return totalToolCosts * (experimentationAllocation / 100);
  }

  /**
   * Calculate infrastructure and system costs
   * Supporting technology for innovation
   */
  private static calculateInfrastructureCosts(input: InnovationInput): number {
    const { 
      cloudInfrastructure = 0,
      developmentEnvironments = 0,
      testingSystems = 0
    } = input;
    
    // Infrastructure supporting innovation
    return cloudInfrastructure + developmentEnvironments + testingSystems;
  }

  /**
   * Determine appropriate credit rate based on innovation profile
   * Rewards deeper innovation and experimentation
   */
  private static determineCreditRate(input: InnovationInput): number {
    const { activities = [], innovationDepth = 'moderate' } = input;
    
    // High-value innovation activities
    const substantialInnovation = [
      'custom-solution-development',
      'proprietary-tool-creation',
      'novel-integration-development',
      'breakthrough-process-design'
    ];
    
    const hasSubstantialInnovation = activities.some(
      activity => substantialInnovation.includes(activity)
    );
    
    // Determine rate based on innovation profile
    if (innovationDepth === 'extensive' || hasSubstantialInnovation) {
      return this.ENHANCED_CREDIT_RATE;
    } else if (innovationDepth === 'moderate') {
      return this.STANDARD_CREDIT_RATE;
    } else {
      return this.BASE_CREDIT_RATE;
    }
  }

  /**
   * Generate professional insights about the innovation profile
   * Provides context and value beyond just numbers
   */
  private static generateInsights(
    input: InnovationInput, 
    federalCredit: number
  ): string {
    const { businessType, activities = [] } = input;
    
    const activityDescriptions = this.describeActivities(activities);
    const businessContext = this.getBusinessContext(businessType);
    
    return `Your ${businessContext} innovation efforts, particularly in ` +
           `${activityDescriptions}, demonstrate qualifying experimentation ` +
           `that could generate approximately $${federalCredit.toLocaleString()} ` +
           `in federal tax credits. This represents tangible recognition of your ` +
           `investment in solving business challenges through technology.`;
  }

  /**
   * Analyze and categorize innovation activities
   * Provides detailed breakdown of qualifying work
   */
  private static analyzeActivities(
    input: InnovationInput
  ): Array<{ activity: string; description: string; impact: string }> {
    const { activities = [] } = input;
    
    const activityAnalysis: Record<InnovationActivity, { description: string; impact: string }> = {
      'automation-development': {
        description: 'Creating automated workflows and processes',
        impact: 'Efficiency gains through systematic innovation'
      },
      'custom-solution-development': {
        description: 'Building tailored solutions for specific challenges',
        impact: 'Competitive advantage through proprietary tools'
      },
      'integration-engineering': {
        description: 'Connecting disparate systems in novel ways',
        impact: 'Operational excellence through unified platforms'
      },
      'process-optimization': {
        description: 'Reimagining workflows with technology',
        impact: 'Measurable improvements in business metrics'
      },
      'experimental-implementation': {
        description: 'Testing new approaches and methodologies',
        impact: 'Learning and iteration driving innovation'
      },
      'digital-transformation': {
        description: 'Modernizing operations with current tools',
        impact: 'Future-proofing business capabilities'
      },
      'proprietary-tool-creation': {
        description: 'Developing custom tools for unique needs',
        impact: 'Creating intellectual property and competitive moat'
      },
      'novel-integration-development': {
        description: 'Building innovative connections between systems',
        impact: 'Unlocking new capabilities through integration'
      },
      'breakthrough-process-design': {
        description: 'Fundamentally reimagining business processes',
        impact: 'Revolutionary improvements in operations'
      }
    };
    
    return activities.map((activity: InnovationActivity) => ({
      activity: activityAnalysis[activity]?.description || activity,
      description: this.getDetailedDescription(activity),
      impact: activityAnalysis[activity]?.impact || 'Business innovation'
    }));
  }

  /**
   * Generate actionable recommendations
   * Helps businesses maximize their credit potential
   */
  private static generateRecommendations(
    input: InnovationInput,
    expenses: ExpenseBreakdown
  ): string[] {
    const recommendations: string[] = [];
    
    // Time tracking recommendation
    if (expenses.distribution.personnel < 40) {
      recommendations.push(
        'Consider tracking innovation time more comprehensively - ' +
        'many businesses underestimate their experimentation hours'
      );
    }
    
    // Documentation recommendation
    if (!input.hasDocumentation) {
      recommendations.push(
        'Start documenting your experimentation process - ' +
        'project notes and iteration history strengthen your position'
      );
    }
    
    // Multi-year opportunity
    if (!input.priorYearConsideration) {
      recommendations.push(
        'Review prior years - innovation from 2022-2024 may also qualify'
      );
    }
    
    // Activity expansion
    if (input.activities && input.activities.length < 3) {
      recommendations.push(
        'Explore other innovation areas in your business - ' +
        'most companies have more qualifying activities than they realize'
      );
    }
    
    return recommendations;
  }

  /**
   * Professional validation with constructive guidance
   * Helps users provide complete information
   */
  private static validateInputs(input: InnovationInput): ValidationResult {
    const errors: string[] = [];

    // Ensure some innovation activity
    const totalHours = (input.leadershipHours || 0) + 
                      (input.technicalHours || 0) + 
                      (input.supportHours || 0);
    
    if (totalHours === 0 && !input.contractorInvestment) {
      errors.push(
        'Please indicate time invested in innovation or external expertise engaged'
      );
    }

    // Validate reasonable time commitments
    if (input.leadershipHours && input.leadershipHours > 60) {
      errors.push(
        'Leadership hours seem high - please verify weekly time commitment'
      );
    }

    // Ensure activities are selected
    if (!input.activities || input.activities.length === 0) {
      errors.push(
        'Please select the innovation activities your business has undertaken'
      );
    }

    // Check percentage allocations
    const allocations = [
      input.innovationPercentage,
      input.experimentationAllocation
    ].filter(a => a !== undefined);
    
    for (const allocation of allocations) {
      if (allocation && (allocation < 0 || allocation > 100)) {
        errors.push('Percentage allocations must be between 0 and 100');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Determine service tier based on credit amount
   * Transparent, value-based pricing
   */
  private static determineServiceTier(creditAmount: number): number {
    if (creditAmount < 10000) return 500;
    if (creditAmount < 50000) return 750;
    if (creditAmount < 100000) return 1000;
    return 1500;
  }

  /**
   * Convert activities to natural language
   */
  private static describeActivities(activities: string[]): string {
    if (activities.length === 0) return 'innovation initiatives';
    
    const descriptions = activities.slice(0, 2).map(activity => {
      const mappings: Record<string, string> = {
        'automation-development': 'automation development',
        'custom-solution-development': 'custom solutions',
        'integration-engineering': 'system integration',
        'process-optimization': 'process optimization',
        'digital-transformation': 'digital transformation',
        'proprietary-tool-creation': 'proprietary tools',
        'novel-integration-development': 'novel integrations',
        'breakthrough-process-design': 'breakthrough processes',
        'experimental-implementation': 'experimental implementations'
      };
      return mappings[activity] || activity;
    });
    
    if (activities.length > 2) {
      return descriptions.join(', ') + ', and other innovations';
    }
    return descriptions.join(' and ');
  }

  /**
   * Provide context based on business type
   */
  private static getBusinessContext(businessType?: string): string {
    if (!businessType) return 'business';
    
    const contexts: Record<string, string> = {
      'professional-services': 'client-focused',
      'ecommerce-retail': 'customer experience',
      'healthcare-wellness': 'patient care',
      'hospitality-restaurant': 'operational',
      'creative-agency': 'creative and strategic',
      'technology-services': 'technical',
      'manufacturing-logistics': 'operational efficiency'
    };
    
    return contexts[businessType] || 'business';
  }

  /**
   * Get detailed descriptions for activities
   */
  private static getDetailedDescription(activity: InnovationActivity): string {
    const descriptions: Record<InnovationActivity, string> = {
      'automation-development': 'Developing automated systems to streamline operations',
      'custom-solution-development': 'Building bespoke solutions tailored to specific business needs',
      'integration-engineering': 'Creating sophisticated connections between disparate systems',
      'process-optimization': 'Systematically improving business processes through technology',
      'experimental-implementation': 'Testing and iterating on innovative approaches',
      'digital-transformation': 'Modernizing business operations with digital tools',
      'proprietary-tool-creation': 'Developing unique tools that provide competitive advantage',
      'novel-integration-development': 'Building unprecedented system integrations',
      'breakthrough-process-design': 'Creating revolutionary new approaches to business challenges'
    };
    
    return descriptions[activity] || 'Innovation in business operations';
  }
}