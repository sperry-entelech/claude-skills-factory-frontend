import { useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeContent, generateSkill } from '../services/api';
import type { ContentType } from '../types';

function SkillCreatorPage() {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<ContentType>('process');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [skillName, setSkillName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Content type helper descriptions
  const contentTypeHelpers = {
    copywriting: 'Sales copy, email sequences, marketing frameworks',
    process: 'Business processes, workflows, step-by-step procedures',
    technical: 'Code patterns, technical specifications, development guides',
  };

  // Format skill name to lowercase with hyphens
  const formatSkillName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Validation functions
  const validateSkillName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Skill name is required';
    }
    if (name.trim().length < 3) {
      return 'Skill name must be at least 3 characters';
    }
    const validFormat = /^[a-z0-9-]+$/.test(name.trim());
    if (!validFormat) {
      return 'Skill name must be lowercase with hyphens only (e.g., self-iterating-documentation-agent)';
    }
    return null;
  };

  const validateContent = (content: string): string | null => {
    if (!content.trim()) {
      return 'Content is required';
    }
    if (content.trim().length < 100) {
      return `Content must be at least 100 characters (currently ${content.trim().length})`;
    }
    return null;
  };

  const validateTags = (tags: string): string | null => {
    if (!tags.trim()) return null;
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const invalidTags = tagArray.filter(t => !/^[a-z0-9-]+$/i.test(t));
    if (invalidTags.length > 0) {
      return `Invalid tags: ${invalidTags.join(', ')}. Use alphanumeric characters and hyphens only.`;
    }
    return null;
  };

  // Real-time validation handlers
  const handleSkillNameChange = (value: string) => {
    const formatted = formatSkillName(value);
    setSkillName(formatted);
    const error = validateSkillName(formatted);
    setValidationErrors(prev => ({
      ...prev,
      skillName: error || '',
    }));
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    const error = validateContent(value);
    setValidationErrors(prev => ({
      ...prev,
      content: error || '',
    }));
  };

  const handleTagsChange = (value: string) => {
    setTags(value);
    const error = validateTags(value);
    setValidationErrors(prev => ({
      ...prev,
      tags: error || '',
    }));
  };

  const handleAnalyze = async () => {
    const contentError = validateContent(content);
    if (contentError) {
      setError(contentError);
      setValidationErrors(prev => ({ ...prev, content: contentError }));
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setValidationErrors({});
    setAnalysisResult(null);

    try {
      const result = await analyzeContent(content, contentType);
      setAnalysisResult(result);
      setError('');
    } catch (err: any) {
      console.error('Analysis error:', err);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const errorMessage = err.response?.data?.message || err.message || 'Analysis failed';
      setError(
        `${errorMessage}\n\n` +
        `Backend URL: ${apiUrl}\n` +
        `Error details: ${err.response?.status ? `HTTP ${err.response.status}` : 'Connection error'}\n` +
        `Please check:\n` +
        `1. Backend is running on Railway\n` +
        `2. VITE_API_URL is set correctly in Vercel\n` +
        `3. Backend has CLAUDE_API_KEY configured\n` +
        `4. Backend has FRONTEND_URL set for CORS`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSkill = async () => {
    if (!analysisResult) return;
    
    const skillNameError = validateSkillName(skillName);
    if (skillNameError) {
      setError(skillNameError);
      setValidationErrors(prev => ({ ...prev, skillName: skillNameError }));
      return;
    }

    const tagsError = validateTags(tags);
    if (tagsError) {
      setError(tagsError);
      setValidationErrors(prev => ({ ...prev, tags: tagsError }));
      return;
    }

    setIsGenerating(true);
    setError('');
    setValidationErrors({});

    try {
      const result = await generateSkill({
        analysisId: analysisResult.analysisId,
        skillName: skillName.trim(),
        skillType: contentType,
        description: description || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
      });

      setSuccess(`Skill "${result.skillName}" created successfully! Click to view in library.`);
      // Reset form
      setContent('');
      setContentType('process');
      setAnalysisResult(null);
      setSkillName('');
      setDescription('');
      setTags('');
      setValidationErrors({});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Skill generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Create New Skill</h2>
          <p className="text-sm text-slate-400 mt-1">
            Generate Claude skills from your business content, processes, and documentation
          </p>
        </div>
        <Link
          to="/library"
          className="px-4 py-2 text-blue-400 hover:text-blue-300 border border-blue-600 rounded-lg hover:bg-blue-900/20 transition"
        >
          View Library →
        </Link>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { step: 'input', label: 'Configure' },
          { step: 'preview', label: 'Analyze' },
          { step: 'generating', label: 'Generate' },
          { step: 'complete', label: 'Download' },
        ].map((s, idx) => {
          const stepOrder = ['input', 'preview', 'generating', 'complete'];
          const currentStep = analysisResult ? (isGenerating ? 'generating' : success ? 'complete' : 'preview') : 'input';
          const currentIdx = stepOrder.indexOf(currentStep);
          const isComplete = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={s.step} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isComplete
                    ? 'bg-green-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isComplete ? '✓' : idx + 1}
              </div>
              <span
                className={`text-sm ${
                  isCurrent ? 'text-white font-medium' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
              {idx < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    isComplete ? 'bg-green-600' : 'bg-slate-800'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-950/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg whitespace-pre-line">
          <div className="font-semibold mb-2">Error</div>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-950/20 border border-green-800 text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Step 1: Content Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Step 1: Provide Content</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Content Type *
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="copywriting">Copywriting</option>
            <option value="process">Process</option>
            <option value="technical">Technical</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">
            {contentTypeHelpers[contentType]}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            rows={12}
            className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
              validationErrors.content ? 'border-red-500' : 'border-slate-700'
            }`}
            placeholder="Paste your process documentation, copywriting framework, or technical specification here..."
            required
          />
          <div className="flex items-center justify-between mt-2">
            <p className={`text-xs ${
              content.trim().length < 100 
                ? 'text-yellow-500' 
                : validationErrors.content 
                ? 'text-red-400' 
                : 'text-slate-500'
            }`}>
              {content.trim().length} / 100 characters (minimum recommended)
              {validationErrors.content && ` • ${validationErrors.content}`}
            </p>
            {content.trim().length >= 100 && !validationErrors.content && (
              <span className="text-green-500 text-sm">✓</span>
            )}
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !content.trim() || content.trim().length < 100 || !!validationErrors.content}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 transition"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
        </button>
      </div>

      {/* Step 2: Analysis Preview */}
      {analysisResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Step 2: Review Analysis</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Confidence</p>
              <p className="text-2xl font-bold text-white">
                {(analysisResult.confidence * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Processing Time</p>
              <p className="text-2xl font-bold text-white">
                {analysisResult.processingTime?.toFixed(0) || 'N/A'}ms
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Skill Name *
            </label>
            <input
              type="text"
              value={skillName}
              onChange={(e) => handleSkillNameChange(e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.skillName ? 'border-red-500' : 'border-slate-700'
              }`}
              placeholder="e.g., self-iterating-documentation-agent"
              required
            />
            <div className="flex items-center justify-between mt-1">
              <p className={`text-xs ${
                validationErrors.skillName ? 'text-red-400' : 'text-slate-500'
              }`}>
                {validationErrors.skillName || 'Use lowercase with hyphens (auto-formatted)'}
              </p>
              {skillName && !validationErrors.skillName && (
                <span className="text-green-500 text-sm">✓</span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of what this skill does..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => handleTagsChange(e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.tags ? 'border-red-500' : 'border-slate-700'
              }`}
              placeholder="documentation, automation, process (comma-separated)"
            />
            <div className="flex items-center justify-between mt-1">
              <p className={`text-xs ${
                validationErrors.tags ? 'text-red-400' : 'text-slate-500'
              }`}>
                {validationErrors.tags || 'Comma-separated tags for organization and search'}
              </p>
              {tags && !validationErrors.tags && (
                <span className="text-green-500 text-sm">✓</span>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerateSkill}
            disabled={isGenerating || !skillName.trim() || !!validationErrors.skillName || !!validationErrors.tags}
            className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            {isGenerating ? 'Generating Skill...' : 'Generate Skill'}
          </button>
        </div>
      )}
    </div>
  );
}

export default SkillCreatorPage;
