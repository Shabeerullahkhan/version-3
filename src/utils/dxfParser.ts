import { LineEntity, DWGFile, Point } from '../types';
import { calculateBounds } from './geometry';

const DXF_COLOR_MAP: Record<number, string> = {
  1: '#FF0000',
  2: '#FFFF00',
  3: '#00FF00',
  4: '#00FFFF',
  5: '#FF00FF',
  6: '#FFFFFF',
  7: '#000000',
  8: '#808080',
};

function colorNumberToHex(colorNum: number): string {
  if (colorNum === 256) return '#FFFFFF';
  return DXF_COLOR_MAP[colorNum] || '#FFFFFF';
}

export function parseDXF(content: string): DWGFile {
  const lines = content.split('\n').map((line) => line.trim());
  const entities: LineEntity[] = [];
  let currentEntityType = '';
  let entityData: Record<string, any> = {};
  let i = 0;

  while (i < lines.length) {
    const code = parseInt(lines[i], 10);
    i++;
    if (i >= lines.length) break;

    const value = lines[i];
    i++;

    if (code === 0 && value === 'SECTION') {
      continue;
    }

    if (code === 0 && value === 'LINE') {
      currentEntityType = 'LINE';
      entityData = {};
      continue;
    }

    if (code === 0 && currentEntityType === 'LINE') {
      if (entityData.x1 !== undefined && entityData.y1 !== undefined &&
          entityData.x2 !== undefined && entityData.y2 !== undefined) {
        const entity: LineEntity = {
          id: `line-${Date.now()}-${Math.random()}`,
          type: 'LINE',
          start: { x: entityData.x1, y: entityData.y1 },
          end: { x: entityData.x2, y: entityData.y2 },
          color: entityData.color || '#FFFFFF',
          lineWidth: 1,
          layer: entityData.layer || '0',
        };
        entities.push(entity);
      }
      if (value !== 'LINE') {
        currentEntityType = value;
        entityData = {};
      }
      continue;
    }

    if (currentEntityType === 'LINE') {
      if (code === 8) entityData.layer = value;
      if (code === 62) entityData.color = colorNumberToHex(parseInt(value, 10));
      if (code === 10) entityData.x1 = parseFloat(value);
      if (code === 20) entityData.y1 = parseFloat(value);
      if (code === 30) entityData.z1 = parseFloat(value) || 0;
      if (code === 11) entityData.x2 = parseFloat(value);
      if (code === 21) entityData.y2 = parseFloat(value);
      if (code === 31) entityData.z2 = parseFloat(value) || 0;
    }
  }

  if (currentEntityType === 'LINE' && entityData.x1 !== undefined && entityData.y1 !== undefined &&
      entityData.x2 !== undefined && entityData.y2 !== undefined) {
    const entity: LineEntity = {
      id: `line-${Date.now()}-${Math.random()}`,
      type: 'LINE',
      start: { x: entityData.x1, y: entityData.y1 },
      end: { x: entityData.x2, y: entityData.y2 },
      color: entityData.color || '#FFFFFF',
      lineWidth: 1,
      layer: entityData.layer || '0',
    };
    entities.push(entity);
  }

  const bounds = calculateBounds(entities);
  return { entities, bounds };
}

export function parseJSON(content: string): DWGFile {
  const data = JSON.parse(content);
  const entities: LineEntity[] = (data.entities || []).map((e: any, idx: number) => ({
    id: e.id || `line-${idx}`,
    type: 'LINE',
    start: e.start || { x: 0, y: 0 },
    end: e.end || { x: 100, y: 100 },
    color: e.color || '#FFFFFF',
    lineWidth: e.lineWidth || 1,
    layer: e.layer || '0',
  }));

  const bounds = calculateBounds(entities);
  return { entities, bounds };
}

export function parseDrawingFile(content: string, filename: string): DWGFile {
  if (filename.endsWith('.dxf')) {
    return parseDXF(content);
  } else if (filename.endsWith('.json')) {
    return parseJSON(content);
  } else {
    throw new Error('Unsupported file format. Please use .dxf or .json');
  }
}
