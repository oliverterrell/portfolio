'use client';

import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';

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
  confidence: 'high' | 'medium' | 'low';
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
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Close context menu when clicking outside
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
            setRectangles([]);
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

      rectangles.forEach((rect) => {
        ctx.strokeStyle = getConfidenceColor(rect.confidence);
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
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

  const _updateCanvas = (updatedRectangles) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && imageRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0);
      updatedRectangles.forEach((rect) => {
        ctx.strokeStyle = getConfidenceColor(rect.confidence);
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setContextMenu(null);
    const pos = getMousePos(canvas, e);
    setIsDrawing(true);
    setStartPoint(pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const pos = getMousePos(canvasRef.current, e);
    drawCanvas();

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = getConfidenceColor('high');
      ctx.lineWidth = 2;
      ctx.strokeRect(startPoint.x, startPoint.y, pos.x - startPoint.x, pos.y - startPoint.y);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const pos = getMousePos(canvasRef.current, e);
    const width = Math.abs(pos.x - startPoint.x);
    const height = Math.abs(pos.y - startPoint.y);

    setIsDrawing(false);

    // Only create rectangle if it has some size
    if (width > 5 && height > 5) {
      const newRect: Rectangle = {
        id: Math.random().toString(36).substr(2, 9),
        x: Math.min(startPoint.x, pos.x),
        y: Math.min(startPoint.y, pos.y),
        width,
        height,
        confidence: 'high',
      };

      const updatedRectangles = [...rectangles, newRect];
      setRectangles(updatedRectangles);

      setContextMenu({
        x: e.pageX,
        y: e.pageY,
        rectangleId: newRect.id,
      });

      _updateCanvas(updatedRectangles);
    }
  };

  const handleConfidenceChange = (rectangleId: string, confidence: Rectangle['confidence']) => {
    const updatedRectangles = rectangles.map((rect) =>
      rect.id === rectangleId ? { ...rect, confidence } : rect
    );
    setRectangles(updatedRectangles);

    _updateCanvas(updatedRectangles);
  };

  const handleDeleteRectangle = (rectangleId: string) => {
    const updatedRectangles = rectangles.filter((rect) => rect.id !== rectangleId);
    setRectangles(updatedRectangles);
    setContextMenu(null);

    _updateCanvas(updatedRectangles);
  };

  const handleSave = async () => {
    if (!images[currentImageIndex]) return;

    try {
      const annotationData = {
        imageId: images[currentImageIndex].id,
        annotations: rectangles.map(({ id, ...rect }) => rect),
      };

      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(annotationData),
      });

      if (response.ok) {
        if (currentImageIndex < images.length - 1) {
          setCurrentImageIndex(currentImageIndex + 1);
          setRectangles([]);
          setContextMenu(null);
        }
      }
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

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">todo todo todo</div>

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
              <select
                value={rectangles.find((r) => r.id === contextMenu.rectangleId)?.confidence ?? 'high'}
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
