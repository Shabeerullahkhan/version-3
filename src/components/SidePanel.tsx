import React from 'react';
import { LineEntity, DistanceMeasurement } from '../types';
import './SidePanel.css';

interface SidePanelProps {
  entities: LineEntity[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  distance: DistanceMeasurement | null;
  onMeasure: () => void;
  onClearMeasure: () => void;
  isMeasuring: boolean;
}

const SidePanel: React.FC<SidePanelProps> = ({
  entities,
  selectedId,
  onSelect,
  distance,
  onMeasure,
  onClearMeasure,
  isMeasuring,
}) => {
  const selected = entities.find((e) => e.id === selectedId);

  return (
    <div className="side-panel">
      <div className="panel-section">
        <h2>Properties</h2>
        {selected ? (
          <div className="properties">
            <div className="prop-group">
              <label>Layer:</label>
              <span>{selected.layer}</span>
            </div>
            <div className="prop-group">
              <label>Start:</label>
              <span className="coords">
                ({selected.start.x.toFixed(2)}, {selected.start.y.toFixed(2)})
              </span>
            </div>
            <div className="prop-group">
              <label>End:</label>
              <span className="coords">
                ({selected.end.x.toFixed(2)}, {selected.end.y.toFixed(2)})
              </span>
            </div>
            <div className="prop-group">
              <label>Color:</label>
              <div className="color-box" style={{ backgroundColor: selected.color }}></div>
              <span>{selected.color}</span>
            </div>
            <div className="prop-group">
              <label>Length:</label>
              <span>
                {Math.sqrt(
                  Math.pow(selected.end.x - selected.start.x, 2) +
                  Math.pow(selected.end.y - selected.start.y, 2)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <p className="no-selection">No line selected</p>
        )}
      </div>

      {selected && (
        <div className="panel-section">
          <button
            className={`measure-btn ${isMeasuring ? 'active' : ''}`}
            onClick={onMeasure}
          >
            {isMeasuring ? 'Measuring...' : 'Measure to Another Line'}
          </button>
        </div>
      )}

      {distance && (
        <div className="panel-section distance-info">
          <h3>Distance Measurement</h3>
          <div className="distance-value">
            {distance.distance.toFixed(2)}
          </div>
          <div className="measure-points">
            <p className="point-label">Point 1:</p>
            <p className="point-coords">
              ({distance.nearestPoints.point1.x.toFixed(2)}, {distance.nearestPoints.point1.y.toFixed(2)})
            </p>
            <p className="point-label">Point 2:</p>
            <p className="point-coords">
              ({distance.nearestPoints.point2.x.toFixed(2)}, {distance.nearestPoints.point2.y.toFixed(2)})
            </p>
          </div>
          <button className="clear-btn" onClick={onClearMeasure}>
            Clear
          </button>
        </div>
      )}

      <div className="panel-section">
        <h3>Lines ({entities.length})</h3>
        <div className="entity-list">
          {entities.map((entity) => (
            <div
              key={entity.id}
              className={`entity-item ${selectedId === entity.id ? 'active' : ''}`}
              onClick={() => onSelect(entity.id)}
            >
              <div className="entity-color" style={{ backgroundColor: entity.color }}></div>
              <div className="entity-info">
                <div className="entity-name">{entity.layer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
