// src/components/selectedTrip/SelectedTripView.jsx
import React, { useState, useEffect } from 'react'
import { MapPin, BarChart3 } from 'lucide-react'
import PlaceholderView from '../PlaceholderView'
import TripHeader from './TripHeader'
import TripHeroCard from './TripHeroCard'
import PreparationTab from './tabs/PreparationTab'
import MembersTab from './tabs/MemberTab'
import ChangeRoleModal from './modals/ChangeRoleModal'
import AssignMemberModal from './modals/AssignMemberModal'
import TripModal from '../modals/TripModal'
import { styles } from '../../styles/tripListPageStyles'

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
  handleAssignMember,
  editTripLoading,
  editTripError
}) {
  const [targetMember, setTargetMember] = useState(null)
  const [selectedRole, setSelectedRole] = useState('MEMBER')
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [targetPrepForAssign, setTargetPrepForAssign] = useState(null)
  const [prepUserFilter, setPrepUserFilter] = useState('All')
  const [localPreparations, setLocalPreparations] = useState(preparations || [])

  // Стейт відкриття та даних модалки редагування
  const [isEditTripOpen, setIsEditTripOpen] = useState(false)
  const [editTripData, setEditTripData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    coverFile: null
  })

  useEffect(() => {
    setLocalPreparations(preparations || [])
  }, [preparations])

  const normalizedRole = currentUserRole ? String(currentUserRole).toUpperCase().trim() : 'MEMBER'
  const canEdit = normalizedRole === 'OWNER' || normalizedRole === 'EDITOR'

  // Заповнення форми даними поточного selectedTrip і відкриття модалки
  const onOpenEditModal = () => {
    if (selectedTrip) {
      setEditTripData({
        title: selectedTrip.title || '',
        description: selectedTrip.description || '',
        startDate: selectedTrip.startDate || '',
        endDate: selectedTrip.endDate || '',
        coverFile: null
      })
      setIsEditTripOpen(true)
    }
  }

  // Обробник збереження відредагованої поїздки
  const onSubmitUpdateTrip = async (e) => {
    if (e && e.preventDefault) e.preventDefault()

    if (handleEditTrip) {
      try {
        await handleEditTrip(editTripData)
        setIsEditTripOpen(false)
      } catch (error) {
        console.error('[ERROR] Помилка оновлення поїздки:', error)
      }
    }
  }

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
    }
  }

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
    setLocalPreparations(prev =>
      prev.map(item => item.id === prepId ? { ...item, completed: !item.completed } : item)
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
      if (handleDeletePrepPoint) await handleDeletePrepPoint(prepId)
    } catch (error) {
      console.error('[ERROR] Помилка видалення пункту:', error)
      setLocalPreparations(preparations || [])
    }
  }

  const filteredPreparations = localPreparations.filter(item => {
    const isCompleted = item.completed || false
    if (prepFilter === 'Active' && isCompleted) return false
    if (prepFilter === 'Completed' && !isCompleted) return false
    if (prepUserFilter !== 'All') {
      const itemUserId = item.assignedMemberId != null ? String(item.assignedMemberId) : null
      if (itemUserId !== String(prepUserFilter)) return false
    }
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <TripHeader
        onBack={() => setSelectedTrip(null)}
        normalizedRole={normalizedRole}
        selectedTrip={selectedTrip}
        handleEditTrip={onOpenEditModal}
        handleDeleteTrip={handleDeleteTrip}
        handleLeaveTrip={handleLeaveTrip}
      />

      <TripHeroCard selectedTrip={selectedTrip} />

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

      {tripTab === 'Preparation' && (
        <PreparationTab
          prepFilter={prepFilter}
          setPrepFilter={setPrepFilter}
          prepUserFilter={prepUserFilter}
          setPrepUserFilter={setPrepUserFilter}
          canEdit={canEdit}
          setIsNewPrepOpen={setIsNewPrepOpen}
          prepLoading={prepLoading}
          filteredPreparations={filteredPreparations}
          expandedPrepId={expandedPrepId}
          setExpandedPrepId={setExpandedPrepId}
          members={members}
          onToggleComplete={onToggleComplete}
          onDeletePrep={onDeletePrep}
          onOpenAssignModal={(prep) => {
            setTargetPrepForAssign(prep)
            setIsAssignModalOpen(true)
          }}
        />
      )}

      {tripTab === 'Trip' && <PlaceholderView title="Деталі поїздки та маршрут" icon={<MapPin size={40} color="#ba6e51" />} />}
      {tripTab === 'Stats' && <PlaceholderView title="Статистика та витрати" icon={<BarChart3 size={40} color="#ba6e51" />} />}

      {tripTab === 'Members' && (
        <MembersTab
          selectedTrip={selectedTrip}
          copyInviteCode={copyInviteCode}
          copiedCode={copiedCode}
          members={members}
          membersLoading={membersLoading}
          getInitials={getInitials}
          normalizedRole={normalizedRole}
          currentUserId={currentUserId}
          onOpenRoleModal={(member) => {
            setTargetMember(member)
            setSelectedRole(member.role || 'MEMBER')
            setIsRoleModalOpen(true)
          }}
          handleRemoveMember={handleRemoveMember}
        />
      )}

      {/* Перевикористовувана форма створення/редагування в режимі isEdit */}
      <TripModal
        isOpen={isEditTripOpen}
        onClose={() => setIsEditTripOpen(false)}
        tripData={editTripData}
        setTripData={setEditTripData}
        handleSubmit={onSubmitUpdateTrip}
        loading={editTripLoading}
        error={editTripError}
        isEdit={true}
      />

      <ChangeRoleModal
        isOpen={isRoleModalOpen}
        targetMember={targetMember}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onClose={() => setIsRoleModalOpen(false)}
        onConfirm={onConfirmRoleChange}
      />

      <AssignMemberModal
        isOpen={isAssignModalOpen}
        targetPrep={targetPrepForAssign}
        members={members}
        getInitials={getInitials}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={onConfirmAssign}
      />
    </div>
  )
}