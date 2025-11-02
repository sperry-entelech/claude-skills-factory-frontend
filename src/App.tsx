import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SkillCreatorPage from './pages/SkillCreatorPage';
import SkillLibraryPage from './pages/SkillLibraryPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-white">
              Claude Skills Factory
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Automate the creation of Claude Skills from your content
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<SkillCreatorPage />} />
            <Route path="/library" element={<SkillLibraryPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;