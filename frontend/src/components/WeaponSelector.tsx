import React from 'react';
import { Card, Row, Col, Button, Tooltip } from 'antd';
import { useWeaponStore } from '../store/weaponStore';

const WeaponSelector: React.FC = () => {
  const { weapons, selectedWeapon, setSelectedWeapon } = useWeaponStore();
  
  return (
    <div style={{ 
      position: 'fixed', 
      right: '16px', 
      bottom: '16px', 
      zIndex: 10 
    }}>
      <Card 
        title="武器库" 
        className="weapon-selector-card"
        styles={{ 
          header: { padding: '8px 16px', backgroundColor: '#333', color: '#fff' },
          body: { padding: '8px', backgroundColor: '#333' }
        }}
        size="small"
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {weapons.map((weapon) => (
            <Tooltip key={weapon.id} title={weapon.description} placement="left">
              <Button
                type={selectedWeapon === weapon.id ? 'primary' : 'default'}
                onClick={() => setSelectedWeapon(weapon.id)}
                className="weapon-button"
                size="small"
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '4px',
                  margin: '4px'
                }}
              >
                <div style={{ fontSize: '24px' }}>{weapon.icon || '⚔️'}</div>
                <div style={{ fontSize: '12px' }}>{weapon.name}</div>
              </Button>
            </Tooltip>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WeaponSelector;