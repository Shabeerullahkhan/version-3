import React, { useRef } from 'react';
import './Toolbar.css';

interface ToolbarProps {
  onFileLoad: (file: File) => void;
  onZoomFit: () => void;
  fileName?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onFileLoad,
  onZoomFit,
  fileName = 'No file loaded',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileLoad(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h1 className="title">DWG Editor</h1>
      </div>
      
      <div className="toolbar-section">
        <button className="toolbar-btn" onClick={handleFileClick}>
          Open
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".dxf,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <button className="toolbar-btn" onClick={onZoomFit}>
          Zoom Fit
        </button>
      </div>

      <div className="toolbar-info">
        <span className="file-name">{fileName}</span>
      </div>
    </div>
  );
};

export default Toolbar;
