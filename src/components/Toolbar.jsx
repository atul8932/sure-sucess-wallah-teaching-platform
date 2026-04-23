import { useState } from 'react';

const EXTENDED_COLORS = [
  '#6c63ff', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
  '#ff922b', '#f06595', '#ffffff', '#000000', '#9c27b0',
  '#00bcd4', '#4caf50', '#ffeb3b', '#ff5722', '#795548',
  '#607d8b', '#e91e63', '#3f51b5', '#009688', '#cddc39',
  '#2a0134', '#344c01', '#9c6b00', '#007d82', '#0044ff'

];

const TOOLS = [
  { id: 'pen', label: 'Pen', icon: '✏️', tip: 'Pen (P)' },
  { id: 'highlighter', label: 'Highlighter', icon: '🖌️', tip: 'Highlighter (H)' },
  { id: 'circle', label: 'Circle', icon: '⭕', tip: 'Circle (C)' },
  { id: 'eraser', label: 'Eraser', icon: '⬜', tip: 'Eraser (E)' },
];

// SVG Icons
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ZoomIn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
const ZoomOut = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
const Fullscreen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);
const ExitFullscreen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
  </svg>
);
const Trash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const UndoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
  </svg>
);
const RedoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
  </svg>
);
const PaletteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);
const RecordIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="8" />
  </svg>
);
const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export default function Toolbar({
  fileName,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  tool,
  onToolChange,
  color,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isFullscreen,
  onToggleFullscreen,
  onClearCanvas,
  onUndo,
  onRedo,
  onNewFile,
  isRecording,
  onToggleRecord,
  onOpenSettings,
}) {
  const [showColorPopover, setShowColorPopover] = useState(false);
  return (
    <div className="toolbar">
      {/* File info */}
      <button
        className="tool-btn"
        onClick={onNewFile}
        title="Open new PDF"
        style={{ gap: '4px', width: 'auto', padding: '0 10px', fontSize: '12px', color: 'var(--text-secondary)' }}
      >
        <FileIcon />
        <span style={{
          maxWidth: '120px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'inline-block',
        }}>
          {fileName || 'No file'}
        </span>
        <span className="tooltip">Open new PDF</span>
      </button>

      <div className="toolbar-divider" />

      {/* Navigation */}
      <div className="nav-pill">
        <button
          className="tool-btn"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          style={{ opacity: currentPage <= 1 ? 0.3 : 1 }}
          title="Previous page"
        >
          <ChevronLeft />
          <span className="tooltip">Prev (←)</span>
        </button>

        <div className="page-info">
          <span>{currentPage}</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{totalPages || 1}</span>
        </div>

        <button
          className="tool-btn"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          style={{ opacity: currentPage >= totalPages ? 0.3 : 1 }}
          title="Next page"
        >
          <ChevronRight />
          <span className="tooltip">Next (→)</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Drawing Tools */}
      {TOOLS.map(({ id, icon, tip }) => (
        <button
          key={id}
          className={`tool-btn${tool === id ? ' active' : ''}`}
          onClick={() => onToolChange(id)}
          title={tip}
        >
          <span style={{ fontSize: '14px' }}>{icon}</span>
          <span className="tooltip">{tip}</span>
        </button>
      ))}

      <div className="toolbar-divider" />

      {/* Color selection */}
      <div style={{ position: 'relative' }}>
        <button
          className="tool-btn"
          onClick={() => setShowColorPopover(!showColorPopover)}
          title="Color Palette"
        >
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: color, border: '2px solid rgba(255,255,255,0.2)' }} />
          <span className="tooltip">Color Palette</span>
        </button>

        {showColorPopover && (
          <>
            <div
              style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 90 }}
              onClick={() => setShowColorPopover(false)}
            />
            <div className="color-popover">
              {EXTENDED_COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-swatch${color === c ? ' selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => { onColorChange(c); setShowColorPopover(false); }}
                  title={c}
                />
              ))}
              <input
                type="color"
                className="color-picker-input"
                style={{ width: '22px', height: '22px', marginLeft: 'auto', gridColumn: 'span 5' }}
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                title="Custom color"
              />
            </div>
          </>
        )}
      </div>

      <div className="toolbar-divider" />

      {/* Brush size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: `${Math.min(brushSize + 4, 18)}px`,
          height: `${Math.min(brushSize + 4, 18)}px`,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          boxShadow: `0 0 4px ${color}`,
          transition: 'all 0.2s ease',
        }} />
        <input
          type="range"
          className="brush-slider"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          title="Brush size"
        />
      </div>

      <div className="toolbar-divider" />

      {/* Clear canvas & Undo/Redo */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          className="tool-btn"
          onClick={onUndo}
          title="Undo"
        >
          <UndoIcon />
          <span className="tooltip">Undo</span>
        </button>
        <button
          className="tool-btn"
          onClick={onRedo}
          title="Redo"
        >
          <RedoIcon />
          <span className="tooltip">Redo</span>
        </button>
        <button
          className="tool-btn danger"
          onClick={onClearCanvas}
          title="Clear all drawings"
        >
          <Trash />
          <span className="tooltip">Clear All</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Zoom controls */}
      <button className="tool-btn" onClick={onZoomOut} title="Zoom out">
        <ZoomOut />
        <span className="tooltip">Zoom Out (-)</span>
      </button>
      <button
        className="zoom-label"
        onClick={onZoomReset}
        title="Reset zoom"
        style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-secondary)' }}
      >
        {Math.round(zoom * 100)}%
      </button>
      <button className="tool-btn" onClick={onZoomIn} title="Zoom in">
        <ZoomIn />
        <span className="tooltip">Zoom In (+)</span>
      </button>

      <div className="toolbar-divider" />

      {/* Settings */}
      <button className="tool-btn" onClick={onOpenSettings} title="Settings">
        <SettingsIcon />
        <span className="tooltip">Settings</span>
      </button>

      {/* Record */}
      <button
        className={`tool-btn ${isRecording ? 'recording-active' : ''}`}
        onClick={onToggleRecord}
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        style={{ color: isRecording ? '#ff5050' : 'var(--text-secondary)' }}
      >
        {isRecording ? <StopIcon /> : <RecordIcon />}
        <span className="tooltip">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
      </button>

      {/* Fullscreen */}
      <button
        className={`tool-btn${isFullscreen ? ' active' : ''}`}
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? <ExitFullscreen /> : <Fullscreen />}
        <span className="tooltip">{isFullscreen ? 'Exit (F)' : 'Fullscreen (F)'}</span>
      </button>
    </div>
  );
}
