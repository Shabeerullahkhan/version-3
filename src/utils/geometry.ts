import { Point, LineEntity } from '../types';

export function distancePoint(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function closestPointOnSegment(point: Point, segStart: Point, segEnd: Point): Point {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    return { x: segStart.x, y: segStart.y };
  }

  let t = ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  return {
    x: segStart.x + t * dx,
    y: segStart.y + t * dy,
  };
}

export function distanceBetweenLineSegments(
  line1Start: Point,
  line1End: Point,
  line2Start: Point,
  line2End: Point
): { distance: number; point1: Point; point2: Point } {
  let minDistance = Infinity;
  let closestP1 = line1Start;
  let closestP2 = line2Start;

  let p = closestPointOnSegment(line1Start, line2Start, line2End);
  let d = distancePoint(line1Start, p);
  if (d < minDistance) {
    minDistance = d;
    closestP1 = line1Start;
    closestP2 = p;
  }

  p = closestPointOnSegment(line1End, line2Start, line2End);
  d = distancePoint(line1End, p);
  if (d < minDistance) {
    minDistance = d;
    closestP1 = line1End;
    closestP2 = p;
  }

  p = closestPointOnSegment(line2Start, line1Start, line1End);
  d = distancePoint(line2Start, p);
  if (d < minDistance) {
    minDistance = d;
    closestP1 = p;
    closestP2 = line2Start;
  }

  p = closestPointOnSegment(line2End, line1Start, line1End);
  d = distancePoint(line2End, p);
  if (d < minDistance) {
    minDistance = d;
    closestP1 = p;
    closestP2 = line2End;
  }

  return {
    distance: minDistance,
    point1: closestP1,
    point2: closestP2,
  };
}

export function distanceBetweenLines(
  line1: LineEntity,
  line2: LineEntity
): { distance: number; point1: Point; point2: Point } {
  return distanceBetweenLineSegments(line1.start, line1.end, line2.start, line2.end);
}

export function calculateBounds(entities: LineEntity[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (entities.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  entities.forEach((entity) => {
    minX = Math.min(minX, entity.start.x, entity.end.x);
    minY = Math.min(minY, entity.start.y, entity.end.y);
    maxX = Math.max(maxX, entity.start.x, entity.end.x);
    maxY = Math.max(maxY, entity.start.y, entity.end.y);
  });

  const paddingX = (maxX - minX) * 0.1 || 50;
  const paddingY = (maxY - minY) * 0.1 || 50;

  return {
    minX: minX - paddingX,
    minY: minY - paddingY,
    maxX: maxX + paddingX,
    maxY: maxY + paddingY,
  };
}
