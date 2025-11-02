// Type definitions for the Claude Skills Factory

export type ContentType = 'copywriting' | 'process' | 'technical';

export interface AnalysisResult {
  analysisId: string;
  contentType: ContentType;
  extractedData: Record<string, any>;
  confidence: number;
  processingTime: number;
  notes?: string;
  timestamp: string;
}

export interface GeneratedSkill {
  skillId: number;
  skillName: string;
  version: number;
  files: {
    'skill.md': string;
    references: Record<string, string>;
  };
  metadata: {
    tags: string[];
    fileCount: number;
    totalSize: number;
    extractedFrom: {
      analysisId: string;
      contentType: string;
      analysisDate: string;
      confidence: number;
    };
  };
  zipBuffer?: ArrayBuffer;
  downloadUrl: string;
  createdAt: string;
}

export interface Skill {
  id: number;
  name: string;
  description?: string;
  skillType: ContentType;
  version: number;
  mainContent: string;
  references: Record<string, string>;
  metadata: {
    tags: string[];
    fileCount: number;
    totalSize: number;
    extractedFrom?: {
      analysisId: string;
      contentType: string;
      analysisDate: string;
      confidence: number;
    };
    github?: {
      repositoryUrl: string;
      repositoryName: string;
      publishedAt: string;
      installCommand: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface SkillsListResponse {
  skills: Skill[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface GenerateSkillRequest {
  analysisId: string;
  skillName: string;
  skillType: ContentType;
  description?: string;
  tags?: string[];
}

export interface UpdateSkillRequest {
  name?: string;
  description?: string;
  mainContent?: string;
  references?: Record<string, string>;
  tags?: string[];
}
