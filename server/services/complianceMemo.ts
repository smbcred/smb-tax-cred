import { z } from 'zod';

// Compliance memo schemas
export const riskAssessmentSchema = z.object({
  overallRisk: z.enum(['low', 'medium', 'high']),
  riskFactors: z.array(z.object({
    factor: z.string(),
    risk: z.enum(['low', 'medium', 'high']),
    description: z.string(),
    mitigation: z.string(),
  })),
  recommendations: z.array(z.string()),
  documentationGaps: z.array(z.string()),
});

export const fourPartTestAnalysisSchema = z.object({
  technologicalInformation: z.object({
    score: z.number().min(0).max(100),
    evidence: z.array(z.string()),
    gaps: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  businessComponent: z.object({
    score: z.number().min(0).max(100),
    evidence: z.array(z.string()),
    gaps: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  uncertainty: z.object({
    score: z.number().min(0).max(100),
    evidence: z.array(z.string()),
    gaps: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  experimentation: z.object({
    score: z.number().min(0).max(100),
    evidence: z.array(z.string()),
    gaps: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  overallScore: z.number().min(0).max(100),
});

export const qreJustificationSchema = z.object({
  wageExpenses: z.object({
    amount: z.number(),
    justification: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    supportingDocuments: z.array(z.string()),
  }),
  contractorExpenses: z.object({
    amount: z.number(),
    justification: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    supportingDocuments: z.array(z.string()),
    sixtyfivePercentLimit: z.boolean(),
  }),
  supplyExpenses: z.object({
    amount: z.number(),
    justification: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    supportingDocuments: z.array(z.string()),
  }),
  totalQRE: z.number(),
  complianceNotes: z.array(z.string()),
});

export const complianceMemoRequestSchema = z.object({
  companyContext: z.object({
    companyName: z.string(),
    taxYear: z.number(),
    industry: z.string(),
    businessType: z.enum(['corporation', 'llc', 'partnership', 'sole_proprietorship']),
  }),
  projectContext: z.object({
    projectName: z.string(),
    projectDescription: z.string(),
    rdActivities: z.array(z.object({
      activity: z.string(),
      description: z.string(),
      timeSpent: z.number(),
      category: z.enum(['experimentation', 'testing', 'analysis', 'development', 'evaluation']),
    })),
    technicalChallenges: z.array(z.string()),
    uncertainties: z.array(z.string()),
    innovations: z.array(z.string()),
    businessPurpose: z.string(),
  }),
  expenseContext: z.object({
    totalExpenses: z.number(),
    wageExpenses: z.number(),
    contractorExpenses: z.number(),
    supplyExpenses: z.number(),
    expenseBreakdown: z.array(z.object({
      category: z.string(),
      amount: z.number(),
      description: z.string(),
    })).optional(),
  }),
  memoOptions: z.object({
    includeRiskAssessment: z.boolean().default(true),
    includeFourPartTest: z.boolean().default(true),
    includeQREAnalysis: z.boolean().default(true),
    includeRecommendations: z.boolean().default(true),
    detailLevel: z.enum(['summary', 'standard', 'comprehensive']).default('standard'),
  }),
});

export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;
export type FourPartTestAnalysis = z.infer<typeof fourPartTestAnalysisSchema>;
export type QREJustification = z.infer<typeof qreJustificationSchema>;
export type ComplianceMemoRequest = z.infer<typeof complianceMemoRequestSchema>;

export interface ComplianceMemo {
  id: string;
  companyName: string;
  projectName: string;
  taxYear: number;
  generatedAt: string;
  memoContent: string;
  riskAssessment: RiskAssessment;
  fourPartTestAnalysis: FourPartTestAnalysis;
  qreJustification: QREJustification;
  overallCompliance: {
    score: number;
    level: 'low' | 'medium' | 'high';
    summary: string;
  };
  recommendations: string[];
  documentationRequirements: string[];
  disclaimers: string[];
}

export class ComplianceMemoService {
  private static readonly COMPLIANCE_THRESHOLDS = {
    HIGH: 85,
    MEDIUM: 70,
    LOW: 0,
  };

  private static readonly RISK_WEIGHTS = {
    technologicalInformation: 0.3,
    businessComponent: 0.25,
    uncertainty: 0.25,
    experimentation: 0.2,
  };

  generateComplianceMemo(request: ComplianceMemoRequest): ComplianceMemo {
    const memoId = this.generateMemoId(request.companyContext.companyName, request.projectContext.projectName);
    
    // Perform analyses
    const riskAssessment = this.performRiskAssessment(request);
    const fourPartTestAnalysis = this.performFourPartTestAnalysis(request);
    const qreJustification = this.performQREJustification(request);
    
    // Calculate overall compliance
    const overallCompliance = this.calculateOverallCompliance(
      riskAssessment,
      fourPartTestAnalysis,
      qreJustification
    );
    
    // Generate memo content
    const memoContent = this.generateMemoContent(
      request,
      riskAssessment,
      fourPartTestAnalysis,
      qreJustification,
      overallCompliance
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      riskAssessment,
      fourPartTestAnalysis,
      qreJustification
    );
    
    const documentationRequirements = this.generateDocumentationRequirements(request);
    const disclaimers = this.generateDisclaimers();

    return {
      id: memoId,
      companyName: request.companyContext.companyName,
      projectName: request.projectContext.projectName,
      taxYear: request.companyContext.taxYear,
      generatedAt: new Date().toISOString(),
      memoContent,
      riskAssessment,
      fourPartTestAnalysis,
      qreJustification,
      overallCompliance,
      recommendations,
      documentationRequirements,
      disclaimers,
    };
  }

  private generateMemoId(companyName: string, projectName: string): string {
    const timestamp = Date.now();
    const company = companyName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const project = projectName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    return `CM-${company}-${project}-${timestamp}`;
  }

  private performRiskAssessment(request: ComplianceMemoRequest): RiskAssessment {
    const riskFactors = [];
    
    // Assess documentation completeness
    if (request.projectContext.rdActivities.length < 3) {
      riskFactors.push({
        factor: 'Limited R&D Activities Documentation',
        risk: 'high' as const,
        description: 'Fewer than 3 documented R&D activities may indicate insufficient scope.',
        mitigation: 'Document additional qualified research activities and expand activity descriptions.',
      });
    }
    
    // Assess technical uncertainty
    if (request.projectContext.uncertainties.length < 2) {
      riskFactors.push({
        factor: 'Insufficient Technological Uncertainty',
        risk: 'medium' as const,
        description: 'Limited documented uncertainties may weaken four-part test compliance.',
        mitigation: 'Identify and document additional technological uncertainties that existed at project onset.',
      });
    }
    
    // Assess expense concentration
    const contractorRatio = request.expenseContext.contractorExpenses / request.expenseContext.totalExpenses;
    if (contractorRatio > 0.65) {
      riskFactors.push({
        factor: 'High Contractor Expense Ratio',
        risk: 'high' as const,
        description: 'Contractor expenses exceed 65% threshold per IRC Section 41(b)(3).',
        mitigation: 'Review contractor agreements and ensure 65% limitation compliance for QRE.',
      });
    }
    
    // Assess business component clarity
    if (!request.projectContext.businessPurpose || request.projectContext.businessPurpose.length < 50) {
      riskFactors.push({
        factor: 'Unclear Business Component',
        risk: 'medium' as const,
        description: 'Business purpose description lacks detail for business component test.',
        mitigation: 'Expand business purpose documentation with specific component improvements.',
      });
    }
    
    // Assess industry risk
    const highRiskIndustries = ['consulting', 'advisory', 'marketing', 'sales'];
    if (highRiskIndustries.some(industry => 
      request.companyContext.industry.toLowerCase().includes(industry)
    )) {
      riskFactors.push({
        factor: 'Industry Risk Profile',
        risk: 'medium' as const,
        description: 'Industry classification may face heightened IRS scrutiny for R&D claims.',
        mitigation: 'Ensure clear technical nature documentation and avoid business process activities.',
      });
    }

    // Calculate overall risk
    const highRiskCount = riskFactors.filter(f => f.risk === 'high').length;
    const mediumRiskCount = riskFactors.filter(f => f.risk === 'medium').length;
    
    let overallRisk: 'low' | 'medium' | 'high';
    if (highRiskCount > 1) {
      overallRisk = 'high';
    } else if (highRiskCount === 1 || mediumRiskCount > 2) {
      overallRisk = 'medium';
    } else {
      overallRisk = 'low';
    }

    const recommendations = this.generateRiskRecommendations(riskFactors, overallRisk);
    const documentationGaps = this.identifyDocumentationGaps(request, riskFactors);

    return {
      overallRisk,
      riskFactors,
      recommendations,
      documentationGaps,
    };
  }

  private performFourPartTestAnalysis(request: ComplianceMemoRequest): FourPartTestAnalysis {
    // Technological Information Analysis
    const techInfo = this.analyzeTechnologicalInformation(request);
    
    // Business Component Analysis
    const businessComp = this.analyzeBusinessComponent(request);
    
    // Uncertainty Analysis
    const uncertainty = this.analyzeUncertainty(request);
    
    // Experimentation Analysis
    const experimentation = this.analyzeExperimentation(request);
    
    // Calculate overall score
    const overallScore = Math.round(
      techInfo.score * ComplianceMemoService.RISK_WEIGHTS.technologicalInformation +
      businessComp.score * ComplianceMemoService.RISK_WEIGHTS.businessComponent +
      uncertainty.score * ComplianceMemoService.RISK_WEIGHTS.uncertainty +
      experimentation.score * ComplianceMemoService.RISK_WEIGHTS.experimentation
    );

    return {
      technologicalInformation: techInfo,
      businessComponent: businessComp,
      uncertainty,
      experimentation,
      overallScore,
    };
  }

  private analyzeTechnologicalInformation(request: ComplianceMemoRequest) {
    const evidence = [];
    const gaps = [];
    const recommendations = [];
    let score = 0;

    // Check for technical nature
    const techKeywords = ['algorithm', 'software', 'system', 'technology', 'engineering', 'technical', 'development'];
    const hasTechKeywords = techKeywords.some(keyword => 
      request.projectContext.projectDescription.toLowerCase().includes(keyword) ||
      request.projectContext.rdActivities.some(activity => 
        activity.description.toLowerCase().includes(keyword)
      )
    );

    if (hasTechKeywords) {
      evidence.push('Project involves technological subject matter based on description and activities');
      score += 30;
    } else {
      gaps.push('Limited evidence of technological nature in project documentation');
      recommendations.push('Expand technical descriptions to clearly demonstrate technological information being sought');
    }

    // Check for innovation aspects
    if (request.projectContext.innovations.length > 0) {
      evidence.push(`${request.projectContext.innovations.length} documented innovations demonstrate technological advancement`);
      score += 25;
    } else {
      gaps.push('No documented innovations or technological advancements');
      recommendations.push('Document specific technological innovations and improvements developed');
    }

    // Check for technical challenges
    if (request.projectContext.technicalChallenges.length >= 2) {
      evidence.push('Multiple technical challenges documented showing technological complexity');
      score += 25;
    } else {
      gaps.push('Insufficient technical challenges documented');
      recommendations.push('Identify and document additional technical challenges that required technological solutions');
    }

    // Check for technical activities
    const techActivities = request.projectContext.rdActivities.filter(activity =>
      ['development', 'testing', 'analysis'].includes(activity.category)
    );
    if (techActivities.length >= 2) {
      evidence.push('Technical R&D activities demonstrate systematic technological investigation');
      score += 20;
    } else {
      gaps.push('Limited technical R&D activities documented');
      recommendations.push('Document additional technical activities that contributed to technological information discovery');
    }

    return { score: Math.min(score, 100), evidence, gaps, recommendations };
  }

  private analyzeBusinessComponent(request: ComplianceMemoRequest) {
    const evidence = [];
    const gaps = [];
    const recommendations = [];
    let score = 0;

    // Check business purpose clarity
    if (request.projectContext.businessPurpose.length >= 50) {
      evidence.push('Clear business purpose documented for component development or improvement');
      score += 40;
    } else {
      gaps.push('Business purpose lacks sufficient detail');
      recommendations.push('Expand business purpose documentation with specific component improvements');
    }

    // Check for component identification
    const componentKeywords = ['product', 'service', 'process', 'software', 'system', 'feature', 'functionality'];
    const hasComponentRef = componentKeywords.some(keyword => 
      request.projectContext.businessPurpose.toLowerCase().includes(keyword) ||
      request.projectContext.projectDescription.toLowerCase().includes(keyword)
    );

    if (hasComponentRef) {
      evidence.push('Business component clearly identified in project documentation');
      score += 30;
    } else {
      gaps.push('Business component not clearly identified');
      recommendations.push('Clearly identify the specific business component being developed or improved');
    }

    // Check for improvement intent
    const improvementKeywords = ['improve', 'enhance', 'develop', 'create', 'build', 'design', 'optimize'];
    const hasImprovementIntent = improvementKeywords.some(keyword => 
      request.projectContext.businessPurpose.toLowerCase().includes(keyword)
    );

    if (hasImprovementIntent) {
      evidence.push('Clear intent to develop or improve business component documented');
      score += 30;
    } else {
      gaps.push('Intent to develop or improve business component not clearly stated');
      recommendations.push('Document specific improvements or developments intended for the business component');
    }

    return { score: Math.min(score, 100), evidence, gaps, recommendations };
  }

  private analyzeUncertainty(request: ComplianceMemoRequest) {
    const evidence = [];
    const gaps = [];
    const recommendations = [];
    let score = 0;

    // Check documented uncertainties
    if (request.projectContext.uncertainties.length >= 3) {
      evidence.push('Multiple technological uncertainties documented');
      score += 40;
    } else if (request.projectContext.uncertainties.length >= 1) {
      evidence.push('Some technological uncertainties documented');
      score += 20;
      recommendations.push('Document additional technological uncertainties that existed at project onset');
    } else {
      gaps.push('No technological uncertainties documented');
      recommendations.push('Identify and document technological uncertainties that required resolution');
    }

    // Check uncertainty quality
    const qualityUncertainties = request.projectContext.uncertainties.filter(u => u.length >= 30);
    if (qualityUncertainties.length >= 2) {
      evidence.push('Detailed uncertainty descriptions demonstrate technological challenges');
      score += 30;
    } else {
      gaps.push('Uncertainty descriptions lack sufficient detail');
      recommendations.push('Expand uncertainty descriptions with specific technological challenges');
    }

    // Check for technical challenge correlation
    if (request.projectContext.technicalChallenges.length >= 2) {
      evidence.push('Technical challenges support uncertainty documentation');
      score += 30;
    } else {
      gaps.push('Limited technical challenges to support uncertainty claims');
      recommendations.push('Document technical challenges that arose from technological uncertainties');
    }

    return { score: Math.min(score, 100), evidence, gaps, recommendations };
  }

  private analyzeExperimentation(request: ComplianceMemoRequest) {
    const evidence = [];
    const gaps = [];
    const recommendations = [];
    let score = 0;

    // Check for experimental activities
    const experimentalActivities = request.projectContext.rdActivities.filter(activity =>
      ['experimentation', 'testing', 'evaluation'].includes(activity.category)
    );

    if (experimentalActivities.length >= 3) {
      evidence.push('Multiple experimental activities demonstrate systematic process');
      score += 40;
    } else if (experimentalActivities.length >= 1) {
      evidence.push('Some experimental activities documented');
      score += 20;
      recommendations.push('Document additional experimental and testing activities');
    } else {
      gaps.push('No experimental activities clearly documented');
      recommendations.push('Document systematic experimentation process undertaken');
    }

    // Check experimentation methodology
    const methodKeywords = ['test', 'trial', 'prototype', 'experiment', 'evaluate', 'validate', 'iterate'];
    const hasMethodology = request.projectContext.rdActivities.some(activity =>
      methodKeywords.some(keyword => activity.description.toLowerCase().includes(keyword))
    );

    if (hasMethodology) {
      evidence.push('Systematic methodology evident in activity descriptions');
      score += 30;
    } else {
      gaps.push('Limited evidence of systematic experimentation methodology');
      recommendations.push('Document systematic approach to testing and evaluation');
    }

    // Check for iterative process
    const totalHours = request.projectContext.rdActivities.reduce((sum, activity) => sum + activity.timeSpent, 0);
    if (totalHours >= 100) {
      evidence.push('Substantial time investment indicates thorough experimentation process');
      score += 30;
    } else {
      gaps.push('Limited time investment may indicate insufficient experimentation');
      recommendations.push('Document additional time spent on experimental activities');
    }

    return { score: Math.min(score, 100), evidence, gaps, recommendations };
  }

  private performQREJustification(request: ComplianceMemoRequest): QREJustification {
    const { expenseContext } = request;
    
    // Analyze wage expenses
    const wageExpenses = {
      amount: expenseContext.wageExpenses,
      justification: this.generateWageJustification(request),
      riskLevel: this.assessWageRisk(expenseContext),
      supportingDocuments: this.getWageSupportingDocs(),
    };

    // Analyze contractor expenses
    const contractorExpenses = {
      amount: expenseContext.contractorExpenses,
      justification: this.generateContractorJustification(request),
      riskLevel: this.assessContractorRisk(expenseContext),
      supportingDocuments: this.getContractorSupportingDocs(),
      sixtyfivePercentLimit: this.checkSixtyFivePercentLimit(expenseContext),
    };

    // Analyze supply expenses
    const supplyExpenses = {
      amount: expenseContext.supplyExpenses,
      justification: this.generateSupplyJustification(request),
      riskLevel: this.assessSupplyRisk(expenseContext),
      supportingDocuments: this.getSupplySupportingDocs(),
    };

    const totalQRE = this.calculateTotalQRE(expenseContext);
    const complianceNotes = this.generateQREComplianceNotes(expenseContext);

    return {
      wageExpenses,
      contractorExpenses,
      supplyExpenses,
      totalQRE,
      complianceNotes,
    };
  }

  private generateMemoContent(
    request: ComplianceMemoRequest,
    riskAssessment: RiskAssessment,
    fourPartTest: FourPartTestAnalysis,
    qreJustification: QREJustification,
    overallCompliance: any
  ): string {
    const date = new Date().toLocaleDateString();
    
    return `MEMORANDUM

TO: ${request.companyContext.companyName} Tax Department
FROM: R&D Tax Credit Compliance Team
DATE: ${date}
RE: R&D Tax Credit Compliance Analysis - ${request.projectContext.projectName} (Tax Year ${request.companyContext.taxYear})

I. EXECUTIVE SUMMARY

This memorandum provides a comprehensive compliance analysis of ${request.projectContext.projectName} for R&D tax credit qualification under Internal Revenue Code Section 41. Based on our analysis, the project demonstrates an overall compliance score of ${overallCompliance.score}% with ${overallCompliance.level} risk profile.

Project Overview:
- Company: ${request.companyContext.companyName}
- Project: ${request.projectContext.projectName}
- Tax Year: ${request.companyContext.taxYear}
- Total Qualified Research Expenses: $${qreJustification.totalQRE.toLocaleString()}

II. FOUR-PART TEST ANALYSIS

A. Technological Information (Score: ${fourPartTest.technologicalInformation.score}%)
${this.formatTestSection(fourPartTest.technologicalInformation)}

B. Business Component (Score: ${fourPartTest.businessComponent.score}%)
${this.formatTestSection(fourPartTest.businessComponent)}

C. Technological Uncertainty (Score: ${fourPartTest.uncertainty.score}%)
${this.formatTestSection(fourPartTest.uncertainty)}

D. Process of Experimentation (Score: ${fourPartTest.experimentation.score}%)
${this.formatTestSection(fourPartTest.experimentation)}

Overall Four-Part Test Score: ${fourPartTest.overallScore}%

III. QUALIFIED RESEARCH EXPENSE ANALYSIS

A. Wage Expenses: $${qreJustification.wageExpenses.amount.toLocaleString()} (Risk: ${qreJustification.wageExpenses.riskLevel})
${qreJustification.wageExpenses.justification}

B. Contractor Expenses: $${qreJustification.contractorExpenses.amount.toLocaleString()} (Risk: ${qreJustification.contractorExpenses.riskLevel})
${qreJustification.contractorExpenses.justification}
${qreJustification.contractorExpenses.sixtyfivePercentLimit ? 'COMPLIANT' : 'NON-COMPLIANT'} with 65% limitation per IRC Section 41(b)(3).

C. Supply Expenses: $${qreJustification.supplyExpenses.amount.toLocaleString()} (Risk: ${qreJustification.supplyExpenses.riskLevel})
${qreJustification.supplyExpenses.justification}

Total QRE: $${qreJustification.totalQRE.toLocaleString()}

IV. RISK ASSESSMENT

Overall Risk Level: ${riskAssessment.overallRisk.toUpperCase()}

Risk Factors Identified:
${riskAssessment.riskFactors.map(factor => 
  `- ${factor.factor} (${factor.risk.toUpperCase()}): ${factor.description}`
).join('\n')}

V. COMPLIANCE RECOMMENDATIONS

${riskAssessment.recommendations.map(rec => `- ${rec}`).join('\n')}

VI. DOCUMENTATION REQUIREMENTS

The following documentation should be maintained to support this R&D tax credit claim:
${this.generateDocumentationRequirements(request).map(req => `- ${req}`).join('\n')}

VII. DISCLAIMERS

${this.generateDisclaimers().map(disclaimer => `- ${disclaimer}`).join('\n')}

This analysis is based on the information provided and current Treasury Regulations. This memorandum does not constitute tax advice and should be reviewed by qualified tax professionals before filing.

---
Generated: ${new Date().toISOString()}
Compliance Score: ${overallCompliance.score}%
Risk Level: ${overallCompliance.level.toUpperCase()}`;
  }

  private formatTestSection(section: any): string {
    return `
Evidence Supporting Qualification:
${section.evidence.map((e: string) => `- ${e}`).join('\n')}

Identified Gaps:
${section.gaps.map((g: string) => `- ${g}`).join('\n')}

Recommendations:
${section.recommendations.map((r: string) => `- ${r}`).join('\n')}`;
  }

  private calculateOverallCompliance(
    riskAssessment: RiskAssessment,
    fourPartTest: FourPartTestAnalysis,
    qreJustification: QREJustification
  ) {
    // Base score from four-part test
    let score = fourPartTest.overallScore;

    // Adjust for risk factors
    const riskPenalty = riskAssessment.riskFactors.reduce((penalty, factor) => {
      switch (factor.risk) {
        case 'high': return penalty + 10;
        case 'medium': return penalty + 5;
        case 'low': return penalty + 1;
        default: return penalty;
      }
    }, 0);

    score = Math.max(0, score - riskPenalty);

    // Determine compliance level
    let level: 'low' | 'medium' | 'high';
    if (score >= ComplianceMemoService.COMPLIANCE_THRESHOLDS.HIGH) {
      level = 'high';
    } else if (score >= ComplianceMemoService.COMPLIANCE_THRESHOLDS.MEDIUM) {
      level = 'medium';
    } else {
      level = 'low';
    }

    const summary = this.generateComplianceSummary(score, level, riskAssessment.overallRisk);

    return { score, level, summary };
  }

  private generateComplianceSummary(score: number, level: string, riskLevel: string): string {
    if (level === 'high') {
      return `Strong compliance position with comprehensive documentation supporting R&D qualification. ${riskLevel === 'low' ? 'Low audit risk profile.' : 'Some risk factors identified but manageable with proper documentation.'}`;
    } else if (level === 'medium') {
      return `Moderate compliance position with some gaps in documentation. Additional evidence recommended to strengthen claim. ${riskLevel === 'high' ? 'Heightened audit risk requires attention to identified factors.' : 'Manageable risk profile with documentation improvements.'}`;
    } else {
      return `Weak compliance position with significant documentation gaps. Substantial additional evidence required before claiming credit. High audit risk profile requires comprehensive remediation.`;
    }
  }

  // Helper methods for QRE analysis
  private generateWageJustification(request: ComplianceMemoRequest): string {
    return `Wage expenses relate to employees directly engaged in qualified research activities including ${request.projectContext.rdActivities.map(a => a.activity).join(', ')}. Time records and job descriptions support direct engagement in R&D activities.`;
  }

  private generateContractorJustification(request: ComplianceMemoRequest): string {
    return `Contractor expenses relate to external resources engaged in qualified research activities. Agreements specify R&D nature of work and comply with IRC Section 41(b)(3) requirements.`;
  }

  private generateSupplyJustification(request: ComplianceMemoRequest): string {
    return `Supply expenses consumed in the conduct of qualified research activities. Materials directly support experimental process and technological investigation.`;
  }

  private assessWageRisk(expenseContext: any): 'low' | 'medium' | 'high' {
    const wageRatio = expenseContext.wageExpenses / expenseContext.totalExpenses;
    if (wageRatio >= 0.5) return 'low';
    if (wageRatio >= 0.3) return 'medium';
    return 'high';
  }

  private assessContractorRisk(expenseContext: any): 'low' | 'medium' | 'high' {
    const contractorRatio = expenseContext.contractorExpenses / expenseContext.totalExpenses;
    if (contractorRatio <= 0.3) return 'low';
    if (contractorRatio <= 0.6) return 'medium';
    return 'high';
  }

  private assessSupplyRisk(expenseContext: any): 'low' | 'medium' | 'high' {
    const supplyRatio = expenseContext.supplyExpenses / expenseContext.totalExpenses;
    if (supplyRatio <= 0.2) return 'low';
    if (supplyRatio <= 0.4) return 'medium';
    return 'high';
  }

  private checkSixtyFivePercentLimit(expenseContext: any): boolean {
    return expenseContext.contractorExpenses <= (expenseContext.totalExpenses * 0.65);
  }

  private calculateTotalQRE(expenseContext: any): number {
    return expenseContext.wageExpenses + 
           Math.min(expenseContext.contractorExpenses, expenseContext.totalExpenses * 0.65) + 
           expenseContext.supplyExpenses;
  }

  private generateQREComplianceNotes(expenseContext: any): string[] {
    const notes = [];
    
    if (!this.checkSixtyFivePercentLimit(expenseContext)) {
      notes.push('Contractor expenses exceed 65% limitation - adjustment required per IRC Section 41(b)(3)');
    }
    
    const wageRatio = expenseContext.wageExpenses / expenseContext.totalExpenses;
    if (wageRatio < 0.3) {
      notes.push('Low wage expense ratio may indicate limited direct employee involvement in R&D');
    }
    
    return notes;
  }

  private getWageSupportingDocs(): string[] {
    return [
      'Employee time records for R&D activities',
      'Job descriptions for R&D personnel',
      'Payroll records and wage statements',
      'Project assignment documentation'
    ];
  }

  private getContractorSupportingDocs(): string[] {
    return [
      'Contractor agreements specifying R&D work',
      'Invoices for R&D services',
      'Work product deliverables',
      'Statement of work documentation'
    ];
  }

  private getSupplySupportingDocs(): string[] {
    return [
      'Purchase orders for R&D supplies',
      'Invoices and receipts',
      'Inventory records for consumed materials',
      'Lab notebooks documenting supply usage'
    ];
  }

  private generateRiskRecommendations(riskFactors: any[], overallRisk: string): string[] {
    const recommendations = [];
    
    if (overallRisk === 'high') {
      recommendations.push('Conduct comprehensive documentation review before claiming credit');
      recommendations.push('Consider engaging R&D tax credit specialist for claim preparation');
    }
    
    if (riskFactors.some(f => f.factor.includes('Documentation'))) {
      recommendations.push('Implement systematic R&D documentation procedures');
    }
    
    if (riskFactors.some(f => f.factor.includes('Contractor'))) {
      recommendations.push('Review contractor agreements for R&D compliance');
    }
    
    return recommendations;
  }

  private identifyDocumentationGaps(request: ComplianceMemoRequest, riskFactors: any[]): string[] {
    const gaps = [];
    
    if (request.projectContext.rdActivities.length < 3) {
      gaps.push('Insufficient R&D activity documentation');
    }
    
    if (request.projectContext.uncertainties.length < 2) {
      gaps.push('Limited technological uncertainty documentation');
    }
    
    if (!request.projectContext.businessPurpose || request.projectContext.businessPurpose.length < 50) {
      gaps.push('Inadequate business component documentation');
    }
    
    return gaps;
  }

  private generateRecommendations(
    riskAssessment: RiskAssessment,
    fourPartTest: FourPartTestAnalysis,
    qreJustification: QREJustification
  ): string[] {
    const recommendations = [];
    
    // Add specific recommendations based on analysis
    recommendations.push(...riskAssessment.recommendations);
    recommendations.push(...fourPartTest.technologicalInformation.recommendations);
    recommendations.push(...fourPartTest.businessComponent.recommendations);
    recommendations.push(...fourPartTest.uncertainty.recommendations);
    recommendations.push(...fourPartTest.experimentation.recommendations);
    
    // Remove duplicates
    return [...new Set(recommendations)];
  }

  private generateDocumentationRequirements(request: ComplianceMemoRequest): string[] {
    return [
      'Project documentation and technical specifications',
      'Employee time records for R&D activities',
      'Contractor agreements and invoices',
      'Supply purchase records and usage logs',
      'Meeting minutes and project status reports',
      'Test results and experimental data',
      'Technical challenge documentation',
      'Business case and project approval documents',
      'Source code repositories and version control logs',
      'Patent applications or technical publications'
    ];
  }

  private generateDisclaimers(): string[] {
    return [
      'This analysis is based on information provided and current Treasury Regulations as of the generation date',
      'This memorandum does not constitute tax advice and should be reviewed by qualified tax professionals',
      'IRS regulations and interpretations may change, requiring updates to this analysis',
      'Additional documentation may be required to support positions taken in this analysis',
      'This analysis assumes all provided information is accurate and complete',
      'Consultation with R&D tax credit specialists is recommended before filing claims'
    ];
  }
}

// Singleton instance
let complianceMemoService: ComplianceMemoService | null = null;

export function getComplianceMemoService(): ComplianceMemoService {
  if (!complianceMemoService) {
    complianceMemoService = new ComplianceMemoService();
  }
  return complianceMemoService;
}