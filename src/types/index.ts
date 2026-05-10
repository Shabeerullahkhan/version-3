export interface Point {
  x: number;
  y: number;
  z?: number;
}

export interface LineEntity {
  id: string;
  type: 'LINE';
  start: Point;
  end: Point;
  color: string;
  lineWidth: number;
  layer?: string;
  selected?: boolean;
}

export interface DistanceMeasurement {
  entity1Id: string;
  entity2Id: string;
  distance: number;
  nearestPoints: {
    point1: Point;
    point2: Point;
  };
}

export interface DWGFile {
  entities: LineEntity[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}
