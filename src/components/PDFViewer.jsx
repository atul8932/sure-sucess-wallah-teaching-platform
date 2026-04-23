import { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import DrawingCanvas from './DrawingCanvas';

// Use CDN for worker to avoid local server / Vite bundling issues
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({
  fileUrl,
  currentPage,
  onPageCountLoad,
  tool,
  color,
  brushSize,
  zoom,
  drawingRef,
}) {
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Observe container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ width, height });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Calculate the rendered page size: fit-to-screen with zoom
  const { renderedWidth, renderedHeight } = (() => {
    if (!containerSize.width || !containerSize.height || !pageSize.width || !pageSize.height) {
      return { renderedWidth: 0, renderedHeight: 0 };
    }
    const padding = 32;
    const availW = containerSize.width - padding;
    const availH = containerSize.height - padding;
    const scale = Math.min(availW / pageSize.width, availH / pageSize.height);
    return {
      renderedWidth: Math.floor(pageSize.width * scale * zoom),
      renderedHeight: Math.floor(pageSize.height * scale * zoom),
    };
  })();

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    console.log(`[PDFViewer] Document loaded successfully with ${numPages} pages.`);
    onPageCountLoad(numPages);
  }, [onPageCountLoad]);

  const onDocumentLoadError = useCallback((error) => {
    console.error('[PDFViewer] Error while loading document:', error);
  }, []);

  const onDocumentSourceError = useCallback((error) => {
    console.error('[PDFViewer] Error while loading document source:', error);
  }, []);

  const onPageLoadSuccess = useCallback((page) => {
    console.log(`[PDFViewer] Page ${page.pageNumber} loaded successfully. Size: ${page.width}x${page.height}`);
    setPageSize({ width: page.width, height: page.height });
    setIsLoading(false);
    // Reset drawing and history when page changes
    drawingRef.current?.clearCanvas();
    drawingRef.current?.resetHistory();
  }, [drawingRef]);

  const onPageLoadError = useCallback((error) => {
    console.error('[PDFViewer] Error while loading page:', error);
  }, []);

  return (
    <div className="pdf-container" ref={containerRef}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          zIndex: 5,
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loading PDF…</p>
        </div>
      )}

      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        onSourceError={onDocumentSourceError}
        loading={null}
        error={
          <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>Failed to load PDF</p>
            <p style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-secondary)' }}>
              Please check the console (F12) for error details.
            </p>
          </div>
        }
      >
        <div
          className={`canvas-wrapper ${renderedWidth > 0 ? 'fade-in' : ''}`}
          style={{
            width: renderedWidth > 0 ? `${renderedWidth}px` : 'auto',
            height: renderedHeight > 0 ? `${renderedHeight}px` : 'auto',
            visibility: renderedWidth > 0 ? 'visible' : 'hidden',
          }}
        >
          <Page
            key={`page_${currentPage}`}
            pageNumber={currentPage}
            width={renderedWidth > 0 ? renderedWidth : undefined}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onLoadSuccess={onPageLoadSuccess}
            onLoadError={onPageLoadError}
            loading={null}
          />
          {/* Drawing canvas overlay */}
          {renderedWidth > 0 && (
            <DrawingCanvas
              ref={drawingRef}
              width={renderedWidth}
              height={renderedHeight}
              tool={tool}
              color={color}
              brushSize={brushSize}
            />
          )}
        </div>
      </Document>
    </div>
  );
}
