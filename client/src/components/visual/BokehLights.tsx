import React from 'react';
import './BokehLights.css';

export const BokehLights: React.FC = () => {
  // Create an array of 5 subtle lights
  const lights = Array.from({ length: 5 });

  return (
    <div className="bokeh-container">
      {lights.map((_, i) => (
        <div key={i} className={`bokeh-light light-${i + 1}`}></div>
      ))}
    </div>
  );
};
