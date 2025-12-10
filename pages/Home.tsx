import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '../components/Button';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { notes, deleteNote } = useStore();

  // Helper to strip HTML for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this note?")) {
        deleteNote(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-start mb-16 border-b-2 border-current pb-4">
        <div className="w-1/3 text-left">
           <span className="font-bold opacity-30 select-none">BACK</span>
        </div>
        <div className="w-1/3 text-center">
            <h1 className="font-bold text-xl tracking-tighter">MONONOTE</h1>
        </div>
        <div className="w-1/3 text-right">
          <Button 
            onClick={() => navigate('/create')}
            className="bg-foreground text-background px-6 py-2 hover:opacity-80 transition-opacity rounded-sm"
          >
            New Note
          </Button>
        </div>
      </header>

      {/* Grid */}
      <main className="flex-grow">
        {notes.length === 0 ? (
          <div className="flex items-center justify-center h-64 opacity-40">
            <p className="font-bold">NO NOTES FOUND</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {notes.map((note) => (
              <div 
                key={note.id} 
                onClick={() => navigate(`/note/${note.id}`)}
                className="relative border-2 border-current p-6 h-80 flex flex-col cursor-pointer hover:bg-foreground hover:text-background transition-colors duration-200 group"
              >
                {/* Delete Button (Centered on Hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    <button
                        onClick={(e) => handleDelete(e, note.id)}
                        className="pointer-events-auto w-16 h-16 rounded-full bg-background text-foreground border-2 border-transparent flex items-center justify-center text-2xl font-bold hover:scale-110 transition-transform shadow-xl"
                        title="Delete Note"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex justify-between items-center mb-4 border-b border-current group-hover:border-background pb-2 transition-colors">
                   <span className="font-bold text-xs">{new Date(note.createdAt).toLocaleDateString()}</span>
                   <span className="font-mono text-xs">{Math.floor(note.durationSeconds / 60)}M</span>
                </div>
                
                {/* Title Preview */}
                <h3 className="font-bold text-lg mb-2 line-clamp-2 leading-tight">
                    {note.title || "UNTITLED"}
                </h3>
                
                {/* Body Preview (Stripped HTML) */}
                <p className="font-normal text-sm line-clamp-6 leading-relaxed opacity-80">
                  {stripHtml(note.content) || "No content"}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 pt-4 border-t-2 border-current flex justify-between items-center">
        <Button onClick={() => navigate('/settings')}>Settings</Button>
        <div className="flex items-center gap-2 text-xs font-mono font-bold opacity-50">
            <span>MADE BY SHIBTAIN</span>
            <span className="text-foreground opacity-100 text-lg leading-none pb-1">♥</span>
        </div>
      </footer>
    </div>
  );
};