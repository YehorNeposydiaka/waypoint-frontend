import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, MoreVertical, Edit2, Trash2, LogOut } from 'lucide-react'
import { styles } from '../../styles/tripListPageStyles'

export default function TripHeader({
  onBack,
  normalizedRole,
  selectedTrip,
  handleEditTrip,
  handleDeleteTrip,
  handleLeaveTrip
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isOwner = normalizedRole === 'OWNER'

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <button 
        onClick={onBack} 
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#ba6e51', fontWeight: '600', fontSize: '14px'
        }}
      >
        <ArrowLeft size={18} /> Назад до списку
      </button>

      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px',
            padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center'
          }}
        >
          <MoreVertical size={18} color="#666" />
        </button>

        {isMenuOpen && (
          <div style={{
            position: 'absolute', right: 0, top: '100%', marginTop: '6px',
            backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20, minWidth: '160px', overflow: 'hidden'
          }}>
            {isOwner && (
              <>
                <button
                  onClick={() => { setIsMenuOpen(false); if (handleEditTrip) handleEditTrip(selectedTrip); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '10px 12px', border: 'none', background: 'none',
                    textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#2b2b2b'
                  }}
                >
                  <Edit2 size={15} /> Редагувати
                </button>
                <button
                  onClick={() => { setIsMenuOpen(false); if (handleDeleteTrip) handleDeleteTrip(selectedTrip?.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '10px 12px', border: 'none', background: 'none',
                    textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#d32f2f',
                    borderTop: '1px solid #f0f0f0'
                  }}
                >
                  <Trash2 size={15} /> Видалити
                </button>
              </>
            )}

            {!isOwner && (
              <button
                onClick={() => { setIsMenuOpen(false); if (handleLeaveTrip) handleLeaveTrip(selectedTrip?.id); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                  padding: '10px 12px', border: 'none', background: 'none',
                  textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#d32f2f'
                }}
              >
                <LogOut size={15} /> Покинути подорож
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}