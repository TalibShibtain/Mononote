import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { generatePDF } from '../utils/pdf';

export const NoteView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const note = useStore((state) => state.getNote(id || ''));

  if (!note) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
            <h1 className="font-bold text-2xl mb-4 font-lato">Note not found</h1>
            <button onClick={() => navigate('/')} className="text-sm font-bold uppercase tracking-widest opacity-50 hover:opacity-100">Return Home</button>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    generatePDF(note);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground relative">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-6 md:px-12 md:py-8 select-none border-b border-gray-100 dark:border-gray-900">
        <button 
            onClick={() => navigate('/')}
            className="text-sm font-bold tracking-widest opacity-40 hover:opacity-100 transition-opacity uppercase"
        >
            Back
        </button>
        
        {/* Centered Lock Indicator */}
        <div className="flex flex-col items-center justify-center text-foreground">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
             <span className="font-bold text-[10px] tracking-[0.2em] uppercase">Locked</span>
        </div>
        
        <button 
            onClick={handleExport}
            className="text-sm font-bold tracking-widest opacity-40 hover:opacity-100 transition-opacity uppercase"
        >
            Export PDF
        </button>
      </header>

      {/* Content Area */}
      <main className="flex-grow overflow-auto px-6 md:px-24 max-w-5xl mx-auto w-full pt-8 pb-24">
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold font-lato mb-6 leading-tight text-foreground">
            {note.title || <span className="opacity-20">Untitled Note</span>}
        </h1>

        {/* Body HTML */}
        <div 
            className="prose prose-xl max-w-none font-lato leading-relaxed text-foreground/90 
            prose-headings:font-bold prose-headings:text-foreground 
            prose-p:text-foreground/90 prose-strong:text-foreground prose-strong:font-bold
            prose-ul:list-disc prose-li:marker:text-foreground/50"
            dangerouslySetInnerHTML={{ __html: note.content }}
        />
        
        <div className="mt-12 pt-8 border-t border-dashed border-current/20 flex justify-between text-xs font-mono opacity-40">
            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            <span>{Math.floor(note.durationSeconds / 60)} MIN SESSION</span>
        </div>
      </main>
    </div>
  );
};