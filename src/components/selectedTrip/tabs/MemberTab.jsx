// TripMembersTab.jsx
import React, { useState, useRef, useEffect } from 'react'
import {
  Loader2,
  Check,
  Copy,
  MoreHorizontal,
  UserCog,
  Trash2
} from 'lucide-react'
import { styles } from '../styles/tripListPageStyles'

export default function MemberTab({
  selectedTrip,
  members = [],
  membersLoading,
  copyInviteCode,
  copiedCode,
  getInitials,
  normalizedRole,
  currentUserId,
  handleUpdateMemberRole,
  handleRemoveMember
}) {
  const [activeMemberMenu, setActiveMemberMenu] = useState(null)
  const [targetMember, setTargetMember] = useState(null)
  const [selectedRole, setSelectedRole] = useState('MEMBER')
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)

  const menuRef = useRef(null)

  // Закриття меню дій учасника при кліку зовні
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMemberMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const onConfirmRoleChange = async () => {
    try {
      if (targetMember && handleUpdateMemberRole) {
        await handleUpdateMemberRole(targetMember.userId, selectedRole)
      }
    } catch (error) {
      console.error('[ERROR] Помилка під час зміни ролі:', error)
    } finally {
      setIsRoleModalOpen(false)
      setTargetMember(null)
      setActiveMemberMenu(null)
    }
  }

  const onRemoveMemberClick = (userId) => {
    if (handleRemoveMember) {
      handleRemoveMember(userId)
    }
    setActiveMemberMenu(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
      {/* ПАНЕЛЬ ІНВАЙТ-КОДУ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
        <div>
          <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', color: '#2b2b2b' }}>Інвайт-код для приєднання</h3>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Поділіться цим кодом з друзями, щоб вони могли долучитися до поїздки.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <code style={{ backgroundColor: '#f3ece7', color: '#ba6e51', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', fontSize: '14px' }}>
            {selectedTrip?.inviteCode || 'Немає коду'}
          </code>
          {selectedTrip?.inviteCode && (
            <button 
              onClick={() => copyInviteCode(selectedTrip.inviteCode)} 
              style={styles.primaryBtn}
            >
              {copiedCode ? <Check size={16} /> : <Copy size={16} />}
              {copiedCode ? 'Скопійовано' : 'Копіювати'}
            </button>
          )}
        </div>
      </div>

      {/* ЗАГОЛОВОК СПИСКУ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: '#2b2b2b' }}>
          Учасники поїздки ({members.length})
        </h3>
      </div>

      {/* СПИСОК УЧАСНИКІВ */}
      {membersLoading ? (
        <div style={styles.loaderContainer}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} color="#ba6e51" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {members.map((m) => (
            <div key={m.userId} style={{ ...styles.memberRowCard, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.memberAvatar}>
                  {getInitials ? getInitials(m.fullName) : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px', color: '#2b2b2b' }}>
                    {m.fullName || 'Без імені'}
                  </span>
                  <span style={styles.roleBadge}>
                    {m.role || 'MEMBER'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '12px', color: '#8e8e8e' }}>
                  Доданий: {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '—'}
                </span>

                {normalizedRole === 'OWNER' && String(m.userId) !== String(currentUserId) && (
                  <div style={{ position: 'relative' }} ref={activeMemberMenu === m.userId ? menuRef : null}>
                    <button 
                      onClick={() => setActiveMemberMenu(activeMemberMenu === m.userId ? null : m.userId)}
                      style={styles.moreActionsBtn} 
                    >
                      <MoreHorizontal size={18} color="#666" />
                    </button>

                    {activeMemberMenu === m.userId && (
                      <div style={{
                        position: 'absolute', right: 0, top: '32px',
                        backgroundColor: '#fff', border: '1px solid #e5e5e5',
                        borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 20, minWidth: '150px', overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => {
                            setTargetMember(m)
                            setSelectedRole(m.role || 'MEMBER')
                            setIsRoleModalOpen(true)
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
                          onClick={() => onRemoveMemberClick(m.userId)}
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
          ))}
        </div>
      )}

      {/* МОДАЛКА ЗМІНИ РОЛІ */}
      {isRoleModalOpen && (
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
                onClick={() => setIsRoleModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: 'none', cursor: 'pointer' }}
              >
                Скасувати
              </button>
              <button 
                onClick={onConfirmRoleChange} 
                style={{ ...styles.primaryBtn, padding: '8px 16px' }}
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}