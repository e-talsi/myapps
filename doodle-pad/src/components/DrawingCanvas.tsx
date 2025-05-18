// src/components/DrawingCanvas.tsx
"use client";

import React, { useRef, useEffect, useState, useImperativeHandle, useCallback } from 'react';

interface DrawingCanvasProps {
  strokeColor: string;
  strokeWidth: number;
  tool: 'pencil' | 'eraser';
  className?: string;
}

export interface DrawingCanvasRef {
  clear: () => void;
  getDataURL: (type?: string, quality?: number) => string;
  loadDataURL: (dataURL: string) => Promise<void>;
}

const DrawingCanvas = React.forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ strokeColor, strokeWidth, tool, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const prepareCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || !containerRef.current) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = containerRef.current.getBoundingClientRect();
      
      let oldDrawingDataUrl: string | null = null;
      if (canvas.width > 0 && canvas.height > 0 && contextRef.current) {
        // Capture current drawing before resize, if canvas was initialized
        oldDrawingDataUrl = canvas.toDataURL();
      }

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext('2d');
      if (!context) return;
      context.scale(dpr, dpr);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context; // Update contextRef immediately
      
      if (oldDrawingDataUrl) {
        const img = new Image();
        img.onload = () => {
          if (contextRef.current) { // Ensure context is still valid
            const prevOp = contextRef.current.globalCompositeOperation;
            contextRef.current.globalCompositeOperation = 'source-over';
            contextRef.current.clearRect(0, 0, rect.width, rect.height);
            contextRef.current.drawImage(img, 0, 0, rect.width, rect.height);
            contextRef.current.globalCompositeOperation = prevOp; // Restore for subsequent tool application
          }
        };
        img.src = oldDrawingDataUrl;
      } else {
        // Fill with white background if new or cleared
        const prevOp = context.globalCompositeOperation;
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = '#FFFFFF'; 
        context.fillRect(0, 0, rect.width, rect.height);
        context.globalCompositeOperation = prevOp; // Restore
      }
      // Tool properties (color, width, operation) will be re-applied by their dedicated useEffect.
    }, []);

    useEffect(() => {
      prepareCanvas();
      const resizeObserver = new ResizeObserver(prepareCanvas);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      return () => resizeObserver.disconnect();
    }, [prepareCanvas]);

    useEffect(() => {
      if (contextRef.current) {
        contextRef.current.strokeStyle = strokeColor;
        contextRef.current.lineWidth = strokeWidth;
        contextRef.current.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      }
    }, [strokeColor, strokeWidth, tool]);

    const getCoordinates = (event: MouseEvent | globalThis.TouchEvent): { offsetX?: number; offsetY?: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return {};
      const rect = canvas.getBoundingClientRect();

      let interactionX: number;
      let interactionY: number;

      if (event instanceof MouseEvent) {
        interactionX = event.clientX;
        interactionY = event.clientY;
      } else if (event.touches && event.touches.length > 0) { // TouchEvent
        interactionX = event.touches[0].clientX;
        interactionY = event.touches[0].clientY;
      } else {
        return {}; // No valid coordinates from this event
      }
      return { offsetX: interactionX - rect.left, offsetY: interactionY - rect.top };
    };

    const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
      const { offsetX, offsetY } = getCoordinates(nativeEvent);
      if (!contextRef.current || offsetX === undefined || offsetY === undefined) return;
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    };

    const draw = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || !contextRef.current) return;
      const { offsetX, offsetY } = getCoordinates(nativeEvent);
      if (offsetX === undefined || offsetY === undefined) return;
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    };

    const finishDrawing = () => {
      if (!contextRef.current) return;
      contextRef.current.closePath();
      setIsDrawing(false);
    };
    
    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (canvas && context) {
          const dpr = window.devicePixelRatio || 1;
          const logicalWidth = canvas.width / dpr;
          const logicalHeight = canvas.height / dpr;
          
          const prevOperation = context.globalCompositeOperation;
          context.globalCompositeOperation = 'source-over'; // Ensure drawing over
          context.fillStyle = '#FFFFFF'; // Background color
          context.fillRect(0, 0, logicalWidth, logicalHeight);
          context.globalCompositeOperation = prevOperation; // Restore
        }
      },
      getDataURL: (type = 'image/png', quality = 1.0) => {
        const canvas = canvasRef.current;
        if (!canvas) return '';
        return canvas.toDataURL(type, quality);
      },
      loadDataURL: (dataURL: string) => {
        return new Promise<void>((resolve, reject) => {
          const canvas = canvasRef.current;
          const context = contextRef.current;
          if (!canvas || !context) {
            return reject(new Error("Canvas not ready"));
          }

          const img = new Image();
          img.onload = () => {
            const dpr = window.devicePixelRatio || 1;
            const logicalWidth = canvas.width / dpr;
            const logicalHeight = canvas.height / dpr;
            
            const prevOperation = context.globalCompositeOperation;
            context.globalCompositeOperation = 'source-over';

            context.clearRect(0, 0, logicalWidth, logicalHeight);
            context.drawImage(img, 0, 0, logicalWidth, logicalHeight);
            
            context.globalCompositeOperation = prevOperation;
            resolve();
          };
          img.onerror = () => {
            console.error("DrawingCanvas: Failed to load image from data URL");
            reject(new Error("Failed to load image into canvas"));
          };
          img.src = dataURL;
        });
      },
    }));

    return (
      <div ref={containerRef} className={`w-full h-full touch-none ${className || ''}`}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={finishDrawing}
          onMouseLeave={finishDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={finishDrawing}
          className="bg-white rounded-md shadow-lg"
          aria-label="Drawing canvas"
        />
      </div>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';
export default DrawingCanvas;
