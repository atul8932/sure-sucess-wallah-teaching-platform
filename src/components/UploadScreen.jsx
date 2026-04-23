import { useRef, useState, useCallback } from 'react';

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="18" x2="12" y2="12"/>
    <polyline points="9 15 12 12 15 15"/>
  </svg>
);

export default function UploadScreen({ onFileLoad }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    const url = URL.createObjectURL(file);
    console.log(`[UploadScreen] File selected: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`[UploadScreen] Created ObjectURL: ${url}`);
    onFileLoad(url, file.name);
  }, [onFileLoad]);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="upload-screen fade-in">
      {/* Header */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px',
        }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 12px var(--accent-glow)',
          }} />
          <span style={{
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontWeight: '600',
          }}>
            Teaching Studio
          </span>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 12px var(--accent-glow)',
          }} />
        </div>
        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #fff 0%, #8888cc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-1px',
          lineHeight: '1.2',
        }}>
          SlideTeach
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '8px' }}>
          PDF Slide Viewer with Drawing Tools
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`upload-area${isDragging ? ' drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          width: '420px',
          maxWidth: '90vw',
          padding: '48px 32px',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.02)',
          cursor: 'pointer',
          textAlign: 'center',
          userSelect: 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="pulse-glow" style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'rgba(108, 99, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: 'var(--accent)',
        }}>
          <UploadIcon />
        </div>

        <p style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Drop your PDF here
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          or click to browse files
        </p>

        <div style={{
          display: 'inline-block',
          padding: '10px 28px',
          borderRadius: '10px',
          background: 'var(--accent)',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 20px var(--accent-glow)',
          transition: 'all 0.2s ease',
        }}>
          Choose PDF File
        </div>

        <p style={{ fontSize: '11px', color: 'rgba(136,136,170,0.5)', marginTop: '20px' }}>
          Supports PDF files only
        </p>
      </div>

      {/* Feature hints */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginTop: '40px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '500px',
      }}>
        {[
          { icon: '✏️', text: 'Draw & Annotate' },
          { icon: '🔆', text: 'Highlight Text' },
          { icon: '⭕', text: 'Circle Answers' },
          { icon: '📽️', text: 'Screen Record' },
        ].map(({ icon, text }) => (
          <div key={text} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}>
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
