import React, { useEffect, useState } from 'react';

const FireballAnimation: React.FC = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <svg width="300" height="300" viewBox="0 0 300 300">
        <defs>
          <radialGradient id="fireGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#ffff00" />
            <stop offset="40%" stopColor="#ff8c00" />
            <stop offset="100%" stopColor="#ff4500" />
          </radialGradient>
        </defs>
        <g className="fire-group">
          <path className="fire-path" fill="url(#fireGradient)" d="M150,280 Q50,250 100,150 Q130,100 150,50 Q170,100 200,150 Q250,250 150,280 Z">
            <animate attributeName="d" 
              values="
                M150,280 Q50,250 100,150 Q130,100 150,50 Q170,100 200,150 Q250,250 150,280 Z;
                M150,280 Q70,230 120,130 Q150,80 150,30 Q150,80 180,130 Q230,230 150,280 Z;
                M150,280 Q50,250 100,150 Q130,100 150,50 Q170,100 200,150 Q250,250 150,280 Z"
              dur="1s" repeatCount="indefinite" />
          </path>
        </g>
        <circle className="spark" cx="150" cy="150" r="3" fill="#ffffff" />
        <circle className="spark" cx="120" cy="170" r="2" fill="#ffff00" />
        <circle className="spark" cx="180" cy="170" r="2" fill="#ffff00" />
      </svg>
    </div>
  );
};

export default FireballAnimation;