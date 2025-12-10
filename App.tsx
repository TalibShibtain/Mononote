import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useStore } from './store';
import { Home } from './pages/Home';
import { SettingsPage } from './pages/Settings';
import { NoteFlow } from './pages/NoteFlow';
import { NoteView } from './pages/NoteView';

function App() {
  const theme = useStore((state) => state.settings.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/create" element={<NoteFlow />} />
          <Route path="/note/:id" element={<NoteView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;