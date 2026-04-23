import { useState, useEffect, useRef, useCallback } from 'react';
import UploadScreen from './components/UploadScreen';
import PDFViewer from './components/PDFViewer';
import Toolbar from './components/Toolbar';
import SettingsModal from './components/SettingsModal';

const ZOOM_STEP = 0.15;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3.0;

export default function App() {
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Drawing state
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#6c63ff');
  const [brushSize, setBrushSize] = useState(4);

  // Zoom
  const [zoom, setZoom] = useState(1.0);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const appRef = useRef(null);

  // Recording & Settings
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMic, setSelectedMic] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // DrawingCanvas ref (to call clearCanvas)
  const drawingRef = useRef(null);

  // ── File loading ──────────────────────────────────────────────────
  const handleFileLoad = useCallback((url, name) => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(url);
    setFileName(name);
    setCurrentPage(1);
    setTotalPages(0);
    setZoom(1.0);
  }, [fileUrl]);

  const handleNewFile = useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(null);
    setFileName('');
    setCurrentPage(1);
    setTotalPages(0);
  }, [fileUrl]);

  // ── Navigation ────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  }, []);

  // ── Zoom ──────────────────────────────────────────────────────────
  const zoomIn = useCallback(() => setZoom((z) => Math.min(+(z + ZOOM_STEP).toFixed(2), ZOOM_MAX)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(+(z - ZOOM_STEP).toFixed(2), ZOOM_MIN)), []);
  const zoomReset = useCallback(() => setZoom(1.0), []);

  // ── Fullscreen ────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const docElm = document.documentElement;
        if (docElm.requestFullscreen) {
          docElm.requestFullscreen().catch(err => console.error(err));
        } else if (docElm.webkitRequestFullscreen) {
          docElm.webkitRequestFullscreen();
        } else if (docElm.msRequestFullscreen) {
          docElm.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen API error:', error);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goPrev();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'p':
        case 'P':
          setTool('pen');
          break;
        case 'h':
        case 'H':
          setTool('highlighter');
          break;
        case 'c':
        case 'C':
          setTool('circle');
          break;
        case 'e':
        case 'E':
          setTool('eraser');
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          zoomReset();
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              drawingRef.current?.redo();
            } else {
              drawingRef.current?.undo();
            }
          }
          break;
        case 'y':
        case 'Y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            drawingRef.current?.redo();
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, toggleFullscreen, zoomIn, zoomOut, zoomReset]);

  // ── Clear drawing ─────────────────────────────────────────────────
  const handleClearCanvas = useCallback(() => {
    drawingRef.current?.clearCanvas();
  }, []);

  // ── Recording ─────────────────────────────────────────────────────
  const handleToggleRecord = useCallback(async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    try {
      // 1. Get screen video stream with high quality constraints
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          cursor: 'always',
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
          frameRate: { ideal: 60, max: 60 }
        },
        audio: true // System audio if available
      });

      // 2. Get microphone audio stream
      let micStream = null;
      if (selectedMic) {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: selectedMic } }
        });
      } else {
        // Fallback to default mic if none selected
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      // 3. Combine tracks
      const tracks = [...displayStream.getVideoTracks()];
      
      const audioContext = new AudioContext();
      const dest = audioContext.createMediaStreamDestination();
      
      if (displayStream.getAudioTracks().length > 0) {
        const displayAudioSource = audioContext.createMediaStreamSource(new MediaStream(displayStream.getAudioTracks()));
        displayAudioSource.connect(dest);
      }
      
      if (micStream.getAudioTracks().length > 0) {
        const micAudioSource = audioContext.createMediaStreamSource(new MediaStream(micStream.getAudioTracks()));
        micAudioSource.connect(dest);
      }

      const combinedStream = new MediaStream([...tracks, ...dest.stream.getTracks()]);

      // 4. Setup MediaRecorder with high bitrate
      const options = { 
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: 8000000 // 8 Mbps for high quality
      };
      const mediaRecorder = new MediaRecorder(combinedStream, options);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        setIsRecording(false);
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `lecture-${new Date().getTime()}.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        
        // Stop all tracks
        combinedStream.getTracks().forEach(track => track.stop());
        displayStream.getTracks().forEach(track => track.stop());
        micStream.getTracks().forEach(track => track.stop());
        recordedChunksRef.current = [];
      };

      // Listen for the user stopping sharing via the browser UI
      displayStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      };

      recordedChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // chunk every 1 second
      setIsRecording(true);

    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Failed to start recording. Please check permissions.');
    }
  }, [isRecording, selectedMic]);

  // ── Render ────────────────────────────────────────────────────────
  if (!fileUrl) {
    return <UploadScreen onFileLoad={handleFileLoad} />;
  }

  return (
    <div
      ref={appRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      <Toolbar
        fileName={fileName}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={goPrev}
        onNextPage={goNext}
        tool={tool}
        onToolChange={setTool}
        color={color}
        onColorChange={setColor}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={zoomReset}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onClearCanvas={handleClearCanvas}
        onUndo={() => drawingRef.current?.undo()}
        onRedo={() => drawingRef.current?.redo()}
        onNewFile={handleNewFile}
        isRecording={isRecording}
        onToggleRecord={handleToggleRecord}
        onOpenSettings={() => setShowSettings(true)}
      />

      <PDFViewer
        fileUrl={fileUrl}
        currentPage={currentPage}
        onPageCountLoad={setTotalPages}
        tool={tool}
        color={color}
        brushSize={brushSize}
        zoom={zoom}
        drawingRef={drawingRef}
      />

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        selectedMic={selectedMic}
        onSelectMic={setSelectedMic}
      />
    </div>
  );
}
