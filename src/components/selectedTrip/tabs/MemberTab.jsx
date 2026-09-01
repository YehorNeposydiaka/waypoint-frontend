import React, { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, UserCog, Trash2 } from 'lucide-react'
import { styles } from '../../../styles/tripListPageStyles'

export default function MemberRow({
  member,
  getInitials,
  normalizedRole,
  currentUserId,
  onOpenRoleModal,
  handleRemoveMember
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isSelf = String(member.userId) === String(currentUserId)
  const canManage = normalizedRole === 'OWNER' && !isSelf

  return (
    <div style={{ ...styles.memberRowCard, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={styles.memberAvatar}>
          {getInitials ? getInitials(member.fullName) : ''}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: '600', fontSize: '14px', color: '#2b2b2b' }}>
            {member.fullName || 'Без імені'} {isSelf && <span style={{ color: '#888', fontWeight: '400' }}>(Ви)</span>}
          </span>
          <span style={styles.roleBadge}>
            {member.role || 'MEMBER'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '12px', color: '#8e8e8e' }}>
          Доданий: {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}
        </span>

        {canManage && (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(prev => !prev)}
              style={styles.moreActionsBtn} 
            >
              <MoreHorizontal size={18} color="#666" />
            </button>

            {isMenuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '32px',
                backgroundColor: '#fff', border: '1px solid #e5e5e5',
                borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 20, minWidth: '150px', overflow: 'hidden'
              }}>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    onOpenRoleModal(member)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '10px 12px', border: 'none',
                    background: 'none', textAlign: 'left', cursor: 'pointer',
                    fontSize: '13px', color: '#2b2b2b'
                  }}
                >
                  <UserCog size={15} /> Змінити роль
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    if (handleRemoveMember) handleRemoveMember(member.userId)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '10px 12px', border: 'none',
                    background: 'none', textAlign: 'left', cursor: 'pointer',
                    fontSize: '13px', color: '#d32f2f', borderTop: '1px solid #f0f0f0'
                  }}
                >
                  <Trash2 size={15} /> Видалити
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}