import jsPDF from 'jspdf';
import { Note } from '../types';

export const generatePDF = (note: Note) => {
  const doc = new jsPDF();
  
  // Header Meta
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const dateStr = new Date(note.createdAt).toLocaleDateString();
  const timeStr = new Date(note.createdAt).toLocaleTimeString();
  doc.text(`MONONOTE / ${dateStr} ${timeStr}`, 20, 20);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  const title = note.title || "Untitled";
  const splitTitle = doc.splitTextToSize(title, 170);
  doc.text(splitTitle, 20, 40);
  
  // Calculate vertical offset based on title height
  const titleHeight = splitTitle.length * 10; // Approx height
  
  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  
  // Strip HTML for PDF (Simple text export)
  const tmp = document.createElement("DIV");
  tmp.innerHTML = note.content;
  const cleanText = tmp.textContent || tmp.innerText || "";
  
  const splitText = doc.splitTextToSize(cleanText, 170);
  doc.text(splitText, 20, 40 + titleHeight + 10);
  
  doc.save(`note-${note.id}.pdf`);
};