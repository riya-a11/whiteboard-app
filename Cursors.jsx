import React from 'react';

const Cursors = ({ cursors }) => {
  return (
    <div className="cursors">
      {Object.values(cursors).map((cursor) => (
        <div 
          key={cursor.user.id}
          className="cursor"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            backgroundColor: cursor.user.color
          }}
        >
          <span className="cursor-name">{cursor.user.name}</span>
        </div>
      ))}
    </div>
  );
};

export default Cursors;
