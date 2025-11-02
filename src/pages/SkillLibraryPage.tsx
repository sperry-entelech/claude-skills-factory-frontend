import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSkills, deleteSkill, downloadSkill, publishSkillToGitHub } from '../services/api';
import type { Skill, ContentType } from '../types';
import GitHubPublishModal from '../components/GitHubPublishModal';

function SkillLibraryPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadSkills();
  }, [search, filterType]);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const response = await getSkills({
        search: search || undefined,
        type: filterType !== 'all' ? filterType : undefined,
      });
      setSkills(response.skills);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteSkill(id);
      loadSkills();
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  const handleDownload = async (id: number, name: string) => {
    try {
      await downloadSkill(id, name);
    } catch (error) {
      console.error('Failed to download skill:', error);
      showNotification('error', 'Failed to download skill');
    }
  };

  const handleOpenPublishModal = (skill: Skill) => {
    setSelectedSkill(skill);
    setPublishModalOpen(true);
  };

  const handlePublish = async (githubToken: string, isPrivate: boolean) => {
    if (!selectedSkill) return;

    setIsPublishing(true);
    try {
      await publishSkillToGitHub(selectedSkill.id, githubToken, isPrivate);
      showNotification('success', `Successfully published to GitHub!`);
      setPublishModalOpen(false);
      // Reload skills to get updated metadata
      await loadSkills();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to publish skill to GitHub';
      showNotification('error', errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('success', 'Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="hover:opacity-75"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Publish Modal */}
      {selectedSkill && (
        <GitHubPublishModal
          skillName={selectedSkill.name}
          isOpen={publishModalOpen}
          onClose={() => {
            setPublishModalOpen(false);
            setSelectedSkill(null);
          }}
          onPublish={handlePublish}
          isPublishing={isPublishing}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Skill Library</h2>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Create New Skill
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search skills..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ContentType | 'all')}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="copywriting">Copywriting</option>
              <option value="process">Process</option>
              <option value="technical">Technical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading skills...</p>
        </div>
      ) : skills.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
          <p className="text-slate-400 mb-4">No skills found</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Your First Skill
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <div key={skill.id} className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{skill.skillType}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">
                  v{skill.version}
                </span>
              </div>

              {skill.description && (
                <p className="text-sm text-slate-300 mb-4">{skill.description}</p>
              )}

              {skill.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {skill.metadata.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* GitHub Published Status */}
              {skill.metadata.github && (
                <div className="mb-4 p-3 bg-green-950/20 border border-green-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-green-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Published to GitHub
                    </span>
                  </div>
                  <a
                    href={skill.metadata.github.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline block mb-2"
                  >
                    View Repository →
                  </a>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800 overflow-x-auto text-slate-300">
                      {skill.metadata.github.installCommand}
                    </code>
                    <button
                      onClick={() => copyToClipboard(skill.metadata.github!.installCommand)}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                      title="Copy install command"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => handleDownload(skill.id, skill.name)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  Download ZIP
                </button>
                {!skill.metadata.github && (
                  <button
                    onClick={() => handleOpenPublishModal(skill)}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition text-sm"
                  >
                    Publish to GitHub
                  </button>
                )}
                <button
                  onClick={() => handleDelete(skill.id, skill.name)}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Delete
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-4">
                Created: {new Date(skill.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SkillLibraryPage;
