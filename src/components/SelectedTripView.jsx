import React, { useState } from 'react'
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
  Edit2,
  UserPlus,
  Trash2,
  MapPin,
  BarChart3,
  Check,
  Copy,
  MoreHorizontal,
  LogOut,
  UserCog
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
  members,
  membersLoading,
  getInitials,
  currentUserRole,        // Передаємо роль поточного користувача ('OWNER', 'EDITOR', 'MEMBER')
  currentUserId,          // Передаємо ID поточного користувача
  handleDeleteTrip,       // Функція видалення подорожі (для OWNER)
  handleLeaveTrip,        // Функція виходу з подорожі (для MEMBER та EDITOR)
  handleUpdateMemberRole,// Функція зміни ролі (для OWNER)
  handleRemoveMember,     // Функція видалення учасника (для OWNER)
  handleAssignMember      // Функція призначення учасника на пункт підготовки
}) {
  // Локальний стейт для меню дій з учасником та модалки зміни ролі
  const [activeMemberMenu, setActiveMemberMenu] = useState(null)
  const [targetMember, setTargetMember] = useState(null)
  const [selectedRole, setSelectedRole] = useState('MEMBER')
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)

  // Стейт для модалки призначення юзера на підготовку
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [targetPrepForAssign, setTargetPrepForAssign] = useState(null)

  // Нормалізуємо роль (якщо undefined, буде 'MEMBER')
  const normalizedRole = currentUserRole ? String(currentUserRole).toUpperCase().trim() : 'MEMBER'
  
  // Дозволяємо редагування ТІЛЬКИ якщо це OWNER або EDITOR
  const canEdit = normalizedRole === 'OWNER' || normalizedRole === 'EDITOR'

  const onConfirmRoleChange = () => {
    if (targetMember && handleUpdateMemberRole) {
      handleUpdateMemberRole(targetMember.userId, selectedRole)
    }
    setIsRoleModalOpen(false)
    setTargetMember(null)
    setActiveMemberMenu(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ВЕРХНЯ ПАНЕЛЬ НАВІГАЦІЇ ТА ДІЙ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setSelectedTrip(null)} style={styles.backBtn}>
          <ArrowLeft size={18} /> Back to trips
        </button>

        {/* Справа вгорі: Червона кнопка залежно від ролі */}
        {normalizedRole === 'OWNER' ? (
          <button 
            onClick={handleDeleteTrip} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              backgroundColor: '#d32f2f', 
              color: '#fff', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            <Trash2 size={16} /> Видалити подорож
          </button>
        ) : (
          <button 
            onClick={handleLeaveTrip} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              backgroundColor: '#d32f2f', 
              color: '#fff', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
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
        backgroundImage: selectedTrip.coverUrl ? `url(${selectedTrip.coverUrl})` : 'none'
      }}>
        <div style={styles.heroOverlay}>
          <div>
            <span style={styles.heroBadge}>{selectedTrip.status || 'PLANNING'}</span>
            <h2 style={styles.heroTitle}>{selectedTrip.title}</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              {selectedTrip.startDate} — {selectedTrip.endDate}
            </p>
          </div>
        </div>
      </div>

      {/* ВКЛАДКИ ПОЇЗДКИ */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                onClick={() => setPrepFilter('Mine')}
                style={{
                  ...styles.segmentedBtnSmall,
                  ...(prepFilter === 'Mine' ? styles.segmentedBtnActiveSmall : {})
                }}
              >
                Мої
              </button>
            </div>

            {/* Кнопка Додати доступна тільки для OWNER і EDITOR */}
            {canEdit && (
              <button onClick={() => setIsNewPrepOpen(true)} style={styles.primaryBtn}>
                <Plus size={16} /> Додати
              </button>
            )}
          </div>

          {prepLoading ? (
            <div style={styles.loaderContainer}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} color="#ba6e51" />
            </div>
          ) : preparations.length === 0 ? (
            <div style={styles.emptyTripsBox}>
              <Luggage size={36} color="#ba6e51" />
              <p style={{ margin: '12px 0 0 0', fontWeight: '500', color: '#666' }}>
                {canEdit ? 'Натисніть додати, аби створити підготовчий пункт' : 'Немає пунктів підготовки'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {preparations.map(item => {
                const isExpanded = expandedPrepId === item.id
                const isCompleted = item.completed || false
                const assignedMember = members.find(m => m.userId === item.assignedMemberId)

                return (
                  <div key={item.id} style={styles.prepCard}>
                    <div 
                      style={styles.prepCardHeader}
                      onClick={() => setExpandedPrepId(isExpanded ? null : item.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <button 
                          onClick={(e) => handleTogglePrepComplete(item.id, e)} 
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
                          <span style={{ fontSize: '12px', backgroundColor: '#f3ece7', color: '#ba6e51', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>
                            {assignedMember.fullName}
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
                              {assignedMember.fullName}
                            </span>
                          </div>
                        )}

                        {/* Кнопки Призначити / Видалити / Редагувати доступні тільки для OWNER і EDITOR */}
                        {canEdit && (
                          <div style={styles.prepActionsRow}>
                            <button style={styles.prepActionBtn}>
                              <Edit2 size={14} /> Редагувати
                            </button>
                            <button 
                              onClick={() => {
                                setTargetPrepForAssign(item)
                                setIsAssignModalOpen(true)
                              }}
                              style={styles.prepActionBtn}
                            >
                              <UserPlus size={14} /> Призначити
                            </button>
                            <button 
                              onClick={(e) => handleDeletePrepPoint(item.id, e)} 
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
                {selectedTrip.inviteCode || 'Немає коду'}
              </code>
              {selectedTrip.inviteCode && (
                <button 
                  onClick={() => copyInviteCode(selectedTrip.inviteCode)} 
                  style={styles.primaryBtn}
                  title="Скопіювати код"
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
          ) : members.length === 0 ? (
            <div style={styles.emptyTripsBox}>
              <p style={{ color: '#666', margin: 0 }}>Немає учасників</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {members.map((m) => (
                <div key={m.userId} style={{ ...styles.memberRowCard, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.memberAvatar}>
                      {getInitials(m.fullName)}
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

                    {/* Показ 3 крапок ТІЛЬКИ для OWNER і не для самого себе */}
                    {normalizedRole === 'OWNER' && m.userId !== currentUserId && (
                      <div style={{ position: 'relative' }}>
                        <button 
                          onClick={() => setActiveMemberMenu(activeMemberMenu === m.userId ? null : m.userId)}
                          style={styles.moreActionsBtn} 
                          title="Опції"
                        >
                          <MoreHorizontal size={18} color="#666" />
                        </button>

                        {/* Контекстне меню зі 2 пунктами */}
                        {activeMemberMenu === m.userId && (
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '32px',
                            backgroundColor: '#fff',
                            border: '1px solid #e5e5e5',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 20,
                            minWidth: '150px',
                            overflow: 'hidden'
                          }}>
                            <button
                              onClick={() => {
                                setTargetMember(m)
                                setSelectedRole(m.role || 'MEMBER')
                                setIsRoleModalOpen(true)
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '10px 12px',
                                border: 'none',
                                background: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: '#2b2b2b'
                              }}
                            >
                              <UserCog size={15} /> Змінити роль
                            </button>
                            <button
                              onClick={() => {
                                handleRemoveMember && handleRemoveMember(m.userId)
                                setActiveMemberMenu(null)
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '10px 12px',
                                border: 'none',
                                background: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: '#d32f2f',
                                borderTop: '1px solid #f0f0f0'
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

      {/* МОДАЛЬНЕ ВІКНО ЗМІНИ РОЛІ */}
      {isRoleModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', minWidth: '320px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
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

      {/* МОДАЛЬНЕ ВІКНО ПРИЗНАЧЕННЯ УЧАСНИКА */}
      {isAssignModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', minWidth: '340px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#2b2b2b' }}>
              Призначити учасника
            </h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px 0' }}>
              Оберіть учасника для пункту: <b>{targetPrepForAssign?.title}</b>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
              {members.map(m => (
                <button
                  key={m.userId}
                  onClick={() => {
                    if (handleAssignMember && targetPrepForAssign) {
                      handleAssignMember(targetPrepForAssign.id, m.userId)
                    }
                    setIsAssignModalOpen(false)
                    setTargetPrepForAssign(null)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e5e5',
                    background: '#f9f9f9',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#2b2b2b'
                  }}
                >
                  <div style={{ ...styles.memberAvatar, width: '28px', height: '28px', fontSize: '12px' }}>
                    {getInitials(m.fullName)}
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