import React, { useState } from 'react';
import { Plus, X, ArrowRight } from 'lucide-react';
import { Card } from '../Common/Card';
import { StatusBadge } from '../Common/StatusBadge';
import { Field } from '../../types';

interface FieldCardProps {
  field: Field;
  onClick?: () => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({ field, onClick }) => {
  const getCropImage = (cropType: string) => {
    switch (cropType.toLowerCase()) {
      case 'wheat':
        return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&h=200&q=80';
      case 'cotton':
        return 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&h=200&q=80';
      case 'rice':
      case 'paddy':
        return 'https://images.unsplash.com/photo-1536657235019-030712665e8a?auto=format&fit=crop&w=400&h=200&q=80';
      case 'corn':
        return 'https://images.unsplash.com/photo-1551754625-70c9024d974e?auto=format&fit=crop&w=400&h=200&q=80';
      default:
        return 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&h=200&q=80';
    }
  };

  return (
    <Card
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        padding: '0px',
        minHeight: '210px',
        border: '1.5px solid var(--border-color)',
        boxShadow: 'none',
      }}
      className="field-card-hover"
    >
      {/* Top Image Banner */}
      <div
        style={{
          height: '110px',
          backgroundImage: `url("${getCropImage(field.cropType)}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          position: 'relative',
          width: '100%'
        }}
      >
        {/* Overlay Status Badge */}
        <div style={{ position: 'absolute', bottom: '8px', left: '10px' }}>
          <StatusBadge status={field.status} size="sm" />
        </div>
      </div>

      {/* Card Content Details */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: '10px' }}>
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>{field.name}</h4>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {field.area} Acres
          </span>
        </div>

        {/* Health Meter Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Healthy {field.health}%</span>
          </div>
          <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${field.health}%`,
                height: '100%',
                backgroundColor: field.status === 'Healthy'
                  ? 'var(--success)'
                  : field.status === 'At Risk'
                    ? 'var(--warning)'
                    : 'var(--critical)',
                borderRadius: '3px',
                transition: 'width var(--transition-normal)'
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

interface AddNewFieldCardProps {
  onClick: () => void;
}

export const AddNewFieldCard: React.FC<AddNewFieldCardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '20px',
        minHeight: '210px',
        height: '100%',
        borderRadius: '20px',
        border: '2px dashed #dcdad0',
        backgroundColor: 'transparent',
        transition: 'all var(--transition-normal)'
      }}
      className="add-field-card-hover"
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        border: '1.5px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
        marginBottom: '10px',
        transition: 'transform var(--transition-fast)'
      }} className="plus-icon-container">
        <Plus size={18} />
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Add New Field</span>
    </div>
  );
};

interface FieldsWidgetProps {
  fields: Field[];
  onAddField: (name: string, area: number, health: number, cropType: string) => void;
}

export const FieldsWidget: React.FC<FieldsWidgetProps> = ({ fields, onAddField }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [cropType, setCropType] = useState('Wheat');
  const [health, setHealth] = useState('80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !area) return;
    onAddField(name, parseFloat(area), parseInt(health), cropType);

    // Reset Form
    setName('');
    setArea('');
    setCropType('Wheat');
    setHealth('80');
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>My Fields</h3>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            border: 'none',
            background: 'none',
            color: 'var(--primary)',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          View All Fields <ArrowRight size={14} />
        </button>
      </div>

      {/* Field Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {fields.map((field) => (
          <FieldCard key={field.id} field={field} />
        ))}
        <AddNewFieldCard onClick={() => setShowModal(true)} />
      </div>

      {/* Add New Field Modal Dialog */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 34, 22, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <Card style={{ maxWidth: '440px', width: '100%', position: 'relative', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px' }}>Register New Field</h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Field Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rice Paddy East"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border-color)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Acreage (Size)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="e.g. 2.4"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border-color)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Crop Cultivated</label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border-color)',
                      outline: 'none',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Rice">Rice (Paddy)</option>
                    <option value="Corn">Corn</option>
                    <option value="Soybeans">Soybeans</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Field Health</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{health}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={health}
                  onChange={(e) => setHealth(e.target.value)}
                  style={{
                    accentColor: 'var(--primary)',
                    cursor: 'pointer',
                    height: '6px',
                    borderRadius: '3px'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px',
                  borderRadius: '30px',
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '10px',
                  boxShadow: '0 4px 10px rgba(46, 125, 50, 0.15)'
                }}
              >
                Add Field Area
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
