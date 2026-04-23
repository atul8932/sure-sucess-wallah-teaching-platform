import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Canvas, PencilBrush, CircleBrush } from 'fabric';

// Custom eraser brush using destination-out compositing
class EraserBrush extends PencilBrush {
  _setBrushStyles(ctx) {
    super._setBrushStyles(ctx);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
  }
  onMouseUp(options) {
    const result = super.onMouseUp(options);
    this.canvas.renderAll();
    return result;
  }
}

const DrawingCanvas = forwardRef(function DrawingCanvas(
  { width, height, tool, color, brushSize },
  ref
) {
  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);

  const historyRef = useRef([]);
  const historyStepRef = useRef(-1);
  const isHistoryActionRef = useRef(false);

  const saveHistory = useCallback(() => {
    if (isHistoryActionRef.current) return;
    const canvas = fabricRef.current;
    if (!canvas) return;
    
    const json = canvas.toJSON(['globalCompositeOperation', 'selectable', 'evented']);
    const nextStep = historyStepRef.current + 1;
    
    // Discard redo stack and add new state
    const newHistory = historyRef.current.slice(0, nextStep);
    newHistory.push(JSON.stringify(json));
    
    // Limit history to 50 steps
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    historyRef.current = newHistory;
    historyStepRef.current = historyRef.current.length - 1;
  }, []);

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      isDrawingMode: true,
      width,
      height,
      selection: false,
      renderOnAddRemove: true,
    });
    // Transparent background
    canvas.backgroundColor = 'transparent';
    canvas.renderAll();
    fabricRef.current = canvas;

    // Initial state
    historyRef.current = [JSON.stringify(canvas.toJSON(['globalCompositeOperation']))];
    historyStepRef.current = 0;

    const handlePathCreated = (e) => {
      const path = e.path;
      // If we are using the eraser, the path needs to have the composite operation set
      // so it's preserved during JSON serialization/deserialization
      if (canvas.freeDrawingBrush instanceof EraserBrush) {
        path.set('globalCompositeOperation', 'destination-out');
      }
      saveHistory();
    };

    canvas.on('path:created', handlePathCreated);
    canvas.on('object:modified', saveHistory);
    canvas.on('object:removed', saveHistory);

    return () => {
      canvas.off('path:created', handlePathCreated);
      canvas.off('object:modified', saveHistory);
      canvas.off('object:removed', saveHistory);
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveHistory]);

  // Resize canvas when dimensions change
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !width || !height) return;
    canvas.setDimensions({ width, height });
    canvas.renderAll();
  }, [width, height]);

  // Update brush based on tool/color/size
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (tool === 'eraser') {
      const eraser = new EraserBrush(canvas);
      eraser.width = brushSize * 3;
      eraser.color = 'rgba(0,0,0,1)';
      canvas.freeDrawingBrush = eraser;
      canvas.isDrawingMode = true;
    } else if (tool === 'highlighter') {
      const brush = new PencilBrush(canvas);
      brush.width = brushSize * 4;
      const r = parseInt(color.slice(1, 3), 16) || 0;
      const g = parseInt(color.slice(3, 5), 16) || 0;
      const b = parseInt(color.slice(5, 7), 16) || 0;
      brush.color = `rgba(${r},${g},${b},0.35)`;
      brush.strokeLineCap = 'square';
      canvas.freeDrawingBrush = brush;
      canvas.isDrawingMode = true;
    } else if (tool === 'circle') {
      const brush = new CircleBrush(canvas);
      brush.width = brushSize;
      brush.color = color;
      canvas.freeDrawingBrush = brush;
      canvas.isDrawingMode = true;
    } else if (tool === 'none') {
      canvas.isDrawingMode = false;
    } else {
      const brush = new PencilBrush(canvas);
      brush.width = brushSize;
      brush.color = color;
      canvas.freeDrawingBrush = brush;
      canvas.isDrawingMode = true;
    }
  }, [tool, color, brushSize]);

  // Expose methods to parent
  const clearCanvas = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = 'transparent';
    canvas.renderAll();
    saveHistory();
  }, [saveHistory]);

  const undo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyStepRef.current <= 0) return;

    isHistoryActionRef.current = true;
    historyStepRef.current -= 1;
    const jsonStr = historyRef.current[historyStepRef.current];
    
    canvas.loadFromJSON(JSON.parse(jsonStr), () => {
      canvas.renderAll();
      isHistoryActionRef.current = false;
    });
  }, []);

  const redo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyStepRef.current >= historyRef.current.length - 1) return;

    isHistoryActionRef.current = true;
    historyStepRef.current += 1;
    const jsonStr = historyRef.current[historyStepRef.current];
    
    canvas.loadFromJSON(JSON.parse(jsonStr), () => {
      canvas.renderAll();
      isHistoryActionRef.current = false;
    });
  }, []);

  const resetHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const initialState = JSON.stringify(canvas.toJSON(['globalCompositeOperation']));
    historyRef.current = [initialState];
    historyStepRef.current = 0;
  }, []);

  useImperativeHandle(ref, () => ({ clearCanvas, undo, redo, resetHistory }), [clearCanvas, undo, redo, resetHistory]);

  return (
    <div className="drawing-canvas-container" style={{ pointerEvents: tool === 'none' ? 'none' : 'auto' }}>
      <canvas ref={canvasElRef} style={{ display: 'block' }} />
    </div>
  );
});

export default DrawingCanvas;
