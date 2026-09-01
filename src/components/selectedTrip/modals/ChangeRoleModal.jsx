import React from 'react'
import { styles } from '../../../styles/tripListPageStyles'

export default function ChangeRoleModal({
  isOpen,
  targetMember,
  selectedRole,
  setSelectedRole,
  onClose,
  onConfirm
}) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', minWidth: '320px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#2b2b2b' }}>
          Змінити роль для {targetMember?.fullName}
        </h3>
        <select 
          value={selectedRole} 
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '12px 0 20px 0', borderRadius: '6px', border: '1px solid #ccc' }}
        >
          <option value="MEMBER">MEMBER</option>
          <option value="EDITOR">EDITOR</option>
          <option value="OWNER">OWNER</option>
        </select>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: 'none', cursor: 'pointer' }}
          >
            Скасувати
          </button>
          <button 
            onClick={onConfirm} 
            style={{ ...styles.primaryBtn, padding: '8px 16px' }}
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  )
}