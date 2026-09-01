import React from 'react'
import { styles } from '../../../styles/tripListPageStyles'

export default function AssignMemberModal({
  isOpen,
  targetPrep,
  members = [],
  getInitials,
  onClose,
  onAssign
}) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', minWidth: '340px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#2b2b2b' }}>
          Призначити відповідального
        </h3>
        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px 0' }}>
          Оберіть учасника для пункту: <b>{targetPrep?.title}</b>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
          {members.map(m => (
            <button
              key={m.userId}
              onClick={() => onAssign(m.userId)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #e5e5e5', background: '#f9f9f9',
                textAlign: 'left', cursor: 'pointer', fontSize: '14px'
              }}
            >
              <div style={{ ...styles.memberAvatar, width: '28px', height: '28px', fontSize: '12px' }}>
                {getInitials ? getInitials(m.fullName) : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600' }}>{m.fullName}</span>
                <span style={{ fontSize: '11px', color: '#666' }}>{m.role}</span>
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: 'none', cursor: 'pointer' }}
          >
            Скасувати
          </button>
        </div>
      </div>
    </div>
  )
}