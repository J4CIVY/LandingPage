'use client';

import React, { useEffect, useState } from 'react';

const StoreDebug: React.FC = () => {
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log('StoreDebug component mounted/updated, render count:', renderCount + 1);
  });

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'red', 
      color: 'white', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px',
      borderRadius: '5px'
    }}>
      Store renders: {renderCount}
    </div>
  );
};

export default StoreDebug;
