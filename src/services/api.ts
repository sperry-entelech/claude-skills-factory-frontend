// API Client for backend communication
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🔗 Environment Variables:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
  });
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for Claude API calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
    console.log('🌐 Request Config:', {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: fullUrl,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
      },
    });
    return Promise.reject(error);
  }
);

// Health check
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

// Content Analysis
export const analyzeContent = async (content: string, contentType: string) => {
  const response = await apiClient.post('/analyze', {
    content,
    contentType,
  });
  return response.data;
};

// Skill Generation
export const generateSkill = async (data: {
  analysisId: string;
  skillName: string;
  skillType: string;
  description?: string;
  tags?: string[];
}) => {
  const response = await apiClient.post('/generate-skill', data);
  return response.data;
};

// Skills Management
export const getSkills = async (params?: {
  search?: string;
  type?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await apiClient.get('/skills', { params });
  return response.data;
};

export const getSkill = async (id: number) => {
  const response = await apiClient.get(`/skills/${id}`);
  return response.data;
};

export const updateSkill = async (id: number, data: any) => {
  const response = await apiClient.put(`/skills/${id}`, data);
  return response.data;
};

export const deleteSkill = async (id: number) => {
  const response = await apiClient.delete(`/skills/${id}`);
  return response.data;
};

// Download skill ZIP
export const downloadSkill = async (id: number, filename: string) => {
  const response = await apiClient.get(`/skills/${id}/download`, {
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.zip`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Publish skill to GitHub
export const publishSkillToGitHub = async (
  id: number,
  githubToken: string,
  isPrivate: boolean = true
) => {
  const response = await apiClient.post(`/skills/${id}/publish`, {
    githubToken,
    isPrivate,
  });
  return response.data;
};

export default apiClient;
