'use client';

import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';

interface WhiteboardAnnotations {
  [whiteboardId: string]: Rectangle[];
}

interface ImageData {
  id: string;
  image_url: string;
}

interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // Add this line
  confidence: 'high' | 'medium' | 'low';
  transcription: string;
}

interface ResizeHandle {
  corner: 'nw' | 'ne' | 'se' | 'sw';
  rect: Rectangle;
}

interface Point {
  x: number;
  y: number;
}

interface ContextMenuPosition {
  x: number;
  y: number;
  rectangleId: string;
}

export const ImageAnnotator: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [allAnnotations, setAllAnnotations] = useState<WhiteboardAnnotations>({});
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedRect, setSelectedRect] = useState<Rectangle | null>(null);
  const [isResizing, setIsResizing] = useState<ResizeHandle | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  const currentRectangles = allAnnotations[images[currentImageIndex]?.id] || [];

  const updateCurrentRectangles = (currentRectangles: Rectangle[]) => {
    if (!images[currentImageIndex]) return;
    setAllAnnotations((prev) => ({
      ...prev,
      [images[currentImageIndex].id]: currentRectangles,
    }));
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!e.target || !(e.target as Element).closest('.context-menu')) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedImages = results.data as ImageData[];
          if (parsedImages.length > 0) {
            if (!('id' in parsedImages[0] && 'image_url' in parsedImages[0])) {
              alert('CSV must contain "id" and "image_url" columns');
              setIsUploading(false);
              return;
            }
            setImages(parsedImages);
            setCurrentImageIndex(0);
            updateCurrentRectangles([]);
          }
          setIsUploading(false);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file');
          setIsUploading(false);
        },
      });
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    if (images.length > 0) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = images[currentImageIndex]['image_url'];
      img.onload = () => {
        imageRef.current = img;
        drawCanvas();
      };
    }
  }, [currentImageIndex, images]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && imageRef.current) {
      canvas.width = imageRef.current.width;
      canvas.height = imageRef.current.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0);
      const currentId = images[currentImageIndex]?.id;
      const rectanglesToDraw = currentId ? allAnnotations[currentId] || [] : [];

      rectanglesToDraw.forEach((rect) => {
        ctx.save();

        // Draw rectangle
        ctx.strokeStyle = getConfidenceColor(rect.confidence);
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

        // Draw transcription text
        if (rect.transcription) {
          ctx.font = '14px Arial';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.textBaseline = 'top';
          const padding = 4;
          const textWidth = ctx.measureText(rect.transcription).width + padding * 2;
          ctx.fillRect(rect.x, rect.y - 24, textWidth, 24);
          ctx.fillStyle = 'black';
          ctx.fillText(rect.transcription, rect.x + padding, rect.y - 20);
        }

        if (selectedRect?.id === rect.id) {
          const handleSize = 8;
          const handles = [
            { x: rect.x, y: rect.y }, // nw
            { x: rect.x + rect.width, y: rect.y }, // ne
            { x: rect.x + rect.width, y: rect.y + rect.height }, // se
            { x: rect.x, y: rect.y + rect.height }, // sw
          ];

          handles.forEach((handle) => {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
          });
        }

        ctx.restore();
      });
    }
  };

  const getConfidenceColor = (confidence: Rectangle['confidence']): string => {
    switch (confidence) {
      case 'high':
        return '#22c55e';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#ef4444';
      default:
        return '#000000';
    }
  };

  const _updateCanvas = (updatedRectangles: Rectangle[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && imageRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0);

      updatedRectangles.forEach((rect) => {
        ctx.save();

        ctx.strokeStyle = getConfidenceColor(rect.confidence);
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

        if (rect.transcription) {
          ctx.font = '14px Arial';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.textBaseline = 'top';
          const padding = 4;
          const textWidth = ctx.measureText(rect.transcription).width + padding * 2;
          ctx.fillRect(rect.x, rect.y - 24, textWidth, 24);
          ctx.fillStyle = 'white';
          ctx.fillText(rect.transcription, rect.x + padding, rect.y - 20);
        }

        if (selectedRect?.id === rect.id) {
          const handleSize = 10;
          const handles = [
            { x: rect.x, y: rect.y }, // nw
            { x: rect.x + rect.width, y: rect.y }, // ne
            { x: rect.x + rect.width, y: rect.y + rect.height }, // se
            { x: rect.x, y: rect.y + rect.height }, // sw
          ];

          handles.forEach((handle) => {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
          });
        }

        ctx.restore();
      });
    }
  };

  const getMousePos = (canvas: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const getHandleAtPoint = (x: number, y: number, rect: Rectangle): ResizeHandle | null => {
    const handleSize = 8;
    const handles = [
      { corner: 'nw', x: rect.x, y: rect.y },
      { corner: 'ne', x: rect.x + rect.width, y: rect.y },
      { corner: 'se', x: rect.x + rect.width, y: rect.y + rect.height },
      { corner: 'sw', x: rect.x, y: rect.y + rect.height },
    ];

    for (const handle of handles) {
      if (
        x >= handle.x - handleSize / 2 &&
        x <= handle.x + handleSize / 2 &&
        y >= handle.y - handleSize / 2 &&
        y <= handle.y + handleSize / 2
      ) {
        return { corner: handle.corner as 'nw' | 'ne' | 'se' | 'sw', rect };
      }
    }
    return null;
  };

  const isPointInRotateHandle = (x: number, y: number, rect: Rectangle): boolean => {
    const handleX = rect.x + rect.width / 2;
    const handleY = rect.y - 20;
    const distance = Math.sqrt(Math.pow(x - handleX, 2) + Math.pow(y - handleY, 2));
    return distance <= 5;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getMousePos(canvas, e);

    const currentId = images[currentImageIndex]?.id;
    const rectangles = currentId ? allAnnotations[currentId] || [] : [];

    for (const rect of rectangles) {
      if (selectedRect?.id === rect.id) {
        const handle = getHandleAtPoint(pos.x, pos.y, rect);
        if (handle) {
          setIsResizing(handle);
          return;
        }
      }

      if (pos.x >= rect.x && pos.x <= rect.x + rect.width && pos.y >= rect.y && pos.y <= rect.y + rect.height) {
        setSelectedRect(rect);
        setContextMenu({
          x: e.pageX,
          y: e.pageY,
          rectangleId: rect.id,
        });
        return;
      }
    }

    setIsDrawing(true);
    setStartPoint(pos);
    setSelectedRect(null);
    setContextMenu(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getMousePos(canvas, e);

    if (isResizing && selectedRect) {
      e.preventDefault();

      const { corner, rect } = isResizing;
      const updatedRect = { ...rect };

      switch (corner) {
        case 'nw':
          updatedRect.width = rect.x + rect.width - pos.x;
          updatedRect.height = rect.y + rect.height - pos.y;
          updatedRect.x = pos.x;
          updatedRect.y = pos.y;
          break;
        case 'ne':
          updatedRect.width = pos.x - rect.x;
          updatedRect.height = rect.y + rect.height - pos.y;
          updatedRect.y = pos.y;
          break;
        case 'se':
          updatedRect.width = pos.x - rect.x;
          updatedRect.height = pos.y - rect.y;
          break;
        case 'sw':
          updatedRect.width = rect.x + rect.width - pos.x;
          updatedRect.height = pos.y - rect.y;
          updatedRect.x = pos.x;
          break;
      }

      if (updatedRect.width > 5 && updatedRect.height > 5) {
        const updatedRectangles = currentRectangles.map((r) => (r.id === selectedRect.id ? updatedRect : r));
        updateCurrentRectangles(updatedRectangles);
        setSelectedRect(updatedRect);
        _updateCanvas(updatedRectangles);
      }
      return;
    }

    if (isDrawing) {
      drawCanvas();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = getConfidenceColor('high');
        ctx.lineWidth = 2;
        ctx.strokeRect(startPoint.x, startPoint.y, pos.x - startPoint.x, pos.y - startPoint.y);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isResizing) {
      setIsResizing(null);
      return;
    }

    if (!isDrawing || !canvasRef.current) return;

    const pos = getMousePos(canvasRef.current, e);
    const width = Math.abs(pos.x - startPoint.x);
    const height = Math.abs(pos.y - startPoint.y);

    setIsDrawing(false);

    if (width > 5 && height > 5) {
      const newRect: Rectangle = {
        id: Math.random().toString(36).substr(2, 9),
        x: Math.min(startPoint.x, pos.x),
        y: Math.min(startPoint.y, pos.y),
        width,
        height,
        transcription: '',
        confidence: 'high',
      };

      const updatedRectangles = [...currentRectangles, newRect];
      updateCurrentRectangles(updatedRectangles);
      setSelectedRect(newRect);

      setContextMenu({
        x: e.pageX,
        y: e.pageY,
        rectangleId: newRect.id,
      });

      _updateCanvas(updatedRectangles);
    }
  };

  const handleConfidenceChange = (rectangleId: string, confidence: Rectangle['confidence']) => {
    const updatedRectangles = currentRectangles.map((rect) =>
      rect.id === rectangleId ? { ...rect, confidence } : rect
    );
    updateCurrentRectangles(updatedRectangles);

    _updateCanvas(updatedRectangles);
  };

  const handleTranscriptionChange = (rectangleId: string, transcription: string) => {
    const updatedRectangles = currentRectangles.map((rect) =>
      rect.id === rectangleId ? { ...rect, transcription } : rect
    );
    updateCurrentRectangles(updatedRectangles);
    _updateCanvas(updatedRectangles);
  };

  const handleDeleteRectangle = (rectangleId: string) => {
    const updatedRectangles = currentRectangles.filter((rect) => rect.id !== rectangleId);
    updateCurrentRectangles(updatedRectangles);
    setContextMenu(null);

    _updateCanvas(updatedRectangles);
  };

  const handleExportCSV = () => {
    const exportRows = Object.entries(allAnnotations).flatMap(([whiteboardId, currentRectangles]) =>
      currentRectangles.map((rect) => ({
        whiteboard_id: whiteboardId,
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        transcription: rect.transcription,
        confidence_level: rect.confidence,
      }))
    );

    const headers = ['whiteboard_id', 'x', 'y', 'width', 'height', 'transcription', 'confidence_level'];

    const csvContent = [
      headers.join(','),
      ...exportRows.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `whiteboard_annotations_${images[currentImageIndex].id}.csv`;
    link.click();
  };

  const handleSave = async () => {
    if (!images[currentImageIndex]) return;

    try {
      const currentId = images[currentImageIndex].id;
      setAllAnnotations((prev) => ({
        ...prev,
        [currentId]: currentRectangles,
      }));
      setCurrentImageIndex(currentImageIndex + 1);
      setContextMenu(null);
    } catch (error) {
      console.error('Error saving annotations:', error);
    }
  };

  if (images.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded border p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isUploading ? 'Uploading...' : 'Upload CSV'}
          </button>
          <p className="mt-4 text-gray-600">Upload a CSV file with columns: id, image_url</p>
        </div>
      </div>
    );
  }

  const _countTotalRectangles = () => {
    return Object.values(allAnnotations).reduce((sum, rects) => sum + rects.length, 0);
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handleExportCSV}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Export CSV ({_countTotalRectangles()} transcriptions)
        </button>
      </div>

      <div className="relative overflow-hidden rounded border">
        <canvas
          ref={canvasRef}
          className="h-auto max-w-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)}
        />

        {contextMenu && (
          <div
            className="context-menu absolute rounded border bg-white p-2 shadow-lg"
            style={{
              position: 'fixed',
              left: contextMenu.x + 'px',
              top: contextMenu.y + 'px',
              zIndex: 1000,
            }}
          >
            <div className="flex flex-col gap-2">
              <textarea
                value={currentRectangles.find((r) => r.id === contextMenu.rectangleId)?.transcription || ''}
                onChange={(e) => handleTranscriptionChange(contextMenu.rectangleId, e.target.value)}
                placeholder="Enter transcription..."
                className="mt-2 w-full rounded border p-1 text-black caret-black"
                rows={3}
              />
              <select
                value={currentRectangles.find((r) => r.id === contextMenu.rectangleId)?.confidence ?? 'high'}
                onChange={(e) =>
                  handleConfidenceChange(contextMenu.rectangleId, e.target.value as Rectangle['confidence'])
                }
                className="rounded border p-1 text-black"
              >
                <option value="high">High Confidence</option>
                <option value="medium">Medium Confidence</option>
                <option value="low">Low Confidence</option>
              </select>
              <div className="flex flex-row gap-2">
                <button
                  onClick={() => setContextMenu(null)}
                  className="flex w-full rounded bg-green-500 px-2 py-1 text-center text-white hover:bg-green-600"
                >
                  <div className="w-full text-center">OK</div>
                </button>
                <button
                  onClick={() => handleDeleteRectangle(contextMenu.rectangleId)}
                  className="flex w-full rounded bg-red-500 px-2 py-1 text-center text-white hover:bg-red-600"
                >
                  <div className="w-full text-center">Cancel</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between pt-4">
        <div className="-mt-2 text-gray-600">
          Image {currentImageIndex + 1} of {images.length}
        </div>
        <button onClick={handleSave} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          Save & Next Image
        </button>
      </div>
    </div>
  );
};
