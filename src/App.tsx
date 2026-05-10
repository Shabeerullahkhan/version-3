import React, { useState, useCallback, useEffect } from 'react';
import Canvas from './components/Canvas';
import SidePanel from './components/SidePanel';
import Toolbar from './components/Toolbar';
import { LineEntity, DistanceMeasurement, Point } from './types';
import { parseDrawingFile } from './utils/dxfParser';
import { distanceBetweenLines, calculateBounds } from './utils/geometry';
import './App.css';

const App: React.FC = () => {
  const [entities, setEntities] = useState<LineEntity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [fileName, setFileName] = useState('No file loaded');
  const [measureMode, setMeasureMode] = useState(false);
  const [measureStartId, setMeasureStartId] = useState<string | null>(null);
  const [distance, setDistance] = useState<DistanceMeasurement | null>(null);

  useEffect(() => {
    setEntities((prev) =>
      prev.map((e) => ({
        ...e,
        selected: e.id === selectedId,
      }))
    );
  }, [selectedId]);

  const handleFileLoad = async (file: File) => {
    try {
      const content = await file.text();
      const parsed = parseDrawingFile(content, file.name);
      
      setEntities(parsed.entities);
      setSelectedId(null);
      setDistance(null);
      setMeasureMode(false);
      setMeasureStartId(null);
      setFileName(file.name);
      
      const bounds = parsed.bounds;
      const padding = 20;
      const scale = Math.min(
        (window.innerWidth - 320 - padding * 2) / (bounds.maxX - bounds.minX),
        (window.innerHeight - padding * 2) / (bounds.maxY - bounds.minY)
      );
      
      setZoom(scale);
      setPanX(-(bounds.minX + bounds.maxX) / 2);
      setPanY(-(bounds.minY + bounds.maxY) / 2);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleZoomFit = () => {
    if (entities.length === 0) return;
    
    const bounds = calculateBounds(entities);
    const padding = 20;
    const scale = Math.min(
      (window.innerWidth - 320 - padding * 2) / (bounds.maxX - bounds.minX),
      (window.innerHeight - padding * 2) / (bounds.maxY - bounds.minY)
    );
    
    setZoom(scale);
    setPanX(-(bounds.minX + bounds.maxX) / 2);
    setPanY(-(bounds.minY + bounds.maxY) / 2);
  };

  const handlePan = (x: number, y: number) => {
    setPanX(x);
    setPanY(y);
  };

  const handleMeasure = () => {
    if (!selectedId) return;
    setMeasureMode(!measureMode);
    setMeasureStartId(measureMode ? null : selectedId);
    if (measureMode) {
      setDistance(null);
    }
  };

  const handleSelectMeasureTarget = (id: string) => {
    if (!measureStartId) return;
    if (id === measureStartId) return;
    
    const line1 = entities.find((e) => e.id === measureStartId);
    const line2 = entities.find((e) => e.id === id);
    
    if (line1 && line2) {
      const result = distanceBetweenLines(line1, line2);
      setDistance({
        entity1Id: measureStartId,
        entity2Id: id,
        distance: result.distance,
        nearestPoints: result,
      });
      setMeasureMode(false);
      setMeasureStartId(null);
    }
  };

  const handleSelect = (id: string | null) => {
    if (measureMode && id && id !== measureStartId) {
      handleSelectMeasureTarget(id);
    } else {
      setSelectedId(id);
    }
  };

  const handleClearMeasure = () => {
    setDistance(null);
    setMeasureMode(false);
    setMeasureStartId(null);
  };

  return (
    <div className="app">
      <Toolbar onFileLoad={handleFileLoad} onZoomFit={handleZoomFit} fileName={fileName} />
      <div className="main-content">
        <Canvas
          entities={entities}
          selectedId={measureMode ? measureStartId : selectedId}
          onSelect={handleSelect}
          zoom={zoom}
          panX={panX}
          panY={panY}
          onPan={handlePan}
          measureMode={measureMode}
        />
        <SidePanel
          entities={entities}
          selectedId={selectedId}
          onSelect={handleSelect}
          distance={distance}
          onMeasure={handleMeasure}
          onClearMeasure={handleClearMeasure}
          isMeasuring={measureMode}
        />
      </div>
    </div>
  );
};

export default App;
