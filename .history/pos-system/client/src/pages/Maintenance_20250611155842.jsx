import React from 'react';
import './Maintenance.css'; // Optional styling

function Maintenance() {
  return (
    <div className="maintenance-container">
      <h2>Maintenance</h2>
      <div className="maintenance-panel">
        <h3>Maintenance</h3>
        <button className="maintenance-btn">
          <span className="icon">🞤</span> Add a product
        </button>
        <button className="maintenance-btn">
          <span className="icon">✎</span> Edit a product
        </button>
        <button className="maintenance-btn">
          <span className="icon">🗃️</span> Backup
        </button>
      </div>
    </div>
  );
}

export default Maintenance;
