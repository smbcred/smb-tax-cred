/**
 * @file business-examples.service.ts
 * @description Real-world examples of business innovation
 * PURPOSE: Help businesses recognize their qualifying activities
 */

import { BusinessType, InnovationActivity, IndustryPreset, InnovationInput } from '@/types/innovation-calculation.types';

export class BusinessExamplesService {
  private static readonly INDUSTRY_PROFILES: Record<BusinessType, IndustryPreset> = {
    'professional-services': {
      businessType: 'professional-services',
      typicalProfile: 'Firms innovating through custom methodologies and automation',
      commonActivities: [
        'custom-solution-development',
        'automation-development',
        'process-optimization'
      ],
      averageCreditRange: '$15,000-50,000',
      exampleProjects: [
        'Proprietary analysis frameworks for client engagements',
        'Automated reporting systems reducing delivery time by 70%',
        'Custom integration platforms for multi-source data'
      ]
    },
    'ecommerce-retail': {
      businessType: 'ecommerce-retail',
      typicalProfile: 'Retailers creating personalized customer experiences',
      commonActivities: [
        'integration-engineering',
        'automation-development',
        'experimental-implementation'
      ],
      averageCreditRange: '$10,000-40,000',
      exampleProjects: [
        'Dynamic recommendation engines using behavioral data',
        'Automated inventory optimization systems',
        'Omnichannel integration platforms'
      ]
    },
    'healthcare-wellness': {
      businessType: 'healthcare-wellness',
      typicalProfile: 'Healthcare providers modernizing patient care',
      commonActivities: [
        'digital-transformation',
        'process-optimization',
        'integration-engineering'
      ],
      averageCreditRange: '$20,000-60,000',
      exampleProjects: [
        'Patient communication automation systems',
        'Integrated scheduling and resource optimization',
        'Telehealth platform customization'
      ]
    },
    'creative-agency': {
      businessType: 'creative-agency',
      typicalProfile: 'Agencies building proprietary creative tools',
      commonActivities: [
        'proprietary-tool-creation',
        'automation-development',
        'custom-solution-development'
      ],
      averageCreditRange: '$12,000-45,000',
      exampleProjects: [
        'Campaign automation platforms for multi-channel delivery',
        'Custom content generation workflows',
        'Client-specific performance analytics systems'
      ]
    },
    'hospitality-restaurant': {
      businessType: 'hospitality-restaurant',
      typicalProfile: 'Hospitality businesses enhancing guest experiences',
      commonActivities: [
        'process-optimization',
        'digital-transformation',
        'integration-engineering'
      ],
      averageCreditRange: '$8,000-35,000',
      exampleProjects: [
        'Dynamic pricing and revenue management systems',
        'Guest experience personalization platforms',
        'Integrated operations management systems'
      ]
    },
    'technology-services': {
      businessType: 'technology-services',
      typicalProfile: 'Tech companies pushing boundaries with innovation',
      commonActivities: [
        'breakthrough-process-design',
        'novel-integration-development',
        'proprietary-tool-creation'
      ],
      averageCreditRange: '$25,000-80,000',
      exampleProjects: [
        'Next-generation architecture implementations',
        'Custom development frameworks and methodologies',
        'Advanced automation and orchestration systems'
      ]
    },
    'manufacturing-logistics': {
      businessType: 'manufacturing-logistics',
      typicalProfile: 'Operations teams optimizing through technology',
      commonActivities: [
        'process-optimization',
        'integration-engineering',
        'breakthrough-process-design'
      ],
      averageCreditRange: '$25,000-80,000',
      exampleProjects: [
        'Predictive maintenance systems reducing downtime',
        'Supply chain optimization algorithms',
        'Quality control automation systems'
      ]
    }
  };

  /**
   * Get industry profile and examples
   */
  public static getIndustryProfile(businessType: BusinessType): IndustryPreset {
    return this.INDUSTRY_PROFILES[businessType] || this.INDUSTRY_PROFILES['professional-services'];
  }

  /**
   * Get sample calculation inputs for demonstrations
   */
  public static getSampleInputs(businessType: BusinessType): Partial<InnovationInput> {
    const samples: Record<BusinessType, Partial<InnovationInput>> = {
      'professional-services': {
        leadershipHours: 8,
        technicalHours: 20,
        supportHours: 5,
        contractorInvestment: 25000,
        softwareSubscriptions: 8000,
        activities: ['custom-solution-development', 'automation-development'],
        innovationDepth: 'moderate'
      },
      'ecommerce-retail': {
        leadershipHours: 10,
        technicalHours: 15,
        supportHours: 8,
        contractorInvestment: 20000,
        softwareSubscriptions: 12000,
        platformCosts: 6000,
        activities: ['integration-engineering', 'automation-development'],
        innovationDepth: 'moderate'
      },
      'healthcare-wellness': {
        leadershipHours: 12,
        technicalHours: 25,
        supportHours: 10,
        specializedConsulting: 30000,
        softwareSubscriptions: 15000,
        activities: ['digital-transformation', 'process-optimization'],
        innovationDepth: 'extensive'
      },
      'creative-agency': {
        leadershipHours: 10,
        technicalHours: 18,
        supportHours: 6,
        contractorInvestment: 18000,
        softwareSubscriptions: 10000,
        activities: ['proprietary-tool-creation', 'automation-development'],
        innovationDepth: 'moderate'
      },
      'hospitality-restaurant': {
        leadershipHours: 8,
        technicalHours: 12,
        supportHours: 8,
        contractorInvestment: 15000,
        softwareSubscriptions: 6000,
        activities: ['process-optimization', 'digital-transformation'],
        innovationDepth: 'basic'
      },
      'technology-services': {
        leadershipHours: 15,
        technicalHours: 30,
        supportHours: 10,
        contractorInvestment: 40000,
        softwareSubscriptions: 20000,
        cloudInfrastructure: 15000,
        activities: ['breakthrough-process-design', 'novel-integration-development'],
        innovationDepth: 'extensive'
      },
      'manufacturing-logistics': {
        leadershipHours: 12,
        technicalHours: 25,
        supportHours: 15,
        specializedConsulting: 35000,
        softwareSubscriptions: 12000,
        activities: ['process-optimization', 'integration-engineering'],
        innovationDepth: 'moderate'
      }
    };
    
    return samples[businessType] || samples['professional-services'];
  }

  /**
   * Get activity descriptions for display
   */
  public static getActivityDescriptions(): Record<InnovationActivity, { title: string; description: string }> {
    return {
      'automation-development': {
        title: 'Automation Development',
        description: 'Creating automated workflows to eliminate manual processes'
      },
      'custom-solution-development': {
        title: 'Custom Solutions',
        description: 'Building tailored tools for your specific business needs'
      },
      'integration-engineering': {
        title: 'System Integration',
        description: 'Connecting different platforms to work seamlessly together'
      },
      'process-optimization': {
        title: 'Process Optimization',
        description: 'Redesigning workflows for maximum efficiency'
      },
      'experimental-implementation': {
        title: 'Experimental Projects',
        description: 'Testing new approaches and learning from results'
      },
      'digital-transformation': {
        title: 'Digital Transformation',
        description: 'Modernizing operations with digital technologies'
      },
      'proprietary-tool-creation': {
        title: 'Proprietary Tools',
        description: 'Developing unique tools that give you competitive advantage'
      },
      'novel-integration-development': {
        title: 'Novel Integrations',
        description: 'Creating unprecedented connections between systems'
      },
      'breakthrough-process-design': {
        title: 'Breakthrough Processes',
        description: 'Fundamentally reimagining how work gets done'
      }
    };
  }
}