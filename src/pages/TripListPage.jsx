import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

import { styles } from '../styles/tripListPageStyles'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import SelectedTripView from '../components/SelectedTripView'
import TripsDashboardView from '../components/TripsDashboardView'

import NewTripModal from '../components/modals/NewTripModal'
import NewPrepModal from '../components/modals/NewPrepModal'
import SettingsModal from '../components/modals/SettingsModal'

export default function TripListPage() {
  const navigate = useNavigate()

  const [activeNav, setActiveNav] = useState('Current Trips')
  const [isNewTripOpen, setIsNewTripOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const [selectedTrip, setSelectedTrip] = useState(null)
  const [tripTab, setTripTab] = useState('Preparation')

  const [preparations, setPreparations] = useState([])
  const [prepFilter, setPrepFilter] = useState('All')
  const [prepLoading, setPrepLoading] = useState(false)
  const [expandedPrepId, setExpandedPrepId] = useState(null)
  const [isNewPrepOpen, setIsNewPrepOpen] = useState(false)

  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const [currentUserRole, setCurrentUserRole] = useState('MEMBER')

  const [searchQuery, setSearchQuery] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)

  const [newPrepData, setNewPrepData] = useState({
    title: '', note: '', deadline: '', attachmentLink: '', cost: ''
  })
  const [createPrepLoading, setCreatePrepLoading] = useState(false)

  const [user, setUser] = useState(null)
  const [trips, setTrips] = useState([])
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')

  const [fullNameInput, setFullNameInput] = useState('')
  const [updateUserLoading, setUpdateUserLoading] = useState(false)
  const [updateUserMessage, setUpdateUserMessage] = useState({ type: '', text: '' })

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })

  const [newTripData, setNewTripData] = useState({
    title: '', description: '', coverUrl: '', startDate: '', endDate: ''
  })
  const [createTripLoading, setCreateTripLoading] = useState(false)
  const [createTripError, setCreateTripError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [userRes, tripsRes, activitiesRes] = await Promise.all([
        api.get('/api/users/me').catch(() => ({ data: null })),
        api.get('/api/trips').catch(() => ({ data: [] })),
        api.get('/api/activities/recent').catch(() => ({ data: [] }))
      ])

      if (userRes?.data) {
        setUser(userRes.data)
        setFullNameInput(userRes.data.fullName || '')
      }

      if (activitiesRes?.data) setActivities(activitiesRes.data)

      const fetchedTrips = Array.isArray(tripsRes?.data) ? tripsRes.data : []

      if (fetchedTrips.length > 0) {
        const tripsWithMembers = await Promise.all(
          fetchedTrips.map(async (trip) => {
            try {
              const membersRes = await api.get(`/api/trips/${trip.id}/members`)
              return { ...trip, membersCount: membersRes.data ? membersRes.data.length : 1 }
            } catch (e) {
              return { ...trip, membersCount: 1 }
            }
          })
        )
        setTrips(tripsWithMembers)
      } else {
        setTrips([])
      }

      setStats({
        upcomingTrips: fetchedTrips.length,
        plannedActivities: 0
      })
    } catch (err) {
      console.error('Помилка завантаження даних:', err)
      if (err.response?.status === 401) handleLogout()
    } finally {
      setLoading(false)
    }
  }

  // ВИПРАВЛЕННЯ 1: прибрали prepFilter з залежностей — фільтрація тепер локальна
  useEffect(() => {
    if (selectedTrip) fetchPreparations()
  }, [selectedTrip])

  const fetchPreparations = async () => {
    if (!selectedTrip) return
    setPrepLoading(true)
    try {
      const res = await api.get(`/api/trips/${selectedTrip.id}/preparations`)
      setPreparations(res.data || [])
    } catch (err) {
      console.error('Помилка завантаження пунктів підготовки:', err)
      setPreparations([])
    } finally {
      setPrepLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTrip) fetchMembers()
  }, [selectedTrip])

  const fetchMembers = async () => {
    if (!selectedTrip) return
    setMembersLoading(true)
    try {
      const res = await api.get(`/api/trips/${selectedTrip.id}/members`)
      const fetchedMembers = res.data || []
      setMembers(fetchedMembers)
      if (user?.id) {
        const me = fetchedMembers.find(m => m.userId === user.id)
        setCurrentUserRole(me ? me.role : 'MEMBER')
      }
    } catch (err) {
      console.error('Помилка завантаження учасників:', err)
      setMembers([])
    } finally {
      setMembersLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id && members.length > 0) {
      const me = members.find(m => m.userId === user.id)
      setCurrentUserRole(me ? me.role : 'MEMBER')
    }
  }, [user, members])

  const handleDeleteTrip = async () => {
    if (!selectedTrip || !window.confirm('Ви дійсно бажаєте видалити цю подорож?')) return
    try {
      await api.delete(`/api/trips/${selectedTrip.id}`)
      setTrips(prev => prev.filter(t => t.id !== selectedTrip.id))
      setSelectedTrip(null)
    } catch (err) {
      console.error('Помилка видалення подорожі:', err)
      alert('Не вдалося видалити подорож')
    }
  }

  const handleLeaveTrip = async () => {
    if (!selectedTrip || !window.confirm('Ви дійсно бажаєте покинути цю подорож?')) return
    try {
      await api.delete(`/api/trips/${selectedTrip.id}/members/me`)
      setTrips(prev => prev.filter(t => t.id !== selectedTrip.id))
      setSelectedTrip(null)
    } catch (err) {
      console.error('Помилка виходу з подорожі:', err)
      alert('Не вдалося покинути подорож')
    }
  }

  const handleUpdateMemberRole = async (targetUserId, newRole) => {
    if (!selectedTrip) return
    try {
      const res = await api.patch(
        `/api/trips/${selectedTrip.id}/members/${targetUserId}/role`,
        { role: newRole }
      )
      setMembers(prev => prev.map(m => m.userId === targetUserId ? res.data : m))
    } catch (err) {
      console.error('Помилка зміни ролі:', err)
      alert('Не вдалося змінити роль')
    }
  }

  const handleRemoveMember = async (targetUserId) => {
    if (!selectedTrip || !window.confirm('Ви дійсно бажаєте вилучити цього учасника?')) return
    try {
      await api.delete(`/api/trips/${selectedTrip.id}/members/${targetUserId}`)
      setMembers(prev => prev.filter(m => m.userId !== targetUserId))
    } catch (err) {
      console.error('Помилка видалення учасника:', err)
      alert('Не вдалося вилучити учасника')
    }
  }

  const handleAssignMember = async (prepPointId, targetUserId) => {
    if (!selectedTrip) return
    try {
      const res = await api.patch(
        `/api/trips/${selectedTrip.id}/preparations/${prepPointId}/assign/${targetUserId}`
      )
      setPreparations(prev => prev.map(p => p.id === prepPointId ? res.data : p))
    } catch (err) {
      console.error('Помилка призначення відповідального:', err)
      alert('Не вдалося призначити відповідального')
    }
  }

  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  const isSearchQueryUuid = uuidRegex.test(searchQuery.trim())

  const handleJoinByInviteCode = async () => {
    const code = searchQuery.trim()
    if (!code) return
    setJoinLoading(true)
    try {
      const response = await api.post(`/api/trips/join/${code}`)
      const joinedTrip = { ...response.data, membersCount: (response.data.membersCount || 1) }
      setTrips(prev => {
        if (prev.some(t => t.id === joinedTrip.id)) return prev
        return [joinedTrip, ...prev]
      })
      setSearchQuery('')
      setSelectedTrip(joinedTrip)
      setTripTab('Preparation')
      alert(`Успішно! Ви приєдналися до поїздки: ${joinedTrip.title}`)
    } catch (err) {
      console.error('Помилка приєднання:', err)
      alert(err.response?.data?.message || 'Не вдалося приєднатися')
    } finally {
      setJoinLoading(false)
    }
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && isSearchQueryUuid) {
      e.preventDefault()
      handleJoinByInviteCode()
    }
  }

  // ВИПРАВЛЕННЯ 2: прибрали e, виправили URL на /toggle, повертаємо дані
  const handleTogglePrepComplete = async (prepId) => {
    try {
      const res = await api.patch(
        `/api/trips/${selectedTrip.id}/preparations/${prepId}/toggle`
      )
      setPreparations(prev =>
        prev.map(p => p.id === prepId ? res.data : p)
      )
      return res.data
    } catch (err) {
      console.error('Помилка зміни стану виконання:', err)
      throw err
    }
  }

  const handleCreatePrepPoint = async (e) => {
    e.preventDefault()
    setCreatePrepLoading(true)
    try {
      const payload = {
        title: newPrepData.title,
        note: newPrepData.note || null,
        deadline: newPrepData.deadline ? `${newPrepData.deadline}T00:00:00` : null,
        attachmentLink: newPrepData.attachmentLink || null,
        cost: newPrepData.cost ? parseFloat(newPrepData.cost) : null
      }
      const res = await api.post(`/api/trips/${selectedTrip.id}/preparations`, payload)
      setPreparations(prev => [res.data, ...prev])
      setIsNewPrepOpen(false)
      setNewPrepData({ title: '', note: '', deadline: '', attachmentLink: '', cost: '' })
    } catch (err) {
      console.error('Помилка створення підготовчого пункту:', err)
      alert('Не вдалося створити пункт підготовки')
    } finally {
      setCreatePrepLoading(false)
    }
  }

  const handleDeletePrepPoint = async (prepId) => {
    if (!window.confirm('Ви дійсно бажаєте видалити цей пункт?')) return
    try {
      await api.delete(`/api/trips/${selectedTrip.id}/preparations/${prepId}`)
      setPreparations(prev => prev.filter(p => p.id !== prepId))
    } catch (err) {
      console.error('Помилка видалення пункту:', err)
      throw err
    }
  }

  const handleCreateTrip = async (e) => {
    e.preventDefault()
    setCreateTripLoading(true)
    setCreateTripError('')
    try {
      const response = await api.post('/api/trips', {
        title: newTripData.title,
        description: newTripData.description || null,
        coverUrl: newTripData.coverUrl || null,
        startDate: newTripData.startDate,
        endDate: newTripData.endDate
      })
      const createdTrip = { ...response.data, membersCount: 1 }
      setTrips((prev) => [createdTrip, ...prev])
      setIsNewTripOpen(false)
      setNewTripData({ title: '', description: '', coverUrl: '', startDate: '', endDate: '' })
      setSelectedTrip(createdTrip)
      setTripTab('Preparation')
    } catch (err) {
      console.error('Помилка створення поїздки:', err)
      setCreateTripError(err.response?.data?.message || 'Не вдалося створити поїздку')
    } finally {
      setCreateTripLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdateUserLoading(true)
    setUpdateUserMessage({ type: '', text: '' })
    try {
      const response = await api.patch('/api/users/me', { fullName: fullNameInput })
      setUser(response.data)
      setUpdateUserMessage({ type: 'success', text: 'Профіль успішно оновлено!' })
    } catch (err) {
      setUpdateUserMessage({ type: 'error', text: err.response?.data?.message || 'Не вдалося оновити дані' })
    } finally {
      setUpdateUserLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage({ type: '', text: '' })
    try {
      await api.patch('/api/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordMessage({ type: 'success', text: 'Пароль успішно змінено!' })
      setPasswordForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Помилка при зміні пароля' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/login')
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const copyInviteCode = (code) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const filteredTrips = trips.filter(trip => {
    const matchesTab = activeTab === 'All'
      ? true
      : activeTab === 'Upcoming' ? trip.status === 'UPCOMING'
      : trip.status === 'IN_PROGRESS'

    const query = searchQuery.toLowerCase().trim()
    const matchesSearch = !query || isSearchQueryUuid
      ? true
      : (trip.title && trip.title.toLowerCase().includes(query)) ||
        (trip.description && trip.description.toLowerCase().includes(query))

    return matchesTab && matchesSearch
  })

  return (
    <div style={styles.appLayout}>
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        selectedTrip={selectedTrip}
        setSelectedTrip={setSelectedTrip}
        user={user}
        getInitials={getInitials}
        onOpenSettings={() => {
          setFullNameInput(user?.fullName || '')
          setUpdateUserMessage({ type: '', text: '' })
          setPasswordMessage({ type: '', text: '' })
          setIsSettingsOpen(true)
        }}
        onLogout={handleLogout}
      />

      <main style={styles.mainContent}>
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearchQueryUuid={isSearchQueryUuid}
          handleSearchKeyDown={handleSearchKeyDown}
          handleJoinByInviteCode={handleJoinByInviteCode}
          joinLoading={joinLoading}
        />

        {selectedTrip ? (
          <SelectedTripView
            selectedTrip={selectedTrip}
            setSelectedTrip={setSelectedTrip}
            tripTab={tripTab}
            setTripTab={setTripTab}
            prepFilter={prepFilter}
            setPrepFilter={setPrepFilter}
            setIsNewPrepOpen={setIsNewPrepOpen}
            prepLoading={prepLoading}
            preparations={preparations}
            expandedPrepId={expandedPrepId}
            setExpandedPrepId={setExpandedPrepId}
            handleTogglePrepComplete={handleTogglePrepComplete}
            handleDeletePrepPoint={handleDeletePrepPoint}
            copyInviteCode={copyInviteCode}
            copiedCode={copiedCode}
            members={members}
            membersLoading={membersLoading}
            getInitials={getInitials}
            currentUserRole={currentUserRole}
            currentUserId={user?.id}
            handleDeleteTrip={handleDeleteTrip}
            handleLeaveTrip={handleLeaveTrip}
            handleUpdateMemberRole={handleUpdateMemberRole}
            handleRemoveMember={handleRemoveMember}
            handleAssignMember={handleAssignMember}
          />
        ) : loading ? (
          <div style={styles.loaderContainer}>
            <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} color="#ba6e51" />
            <p style={{ marginTop: '12px', color: '#666' }}>Завантаження даних...</p>
          </div>
        ) : (
          <TripsDashboardView
            activeNav={activeNav}
            setIsNewTripOpen={setIsNewTripOpen}
            trips={trips}
            setSelectedTrip={setSelectedTrip}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filteredTrips={filteredTrips}
            searchQuery={searchQuery}
            stats={stats}
            activities={activities}
          />
        )}
      </main>

      <NewTripModal
        isOpen={isNewTripOpen}
        onClose={() => setIsNewTripOpen(false)}
        newTripData={newTripData}
        setNewTripData={setNewTripData}
        handleCreateTrip={handleCreateTrip}
        createTripLoading={createTripLoading}
        createTripError={createTripError}
      />

      <NewPrepModal
        isOpen={isNewPrepOpen}
        onClose={() => setIsNewPrepOpen(false)}
        newPrepData={newPrepData}
        setNewPrepData={setNewPrepData}
        handleCreatePrepPoint={handleCreatePrepPoint}
        createPrepLoading={createPrepLoading}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        fullNameInput={fullNameInput}
        setFullNameInput={setFullNameInput}
        handleUpdateProfile={handleUpdateProfile}
        updateUserLoading={updateUserLoading}
        updateUserMessage={updateUserMessage}
        passwordForm={passwordForm}
        setPasswordForm={setPasswordForm}
        handleChangePassword={handleChangePassword}
        passwordLoading={passwordLoading}
        passwordMessage={passwordMessage}
      />
    </div>
  )
}