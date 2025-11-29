import React from 'react';
import Availability from './Availability';

const MainPanel: React.FC = () => (
  <div>
    <h2 className="text-xl font-bold mb-2">Panel Principal</h2>
    <p>Bienvenido al panel principal del sistema.</p>
    <div className="mt-8">
      <Availability />
    </div>
  </div>
);

export default MainPanel;
