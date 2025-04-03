import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Toolbar from './Toolbar';
import Cursors from './Cursors';

const socket = io('http://localhost:4000');

const Whiteboard = ({ sessionId, user }) => {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    setCtx(context);
    
    // Set canvas dimensions
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    
    // Join whiteboard session
    socket.emit('join', { sessionId, user });
    
    // Setup event listeners
    socket.on('remoteDraw', handleRemoteDraw);
    socket.on('remoteUndo', handleRemoteUndo);
    socket.on('remoteRedo', handleRemoteRedo);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('loadBoard', handleLoadBoard);
    
    // Track cursor movement
    canvas.addEventListener('mousemove', handleCursorMove);
    
    return () => {
      socket.off('remoteDraw');
      socket.off('remoteUndo');
      socket.off('remoteRedo');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('loadBoard');
      canvas.removeEventListener('mousemove', handleCursorMove);
    };
  }, []);
  
  // Drawing functions
  const startDrawing = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    
    if (tool === 'pencil') {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
    }
    
    // Save initial state for shapes
    setElements([...elements, { tool, color, lineWidth, points: [{x: offsetX, y: offsetY}] }]);
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    
    switch(tool) {
      case 'pencil':
        ctx.lineTo(offsetX, offsetY);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        
        // Update last element
        const lastElement = elements[elements.length - 1];
        lastElement.points.push({x: offsetX, y: offsetY});
        break;
      // Other tools...
    }
  };
  
  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (tool === 'pencil') {
      ctx.closePath();
    }
    
    // Save to history
    saveToHistory();
    
    // Emit to server
    socket.emit('draw', {
      element: elements[elements.length - 1],
      sessionId
    });
  };
  
  // Real-time collaboration handlers
  const handleRemoteDraw = (data) => {
    drawElement(data.element);
    setElements([...elements, data.element]);
  };
  
  const handleRemoteUndo = () => {
    if (elements.length > 0) {
      setElements(elements.slice(0, -1));
      redrawCanvas();
    }
  };
  
  const handleRemoteRedo = () => {
    // Implement based on your history structure
  };
  
  const handleCursorMove = (e) => {
    const { offsetX, offsetY } = e;
    socket.emit('cursorMove', { x: offsetX, y: offsetY, user, sessionId });
  };
  
  // Toolbar functions
  const handleUndo = () => {
    if (elements.length > 0) {
      setElements(elements.slice(0, -1));
      redrawCanvas();
      socket.emit('undo', sessionId);
      saveToHistory();
    }
  };
  
  const handleRedo = () => {
    // Implement based on your history structure
    socket.emit('redo', sessionId);
  };
  
  const changeTool = (newTool) => {
    setTool(newTool);
  };
  
  const changeColor = (newColor) => {
    setColor(newColor);
  };
  
  return (
    <div className="whiteboard-container">
      <Toolbar 
        tool={tool} 
        color={color}
        onToolChange={changeTool}
        onColorChange={changeColor}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      
      <div className="canvas-container">
        <Cursors cursors={remoteCursors} />
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
        />
      </div>
      
      <div className="user-list">
        {/* Display active users */}
      </div>
    </div>
  );
};

export default Whiteboard;
