import React, { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Plus,
  Loader2,
  Luggage,
  CheckSquare,
  Square,
  Calendar,
  ChevronDown,
  ChevronUp,
  Paperclip,
  UserPlus,
  Trash2,
  MapPin,
  BarChart3,
  Check,
  Copy,
  MoreHorizontal,
  LogOut,
  UserCog,
  Edit,
  Pencil
} from 'lucide-react'
import PlaceholderView from './PlaceholderView'
import { styles } from '../styles/tripListPageStyles'

export default function SelectedTripView({
  selectedTrip,
  setSelectedTrip,
  tripTab,
  setTripTab,
  prepFilter,
  setPrepFilter,
  setIsNewPrepOpen,
  prepLoading,
  preparations,
  expandedPrepId,
  setExpandedPrepId,
  handleTogglePrepComplete,
  handleDeletePrepPoint,
  copyInviteCode,
  copiedCode,
  members = [],
  membersLoading,
  getInitials,
  currentUserRole,
  currentUserId,
  handleDeleteTrip,
  handleEditTrip,
  handleLeaveTrip,
  handleUpdateMemberRole,
  handleRemoveMember,
  handleAssignMember
}) {
  const [activeMemberMenu, setActiveMemberMenu] = useState(null)
  const [targetMember, setTargetMember] = useState(null)
  const [selectedRole, setSelectedRole] = useState('MEMBER')
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [targetPrepForAssign, setTargetPrepForAssign] = useState(null)

  // Стейт для випадаючого меню дій з подорожжю (редагувати/видалити)
  const [isTripMenuOpen, setIsTripMenuOpen] = useState(false)

  // Фільтр по конкретному юзеру
  const [prepUserFilter, setPrepUserFilter] = useState('All')

  // Локальний стейт для завдань задля миттєвого відображення (optimistic update)
  const [localPreparations, setLocalPreparations] = useState(preparations || [])

  const menuRef = useRef(null)
  const tripMenuRef = useRef(null)

  // Синхронізуємо локальний стейт, коли пропси змінюються ззовні
  useEffect(() => {
    setLocalPreparations(preparations || [])
  }, [preparations])

  // Закриття контекстних меню при кліку поза ними
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMemberMenu(null)
      }
      if (tripMenuRef.current && !tripMenuRef.current.contains(event.target)) {
        setIsTripMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const normalizedRole = currentUserRole ? String(currentUserRole).toUpperCase().trim() : 'MEMBER'
  const canEdit = normalizedRole === 'OWNER' || normalizedRole === 'EDITOR'

  // Підтвердження зміни ролі
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

  // Підтвердження призначення учасника на пункт
  const onConfirmAssign = async (userId) => {
    try {
      if (targetPrepForAssign && handleAssignMember) {
        await handleAssignMember(targetPrepForAssign.id, userId)
      }
    } catch (error) {
      console.error('[ERROR] Помилка призначення відповідального:', error)
    } finally {
      setIsAssignModalOpen(false)
      setTargetPrepForAssign(null)
    }
  }

  const onToggleComplete = async (prepId) => {
    // Оптимістичне оновлення
    setLocalPreparations(prev =>
      prev.map(item =>
        item.id === prepId ? { ...item, completed: !item.completed } : item
      )
    )

    try {
      if (handleTogglePrepComplete) {
        const updated = await handleTogglePrepComplete(prepId)
        if (updated) {
          setLocalPreparations(prev =>
            prev.map(item =>
              item.id === prepId
                ? { ...item, completed: updated.completed ?? updated.isCompleted ?? item.completed }
                : item
            )
          )
        }
      }
    } catch (error) {
      console.error('[ERROR] Помилка зміни статусу завдання:', error)
      setLocalPreparations(preparations || [])
    }
  }

  const onDeletePrep = async (prepId) => {
    setLocalPreparations(prev => prev.filter(item => item.id !== prepId))
    try {
      if (handleDeletePrepPoint) {
        await handleDeletePrepPoint(prepId)
      }
    } catch (error) {
      console.error('[ERROR] Помилка видалення пункту:', error)
      setLocalPreparations(preparations || [])
    }
  }

  const onRemoveMemberClick = (userId) => {
    if (handleRemoveMember) {
      handleRemoveMember(userId)
    }
    setActiveMemberMenu(null)
  }

  const onCopyCodeClick = (code) => {
    copyInviteCode(code)
  }

  // Фільтрація завдань (статус + користувач) на основі локального масиву
  const filteredPreparations = localPreparations.filter(item => {
    const isCompleted = item.completed || false

    // Фільтр по статусу (All / Active / Completed)
    if (prepFilter === 'Active' && isCompleted) return false
    if (prepFilter === 'Completed' && !isCompleted) return false

    // Фільтр по юзеру
    if (prepUserFilter !== 'All') {
      const itemUserId = item.assignedMemberId != null ? String(item.assignedMemberId) : null
      if (itemUserId !== String(prepUserFilter)) return false
    }

    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ВЕРХНЯ ПАНЕЛЬ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button 
          onClick={() => setSelectedTrip(null)} 
          style={styles.backBtn}
        >
          <ArrowLeft size={18} /> Back to trips
        </button>

        {normalizedRole === 'OWNER' ? (
          <div style={{ position: 'relative' }} ref={tripMenuRef}>
            <button 
              onClick={() => setIsTripMenuOpen(prev => !prev)} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                backgroundColor: '#fff', color: '#2b2b2b', border: '1px solid #e5e5e5', 
                padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <MoreHorizontal size={18} /> Меню <ChevronDown size={14} />
            </button>

            {isTripMenuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '40px',
                backgroundColor: '#fff', border: '1px solid #e5e5e5',
                borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                zIndex: 30, minWidth: '160px', overflow: 'hidden'
              }}>
                <button
                  onClick={() => {
                    setIsTripMenuOpen(false)
                    if (handleEditTrip) handleEditTrip(selectedTrip)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '10px 14px', border: 'none',
                    background: 'none', textAlign: 'left', cursor: 'pointer',
                    fontSize: '14px', color: '#2b2b2b'
                  }}
                >
                  <Pencil size={15} color="#4a4a4a" /> Редагувати
                </button>
                <button
                  onClick={() => {
                    setIsTripMenuOpen(false)
                    if (handleDeleteTrip) handleDeleteTrip()
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '10px 14px', border: 'none',
                    background: 'none', textAlign: 'left', cursor: 'pointer',
                    fontSize: '14px', color: '#d32f2f', borderTop: '1px solid #f0f0f0'
                  }}
                >
                  <Trash2 size={15} color="#d32f2f" /> Видалити
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={handleLeaveTrip} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', 
              backgroundColor: '#d32f2f', color: '#fff', border: 'none', 
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              fontWeight: '600', fontSize: '14px'
            }}
          >
            <LogOut size={16} /> Покинути подорож
          </button>
        )}
      </div>

      {/* HERO CARD */}
      <div style={{
        ...styles.heroCard,
        backgroundColor: '#ba6e51',
        backgroundImage: selectedTrip?.coverUrl ? `url(${selectedTrip.coverUrl})` : 'none'
      }}>
        <div style={styles.heroOverlay}>
          <div>
            <span style={styles.heroBadge}>{selectedTrip?.status || 'PLANNING'}</span>
            <h2 style={styles.heroTitle}>{selectedTrip?.title}</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              {selectedTrip?.startDate} — {selectedTrip?.endDate}
            </p>
          </div>
        </div>
      </div>

      {/* ВКЛАДКИ */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <div style={styles.segmentedControl}>
          {[
            { id: 'Preparation', label: 'Підготовка' },
            { id: 'Trip', label: 'Поїздка' },
            { id: 'Stats', label: 'Статистика' },
            { id: 'Members', label: 'Учасники' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTripTab(tab.id)}
              style={{
                ...styles.segmentedBtn,
                ...(tripTab === tab.id ? styles.segmentedBtnActive : {})
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ВКЛАДКА: ПІДГОТОВКА */}
      {tripTab === 'Preparation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
          
          {/* ПАНЕЛЬ ФІЛЬТРІВ ТА КНОПКИ ДОДАТИ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              
              {/* Фільтри статусів: Всі / Актуальні / Виконані */}
              <div style={styles.segmentedControlSmall}>
                <button
                  onClick={() => setPrepFilter('All')}
                  style={{
                    ...styles.segmentedBtnSmall,
                    ...(prepFilter === 'All' ? styles.segmentedBtnActiveSmall : {})
                  }}
                >
                  Всі
                </button>
                <button
                  onClick={() => setPrepFilter('Active')}
                  style={{
                    ...styles.segmentedBtnSmall,
                    ...(prepFilter === 'Active' ? styles.segmentedBtnActiveSmall : {})
                  }}
                >
                  Актуальні
                </button>
                <button
                  onClick={() => setPrepFilter('Completed')}
                  style={{
                    ...styles.segmentedBtnSmall,
                    ...(prepFilter === 'Completed' ? styles.segmentedBtnActiveSmall : {})
                  }}
                >
                  Виконані
                </button>
              </div>

              {canEdit && (
                <button 
                  onClick={() => setIsNewPrepOpen(true)} 
                  style={styles.primaryBtn}
                >
                  <Plus size={16} /> Додати
                </button>
              )}
            </div>

            {/* Випадаючий список фільтрації по юзеру */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Учасник:</span>
              <select
                value={prepUserFilter}
                onChange={(e) => setPrepUserFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5',
                  backgroundColor: '#fff',
                  fontSize: '13px',
                  color: '#2b2b2b',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All">Всі учасники</option>
                {members.map(m => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName || m.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {prepLoading ? (
            <div style={styles.loaderContainer}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} color="#ba6e51" />
            </div>
          ) : filteredPreparations.length === 0 ? (
            <div style={styles.emptyTripsBox}>
              <Luggage size={36} color="#ba6e51" />
              <p style={{ margin: '12px 0 0 0', fontWeight: '500', color: '#666' }}>
                {canEdit ? 'Пункти підготовки відсутні для обраних фільтрів' : 'Немає пунктів підготовки'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredPreparations.map(item => {
                const isExpanded = expandedPrepId === item.id
                const isCompleted = item.completed || false
                
                const assignedMember = members.find(m => 
                  m.userId != null && 
                  item.assignedMemberId != null && 
                  String(m.userId).toLowerCase() === String(item.assignedMemberId).toLowerCase()
                )

                return (
                  <div key={item.id} style={styles.prepCard}>
                    <div 
                      style={styles.prepCardHeader}
                      onClick={() => setExpandedPrepId(isExpanded ? null : item.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleComplete(item.id)
                          }} 
                          style={styles.checkboxBtn}
                        >
                          {isCompleted ? (
                            <CheckSquare size={20} color="#2e7d32" />
                          ) : (
                            <Square size={20} color="#8e8e8e" />
                          )}
                        </button>
                        
                        <span style={{
                          ...styles.prepTitle,
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          color: isCompleted ? '#8e8e8e' : '#2b2b2b'
                        }}>
                          {item.title}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {assignedMember && (
                          <span style={{ fontSize: '13px', color: '#ba6e51', fontWeight: '600' }}>
                            👤 {assignedMember.fullName}
                          </span>
                        )}
                        {item.deadline && (
                          <span style={styles.prepDeadline}>
                            <Calendar size={13} style={{ marginRight: '4px' }} />
                            {new Date(item.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <button style={styles.expandBtn}>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={styles.prepCardBody}>
                        {item.note && (
                          <div style={styles.prepDetailRow}>
                            <span style={styles.prepDetailLabel}>Нотатка:</span>
                            <p style={{ margin: 0, fontSize: '13px', color: '#4a4a4a' }}>{item.note}</p>
                          </div>
                        )}

                        {item.attachmentLink && (
                          <div style={styles.prepDetailRow}>
                            <span style={styles.prepDetailLabel}>Вкладення:</span>
                            <a href={item.attachmentLink} target="_blank" rel="noreferrer" style={styles.prepLink}>
                              <Paperclip size={13} /> {item.attachmentLink}
                            </a>
                          </div>
                        )}

                        {item.cost !== null && item.cost !== undefined && (
                          <div style={styles.prepDetailRow}>
                            <span style={styles.prepDetailLabel}>Вартість:</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#2b2b2b' }}>
                              ${item.cost}
                            </span>
                          </div>
                        )}

                        {assignedMember && (
                          <div style={styles.prepDetailRow}>
                            <span style={styles.prepDetailLabel}>Відповідальний:</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#2b2b2b' }}>
                              {assignedMember.fullName} ({assignedMember.email})
                            </span>
                          </div>
                        )}

                        {canEdit && (
                          <div style={styles.prepActionsRow}>
                            <button 
                              onClick={() => {
                                setTargetPrepForAssign(item)
                                setIsAssignModalOpen(true)
                              }}
                              style={styles.prepActionBtn}
                            >
                              <UserPlus size={14} /> {assignedMember ? 'Змінити відповідального' : 'Призначити'}
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeletePrep(item.id)
                              }} 
                              style={{ ...styles.prepActionBtn, color: '#d32f2f' }}
                            >
                              <Trash2 size={14} /> Видалити
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tripTab === 'Trip' && <PlaceholderView title="Деталі поїздки та маршрут" icon={<MapPin size={40} color="#ba6e51" />} />}
      {tripTab === 'Stats' && <PlaceholderView title="Статистика та витрати" icon={<BarChart3 size={40} color="#ba6e51" />} />}

      {/* ВКЛАДКА: УЧАСНИКИ */}
      {tripTab === 'Members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
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
                  onClick={() => onCopyCodeClick(selectedTrip.inviteCode)} 
                  style={styles.primaryBtn}
                >
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  {copiedCode ? 'Скопійовано' : 'Копіювати'}
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: '#2b2b2b' }}>
              Учасники поїздки ({members.length})
            </h3>
          </div>

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

      {/* МОДАЛКА ПРИЗНАЧЕННЯ УЧАСНИКА */}
      {isAssignModalOpen && (
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
              Оберіть учасника для пункту: <b>{targetPrepForAssign?.title}</b>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
              {members.map(m => (
                <button
                  key={m.userId}
                  onClick={() => onConfirmAssign(m.userId)}
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
                onClick={() => {
                  setIsAssignModalOpen(false)
                  setTargetPrepForAssign(null)
                }}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: 'none', cursor: 'pointer' }}
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}