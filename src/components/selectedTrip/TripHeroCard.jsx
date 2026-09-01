import React from 'react'
import { Calendar, MapPin } from 'lucide-react'

export default function TripHeroCard({ selectedTrip }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #e5e5e5',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ba6e51', fontWeight: '600', fontSize: '14px' }}>
        <MapPin size={18} />
        <span>{selectedTrip?.destination || 'Локація не вказана'}</span>
      </div>

      <h1 style={{ margin: 0, fontSize: '24px', color: '#2b2b2b', fontWeight: '700' }}>
        {selectedTrip?.title || selectedTrip?.destination || 'Без назви'}
      </h1>

      {selectedTrip?.description && (
        <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
          {selectedTrip.description}
        </p>
      )}

      {(selectedTrip?.startDate || selectedTrip?.endDate) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#888', marginTop: '4px' }}>
          <Calendar size={15} />
          <span>
            {selectedTrip?.startDate ? new Date(selectedTrip.startDate).toLocaleDateString() : '—'} 
            {' — '} 
            {selectedTrip?.endDate ? new Date(selectedTrip.endDate).toLocaleDateString() : '—'}
          </span>
        </div>
      )}
    </div>
  )
}