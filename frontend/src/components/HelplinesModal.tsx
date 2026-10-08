import React from 'react';
import { PhoneCall, ShieldAlert, Droplets, Trash2, TreePine, AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface HelplinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelplinesModal: React.FC<HelplinesModalProps> = ({ isOpen, onClose }) => {
  const helplines = [
    {
      category: 'Municipal & Civic Emergency',
      title: 'Municipal Control Room & Citizen Dispatch',
      number: '1533',
      available: '24/7 Toll-Free',
      icon: PhoneCall,
      color: '#0f5132',
      bg: '#e8f5e9',
      desc: 'Immediate reporting of severe road blockages, open manholes, and civic hazards.',
    },
    {
      category: 'Environmental Protection',
      title: 'State Pollution Control Emergency Cell',
      number: '1800-425-3434',
      available: '24/7 Dedicated',
      icon: ShieldAlert,
      color: '#d97706',
      bg: '#fef3c7',
      desc: 'Toxic chemical spills, open industrial burning, and heavy smoke hazards.',
    },
    {
      category: 'Water & Sewage Grid',
      title: 'Water Supply Emergency & Pipeline Burst Hotline',
      number: '1916',
      available: '24/7 Toll-Free',
      icon: Droplets,
      color: '#2563eb',
      bg: '#eff6ff',
      desc: 'Drinking water pipeline bursts, sewage overflows, and severe urban waterlogging.',
    },
    {
      category: 'Sanitation & Waste Crisis',
      title: 'Solid Waste & Bio-Hazard Flying Squad',
      number: '080-22660000',
      available: '6:00 AM - 10:00 PM',
      icon: Trash2,
      color: '#059669',
      bg: '#ecfdf5',
      desc: 'Large illegal garbage dumping, biological waste dumping, and carcass removal.',
    },
    {
      category: 'Urban Forestry & Greenery',
      title: 'Tree Fall & Wildlife Hazard Unit',
      number: '1926',
      available: '24/7 State Hotline',
      icon: TreePine,
      color: '#15803d',
      bg: '#f0fdf4',
      desc: 'Storm damage tree fall, dangling hazardous branches, and wildlife rescue.',
    },
    {
      category: 'Disaster Management',
      title: 'State Disaster Management Authority (SDMA)',
      number: '1077',
      available: '24/7 National Emergency',
      icon: AlertTriangle,
      color: '#dc2626',
      bg: '#fef2f2',
      desc: 'Floods, structural collapses, and severe environmental emergencies.',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Emergency Civic & Environmental Helplines">
      <div style={{ padding: '4px 0' }}>
        <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '18px', lineHeight: 1.5 }}>
          For life-threatening or immediate environmental hazards requiring instant municipal dispatch,
          contact the respective public control cells directly:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
          {helplines.map((h, i) => {
            const IconComponent = h.icon;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'border-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: h.bg,
                    color: h.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComponent size={20} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: h.color, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {h.category}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                      {h.available}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: '2px 0 4px' }}>
                    {h.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px', lineHeight: 1.4 }}>
                    {h.desc}
                  </p>

                  <a
                    href={`tel:${h.number.replace(/[^0-9]/g, '')}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: h.color,
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <PhoneCall size={13} />
                    Call {h.number}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default HelplinesModal;
