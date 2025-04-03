import React from 'react';

const Toolbar = ({ tool, color, onToolChange, onColorChange, onUndo, onRedo }) => {
  return (
    <div className="toolbar">
      <button 
        className={tool === 'pencil' ? 'active' : ''} 
        onClick={() => onToolChange('pencil')}
      >
        Pencil
      </button>
      <button 
        className={tool === 'rectangle' ? 'active' : ''} 
        onClick={() => onToolChange('rectangle')}
      >
        Rectangle
      </button>
      <button 
        className={tool === 'circle' ? 'active' : ''} 
        onClick={() => onToolChange('circle')}
      >
        Circle
      </button>
      <button 
        className={tool === 'eraser' ? 'active' : ''} 
        onClick={() => onToolChange('eraser')}
      >
        Eraser
      </button>
      
      <input 
        type="color" 
        value={color} 
        onChange={(e) => onColorChange(e.target.value)} 
      />
      
      <button onClick={onUndo}>Undo</button>
      <button onClick={onRedo}>Redo</button>
    </div>
  );
};

export default Toolbar;
