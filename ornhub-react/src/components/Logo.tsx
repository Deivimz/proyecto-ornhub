// src/components/Logo.tsx

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const fontSizeMap = { sm: '20px', md: '26px', lg: '3rem' };
  const fontSize = fontSizeMap[size];

  return (
    <div style={{ fontSize, fontWeight: 900, letterSpacing: '-1px', display: 'flex', alignItems: 'center' }}>
      Orn<span style={{
        backgroundColor: '#ffa31a',
        color: '#000',
        padding: size === 'lg' ? '5px 10px' : '2px 6px',
        borderRadius: '4px',
        marginLeft: '4px',
        fontWeight: 'bold'
      }}>Hub</span>
    </div>
  );
};

export default Logo;
