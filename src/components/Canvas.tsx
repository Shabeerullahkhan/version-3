import React, { useRef, useEffect, useState } from 'react';
import { LineEntity, Point } from '../types';

interface CanvasProps {
  entities: LineEntity[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  zoom: number;
  panX: number;
  panY: number;
  onPan: (x: number, y: number) => void;
  measureMode: boolean;
  onMeasurePoint?: (point: Point) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  entities,
  selectedId,
  onSelect,
  zoom,
  panX,
  panY,
  onPan,
  measureMode,
  onMeasurePoint,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const worldToCanvas = (x: number, y: number): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const cx = (x + panX) * zoom + canvas.width / 2;
    const cy = -(y + panY) * zoom + canvas.height / 2;
    return [cx, cy];
  };

  const canvasToWorld = (cx: number, cy: number): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const x = (cx - canvas.width / 2) / zoom - panX;
    const y = -(cy - canvas.height / 2) / zoom - panY;
    return [x, y];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;
    const gridSize = 100 * zoom;
    const offsetX = ((panX * zoom) % gridSize);
    const offsetY = ((panY * zoom) % gridSize);

    for (let i = -1; i < Math.ceil(canvas.width / gridSize) + 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize + offsetX + canvas.width / 2, 0);
      ctx.lineTo(i * gridSize + offsetX + canvas.width / 2, canvas.height);
      ctx.stroke();
    }
    for (let i = -1; i < Math.ceil(canvas.height / gridSize) + 1; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize + offsetY + canvas.height / 2);
      ctx.lineTo(canvas.width, i * gridSize + offsetY + canvas.height / 2);
      ctx.stroke();
    }

    entities.forEach((entity) => {
      const [x1, y1] = worldToCanvas(entity.start.x, entity.start.y);
      const [x2, y2] = worldToCanvas(entity.end.x, entity.end.y);

      ctx.strokeStyle = entity.selected ? '#FF4444' : (hoveredId === entity.id ? '#FF9900' : entity.color);
      ctx.lineWidth = entity.selected ? 3 : 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (entity.selected) {
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [entities, selectedId, hoveredId, zoom, panX, panY, worldToCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (measureMode) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    if (isDragging && !measureMode) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      onPan(panX - dx / zoom, panY + dy / zoom);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (!isDragging) {
      const threshold = 5 / zoom;
      let hovered: string | null = null;

      for (const entity of entities) {
        const [x1, y1] = worldToCanvas(entity.start.x, entity.start.y);
        const [x2, y2] = worldToCanvas(entity.end.x, entity.end.y);

        const dist = pointToLineDistance(cx, cy, x1, y1, x2, y2);
        if (dist < 5) {
          hovered = entity.id;
          break;
        }
      }
      setHoveredId(hovered);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
      return;
    }

    if (measureMode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const [x, y] = canvasToWorld(e.clientX - rect.left, e.clientY - rect.top);
        onMeasurePoint?.({ x, y });
      }
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const threshold = 5;

    for (const entity of entities) {
      const [x1, y1] = worldToCanvas(entity.start.x, entity.start.y);
      const [x2, y2] = worldToCanvas(entity.end.x, entity.end.y);

      const dist = pointToLineDistance(cx, cy, x1, y1, x2, y2);
      if (dist < threshold) {
        onSelect(entity.id);
        return;
      }
    }

    onSelect(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const newZoom = zoom * (1 - e.deltaY * 0.001);
    if (newZoom > 0.1 && newZoom < 100) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const zoomFactor = newZoom / zoom;
        const dx = (e.clientX - rect.left - rect.width / 2) / zoom;
        const dy = -(e.clientY - rect.top - rect.height / 2) / zoom;
        onPan(panX + dx * (1 - zoomFactor), panY + dy * (1 - zoomFactor));
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth - 320}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{
        display: 'block',
        backgroundColor: '#1a1a1a',
        cursor: measureMode ? 'crosshair' : isDragging ? 'grabbing' : hoveredId ? 'pointer' : 'default',
      }}
    />
  );
};

function pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export default Canvas;
