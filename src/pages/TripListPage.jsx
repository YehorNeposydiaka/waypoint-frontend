// src/pages/TripListPage.jsx
import React, { useState, useEffect } from 'react'
import { Loader2, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

import { uploadTripCover } from '../service/storageService'

import { styles } from '../styles/tripListPageStyles'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import SelectedTripView from '../components/selectedTrip/SelectedTripView'
import TripsDashboardView from '../components/TripsDashboardView'

import NewTripModal from '../components/modals/TripModal'
import NewPrepModal from '../components/modals/NewPrepModal'
import RouteItemModal from '../components/modals/RouteItemModal'
import SettingsModal from '../components/modals/SettingsModal'
import { combineDateAndTime, addMinutes } from '../utils/routeUtils'

// Порожній стан форми модалки маршруту. itemType не заданий на створенні —
// це вмикає крок вибору типу (Точка / Трансфер) у RouteItemModal.
function getEmptyRouteFormData(itemType = null) {
  return {
    itemType,
    title: '',
    note: '',
    cost: '',

    // Checkpoint
    checkpointType: 'LANDMARK',
    location: '',
    startDate: '',
    startTime: '',
    useDuration: false,
    durationMinutes: '',

    // Transfer
    transferType: 'PLANE',
    departureLocation: '',
    arrivalLocation: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    ticketUrl: ''
  }
}

export default function TripListPage() {
  const navigate = useNavigate()

  // Початковий стан встановлюємо в українську назву пункту меню Sidebar
  const [activeNav, setActiveNav] = useState('Поточні подорожі')
  const [isNewTripOpen, setIsNewTripOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const [selectedTrip, setSelectedTrip] = useState(null)
  const [tripTab, setTripTab] = useState('Preparation')

  const [preparations, setPreparations] = useState([])
  const [prepFilter, setPrepFilter] = useState('All')
  const [prepLoading, setPrepLoading] = useState(false)
  const [expandedPrepId, setExpandedPrepId] = useState(null)
  const [isNewPrepOpen, setIsNewPrepOpen] = useState(false)

  // Маршрут (чекпоінти + трансфери) — таб "Поїздка"
  const [checkpoints, setCheckpoints] = useState([])
  const [transfers, setTransfers] = useState([])
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeView, setRouteView] = useState('list') // 'list' | 'timeline'
  const [routeFilter, setRouteFilter] = useState('All') // 'All' | 'Transfers' | 'Checkpoints'
  const [expandedRouteId, setExpandedRouteId] = useState(null)

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false)
  const [routeModalMode, setRouteModalMode] = useState('create') // 'create' | 'edit'
  const [editingRouteItem, setEditingRouteItem] = useState(null) // { id, kind } поточного елементу при редагуванні
  const [routeFormData, setRouteFormData] = useState(getEmptyRouteFormData())
  const [routeSubmitLoading, setRouteSubmitLoading] = useState(false)

  // Статистика поїздки — таб "Статистика"
  const [tripStats, setTripStats] = useState(null)
  const [tripStatsLoading, setTripStatsLoading] = useState(false)
  const [statsView, setStatsView] = useState('overview') // 'overview' | 'details'

  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const [currentUserRole, setCurrentUserRole] = useState('MEMBER')

  const [searchQuery, setSearchQuery] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)

  const [newPrepData, setNewPrepData] = useState({
    title: '',
    note: '',
    deadline: '',
    attachmentLink: '',
    cost: ''
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
  const [updateUserMessage, setUpdateUserMessage] = useState({
    type: '',
    text: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  })

  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({
    type: '',
    text: ''
  })

  const [newTripData, setNewTripData] = useState({
    title: '',
    description: '',
    coverFile: null,
    startDate: '',
    endDate: ''
  })

  const [createTripLoading, setCreateTripLoading] = useState(false)
  const [createTripError, setCreateTripError] = useState('')

  // Стейти для редагування поїздки
  const [editTripLoading, setEditTripLoading] = useState(false)
  const [editTripError, setEditTripError] = useState('')

  // Мобільна навігація: чи відкрита висувна Sidebar-панель
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

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

      if (activitiesRes?.data) {
        setActivities(activitiesRes.data)
      }

      const fetchedTrips = Array.isArray(tripsRes?.data)
        ? tripsRes.data
        : []

      if (fetchedTrips.length > 0) {
        const tripsWithMembers = await Promise.all(
          fetchedTrips.map(async (trip) => {
            try {
              const membersRes = await api.get(
                `/api/trips/${trip.id}/members`
              )

              return {
                ...trip,
                membersCount: membersRes.data
                  ? membersRes.data.length
                  : 1
              }
            } catch (e) {
              return {
                ...trip,
                membersCount: 1
              }
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

      if (err.response?.status === 401) {
        handleLogout()
      }

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTrip) {
      fetchPreparations()
    }
  }, [selectedTrip])

  const fetchPreparations = async () => {
    if (!selectedTrip) return

    setPrepLoading(true)

    try {
      const res = await api.get(
        `/api/trips/${selectedTrip.id}/preparations`
      )

      setPreparations(res.data || [])

    } catch (err) {
      console.error(
        'Помилка завантаження пунктів підготовки:',
        err
      )

      setPreparations([])

    } finally {
      setPrepLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTrip) {
      fetchRouteItems()
    }
  }, [selectedTrip])

  const fetchRouteItems = async () => {
    if (!selectedTrip) return

    setRouteLoading(true)

    try {
      const [checkpointsRes, transfersRes] = await Promise.all([
        api.get(`/api/trips/${selectedTrip.id}/checkpoints`),
        api.get(`/api/trips/${selectedTrip.id}/transfers`)
      ])

      setCheckpoints(checkpointsRes.data || [])
      setTransfers(transfersRes.data || [])

    } catch (err) {
      console.error(
        'Помилка завантаження маршруту:',
        err
      )

      setCheckpoints([])
      setTransfers([])

    } finally {
      setRouteLoading(false)
    }
  }

  // Завантажуємо статистику щоразу, як відкривається таб "Статистика" (без кешування).
  useEffect(() => {
    if (selectedTrip && tripTab === 'Stats') {
      fetchTripStats()
    }
  }, [selectedTrip, tripTab])

  const fetchTripStats = async () => {
    if (!selectedTrip) return

    setTripStatsLoading(true)

    try {
      const res = await api.get(`/api/trips/${selectedTrip.id}/stats`)
      setTripStats(res.data)

    } catch (err) {
      console.error(
        'Помилка завантаження статистики:',
        err
      )

      setTripStats(null)

    } finally {
      setTripStatsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTrip) {
      fetchMembers()
    }
  }, [selectedTrip])

  const fetchMembers = async () => {
    if (!selectedTrip) return

    setMembersLoading(true)

    try {
      const res = await api.get(
        `/api/trips/${selectedTrip.id}/members`
      )

      const fetchedMembers = res.data || []

      setMembers(fetchedMembers)

      if (user?.id) {
        const me = fetchedMembers.find(
          m => m.userId === user.id
        )

        setCurrentUserRole(
          me ? me.role : 'MEMBER'
        )
      }

    } catch (err) {
      console.error(
        'Помилка завантаження учасників:',
        err
      )

      setMembers([])

    } finally {
      setMembersLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id && members.length > 0) {
      const me = members.find(
        m => m.userId === user.id
      )

      setCurrentUserRole(
        me ? me.role : 'MEMBER'
      )
    }
  }, [user, members])

  // РЕДАГУВАННЯ ПОЇЗДКИ
  const handleEditTrip = async (updatedData) => {
    if (!selectedTrip) return

    setEditTripLoading(true)
    setEditTripError('')

    try {
      // 1. Оновлюємо основну інформацію про поїздку
      const response = await api.patch(
        `/api/trips/${selectedTrip.id}`,
        {
          title: updatedData.title,
          description: updatedData.description || null,
          startDate: updatedData.startDate,
          endDate: updatedData.endDate
        }
      )

      let updatedTrip = response.data

      // 2. Якщо вибрано нову обкладинку, завантажуємо її
      if (updatedData.coverFile) {
        const coverUrl = await uploadTripCover(
          selectedTrip.id,
          updatedData.coverFile
        )

        const coverResponse = await api.patch(
          `/api/trips/${selectedTrip.id}`,
          { coverUrl }
        )

        updatedTrip = coverResponse.data
      }

      // Зберігаємо кількість учасників
      const finalTripData = {
        ...updatedTrip,
        membersCount: selectedTrip.membersCount || 1
      }

      // 3. Оновлюємо стан у списку та в обраній поїздці
      setTrips(prev =>
        prev.map(t => (t.id === selectedTrip.id ? finalTripData : t))
      )
      setSelectedTrip(finalTripData)

    } catch (err) {
      console.error('Помилка редагування поїздки:', err)
      const errorMsg = err.response?.data?.message || 'Не вдалося оновити поїздку'
      setEditTripError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setEditTripLoading(false)
    }
  }

  const handleDeleteTrip = async () => {
    if (
      !selectedTrip ||
      !window.confirm(
        'Ви дійсно бажаєте видалити цю подорож?'
      )
    ) {
      return
    }

    try {
      await api.delete(
        `/api/trips/${selectedTrip.id}`
      )

      setTrips(prev =>
        prev.filter(
          t => t.id !== selectedTrip.id
        )
      )

      setSelectedTrip(null)

    } catch (err) {
      console.error(
        'Помилка видалення подорожі:',
        err
      )

      alert('Не вдалося видалити подорож')
    }
  }

  const handleLeaveTrip = async () => {
    if (
      !selectedTrip ||
      !window.confirm(
        'Ви дійсно бажаєте покинути цю подорож?'
      )
    ) {
      return
    }

    try {
      await api.delete(
        `/api/trips/${selectedTrip.id}/members/me`
      )

      setTrips(prev =>
        prev.filter(
          t => t.id !== selectedTrip.id
        )
      )

      setSelectedTrip(null)

    } catch (err) {
      console.error(
        'Помилка виходу з подорожі:',
        err
      )

      alert('Не вдалося покинути подорож')
    }
  }

  const handleUpdateMemberRole = async (
    targetUserId,
    newRole
  ) => {
    if (!selectedTrip) return

    try {
      const res = await api.patch(
        `/api/trips/${selectedTrip.id}/members/${targetUserId}/role`,
        {
          role: newRole
        }
      )

      setMembers(prev =>
        prev.map(m =>
          m.userId === targetUserId
            ? res.data
            : m
        )
      )

    } catch (err) {
      console.error(
        'Помилка зміни ролі:',
        err
      )

      alert('Не вдалося змінити роль')
    }
  }

  const handleRemoveMember = async (
    targetUserId
  ) => {
    if (
      !selectedTrip ||
      !window.confirm(
        'Ви дійсно бажаєте вилучити цього учасника?'
      )
    ) {
      return
    }

    try {
      await api.delete(
        `/api/trips/${selectedTrip.id}/members/${targetUserId}`
      )

      setMembers(prev =>
        prev.filter(
          m => m.userId !== targetUserId
        )
      )

      setSelectedTrip(prev => {
        if (!prev) return null
        return {
          ...prev,
          membersCount: Math.max(1, (prev.membersCount || 1) - 1)
        }
      })

      setTrips(prev =>
        prev.map(t =>
          t.id === selectedTrip.id
            ? { ...t, membersCount: Math.max(1, (t.membersCount || 1) - 1) }
            : t
        )
      )

    } catch (err) {
      console.error(
        'Помилка видалення учасника:',
        err
      )

      alert('Не вдалося вилучити учасника')
    }
  }

  const handleAssignMember = async (
    prepPointId,
    targetUserId
  ) => {
    if (!selectedTrip) return

    try {
      const res = await api.patch(
        `/api/trips/${selectedTrip.id}/preparations/${prepPointId}/assign/${targetUserId}`
      )

      setPreparations(prev =>
        prev.map(p =>
          p.id === prepPointId
            ? res.data
            : p
        )
      )

    } catch (err) {
      console.error(
        'Помилка призначення відповідального:',
        err
      )

      alert(
        'Не вдалося призначити відповідального'
      )
    }
  }

  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

  const isSearchQueryUuid =
    uuidRegex.test(searchQuery.trim())

  const handleJoinByInviteCode = async () => {
    const code = searchQuery.trim()

    if (!code) return

    setJoinLoading(true)

    try {
      const response = await api.post(
        `/api/trips/join/${code}`
      )

      const joinedTrip = {
        ...response.data,
        membersCount:
          response.data.membersCount || 1
      }

      setTrips(prev => {
        if (
          prev.some(
            t => t.id === joinedTrip.id
          )
        ) {
          return prev
        }

        return [
          joinedTrip,
          ...prev
        ]
      })

      setSearchQuery('')
      setSelectedTrip(joinedTrip)
      setTripTab('Preparation')

      alert(
        `Успішно! Ви приєдналися до поїздки: ${joinedTrip.title}`
      )

    } catch (err) {
      console.error(
        'Помилка приєднання:',
        err
      )

      alert(
        err.response?.data?.message ||
        'Не вдалося приєднатися'
      )

    } finally {
      setJoinLoading(false)
    }
  }

  const handleSearchKeyDown = (e) => {
    if (
      e.key === 'Enter' &&
      isSearchQueryUuid
    ) {
      e.preventDefault()
      handleJoinByInviteCode()
    }
  }

  const handleTogglePrepComplete = async (
    prepId
  ) => {
    try {
      const res = await api.patch(
        `/api/trips/${selectedTrip.id}/preparations/${prepId}/complete`
      )

      setPreparations(prev =>
        prev.map(p =>
          p.id === prepId
            ? res.data
            : p
        )
      )

      return res.data

    } catch (err) {
      console.error(
        'Помилка зміни стану виконання:',
        err
      )

      throw err
    }
  }

  const handleCreatePrepPoint = async (e) => {
    if (e && e.preventDefault) e.preventDefault()

    setCreatePrepLoading(true)

    try {
      const payload = {
        title: newPrepData.title,
        note: newPrepData.note || null,
        deadline: newPrepData.deadline
          ? `${newPrepData.deadline}T00:00:00`
          : null,
        attachmentLink:
          newPrepData.attachmentLink || null,
        cost: newPrepData.cost
          ? parseFloat(newPrepData.cost)
          : null
      }

      const res = await api.post(
        `/api/trips/${selectedTrip.id}/preparations`,
        payload
      )

      setPreparations(prev => [
        res.data,
        ...prev
      ])

      setIsNewPrepOpen(false)

      setNewPrepData({
        title: '',
        note: '',
        deadline: '',
        attachmentLink: '',
        cost: ''
      })

    } catch (err) {
      console.error(
        'Помилка створення підготовчого пункту:',
        err
      )

      alert(
        'Не вдалося створити пункт підготовки'
      )

    } finally {
      setCreatePrepLoading(false)
    }
  }

  const handleDeletePrepPoint = async (
    prepId
  ) => {
    if (
      !window.confirm(
        'Ви дійсно бажаєте видалити цей пункт?'
      )
    ) {
      return
    }

    try {
      await api.delete(
        `/api/trips/${selectedTrip.id}/preparations/${prepId}`
      )

      setPreparations(prev =>
        prev.filter(
          p => p.id !== prepId
        )
      )

    } catch (err) {
      console.error(
        'Помилка видалення пункту:',
        err
      )

      throw err
    }
  }

  // МАРШРУТ (ЧЕКПОІНТИ + ТРАНСФЕРИ)

  const openNewRouteItem = () => {
    setRouteModalMode('create')
    setEditingRouteItem(null)
    setRouteFormData(getEmptyRouteFormData())
    setIsRouteModalOpen(true)
  }

  const openEditRouteItem = (item) => {
    setRouteModalMode('edit')
    setEditingRouteItem({ id: item.id, kind: item.kind })

    if (item.kind === 'transfer') {
      const [departureDate, departureTime] = (item.departureTime || '').split('T')
      const [arrivalDate, arrivalTime] = (item.arrivalTime || '').split('T')

      setRouteFormData({
        ...getEmptyRouteFormData('TRANSFER'),
        title: item.title || '',
        note: item.note || '',
        cost: item.cost ?? '',
        transferType: item.type || 'PLANE',
        departureLocation: item.departureLocation || '',
        arrivalLocation: item.arrivalLocation || '',
        departureDate: departureDate || '',
        departureTime: (departureTime || '').slice(0, 5),
        arrivalDate: arrivalDate || '',
        arrivalTime: (arrivalTime || '').slice(0, 5),
        ticketUrl: item.ticketUrl || ''
      })
    } else {
      const [startDate, startTime] = (item.startTime || '').split('T')

      setRouteFormData({
        ...getEmptyRouteFormData('CHECKPOINT'),
        title: item.title || '',
        note: item.note || '',
        cost: item.cost ?? '',
        checkpointType: item.checkpointType || 'LANDMARK',
        location: item.location || '',
        startDate: startDate || '',
        startTime: (startTime || '').slice(0, 5),
        useDuration: false,
        durationMinutes: ''
      })
    }

    setIsRouteModalOpen(true)
  }

  const closeRouteModal = () => {
    setIsRouteModalOpen(false)
    setEditingRouteItem(null)
    setRouteFormData(getEmptyRouteFormData())
  }

  const handleSubmitRouteItem = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!selectedTrip) return

    const isTransfer = routeFormData.itemType === 'TRANSFER'
    setRouteSubmitLoading(true)

    try {
      if (isTransfer) {
        const departureTime = combineDateAndTime(routeFormData.departureDate, routeFormData.departureTime)
        const arrivalTime = routeFormData.arrivalDate
          ? combineDateAndTime(routeFormData.arrivalDate, routeFormData.arrivalTime)
          : null

        const payload = {
          title: routeFormData.title,
          note: routeFormData.note || null,
          transferType: routeFormData.transferType,
          departureTime,
          arrivalTime,
          cost: routeFormData.cost ? parseFloat(routeFormData.cost) : null,
          ticketUrl: routeFormData.ticketUrl || null,
          departureLocation: routeFormData.departureLocation,
          arrivalLocation: routeFormData.arrivalLocation
        }

        if (routeModalMode === 'edit' && editingRouteItem) {
          const res = await api.patch(
            `/api/trips/${selectedTrip.id}/transfers/${editingRouteItem.id}`,
            payload
          )
          setTransfers(prev => prev.map(t => (t.id === editingRouteItem.id ? res.data : t)))
        } else {
          const res = await api.post(
            `/api/trips/${selectedTrip.id}/transfers`,
            payload
          )
          setTransfers(prev => [res.data, ...prev])
        }
      } else {
        const startTime = combineDateAndTime(routeFormData.startDate, routeFormData.startTime)
        const endTime = routeFormData.useDuration && routeFormData.durationMinutes
          ? addMinutes(startTime, routeFormData.durationMinutes)
          : null

        const payload = {
          title: routeFormData.title,
          note: routeFormData.note || null,
          checkpointType: routeFormData.checkpointType,
          startTime,
          endTime,
          cost: routeFormData.cost ? parseFloat(routeFormData.cost) : null,
          location: routeFormData.location
        }

        if (routeModalMode === 'edit' && editingRouteItem) {
          const res = await api.patch(
            `/api/trips/${selectedTrip.id}/checkpoints/${editingRouteItem.id}`,
            payload
          )
          setCheckpoints(prev => prev.map(c => (c.id === editingRouteItem.id ? res.data : c)))
        } else {
          const res = await api.post(
            `/api/trips/${selectedTrip.id}/checkpoints`,
            payload
          )
          setCheckpoints(prev => [res.data, ...prev])
        }
      }

      closeRouteModal()

    } catch (err) {
      console.error(
        'Помилка збереження пункту маршруту:',
        err
      )

      alert(
        routeModalMode === 'edit'
          ? 'Не вдалося зберегти зміни'
          : 'Не вдалося створити пункт маршруту'
      )

    } finally {
      setRouteSubmitLoading(false)
    }
  }

  const handleDeleteRouteItem = async (item) => {
    if (!window.confirm('Ви дійсно бажаєте видалити цей пункт?')) return

    const isTransfer = item.kind === 'transfer'

    try {
      await api.delete(
        `/api/trips/${selectedTrip.id}/${isTransfer ? 'transfers' : 'checkpoints'}/${item.id}`
      )

      if (isTransfer) {
        setTransfers(prev => prev.filter(t => t.id !== item.id))
      } else {
        setCheckpoints(prev => prev.filter(c => c.id !== item.id))
      }

    } catch (err) {
      console.error(
        'Помилка видалення пункту маршруту:',
        err
      )

      alert('Не вдалося видалити пункт')
    }
  }

  const handleCreateTrip = async (e) => {
    if (e && e.preventDefault) e.preventDefault()

    setCreateTripLoading(true)
    setCreateTripError('')

    try {
      const response = await api.post(
        '/api/trips',
        {
          title: newTripData.title,
          description:
            newTripData.description || null,
          coverUrl: null,
          startDate:
            newTripData.startDate,
          endDate:
            newTripData.endDate
        }
      )

      let createdTrip = response.data

      if (newTripData.coverFile) {
        const coverUrl =
          await uploadTripCover(
            createdTrip.id,
            newTripData.coverFile
          )

        const updateResponse =
          await api.patch(
            `/api/trips/${createdTrip.id}`,
            {
              coverUrl: coverUrl
            }
          )

        createdTrip =
          updateResponse.data
      }

      const tripWithMembers = {
        ...createdTrip,
        membersCount: 1
      }

      setTrips(prev => [
        tripWithMembers,
        ...prev
      ])

      setIsNewTripOpen(false)

      setNewTripData({
        title: '',
        description: '',
        coverFile: null,
        startDate: '',
        endDate: ''
      })

      setSelectedTrip(
        tripWithMembers
      )

      setTripTab('Preparation')

    } catch (err) {
      console.error(
        'Помилка створення поїздки:',
        err
      )

      setCreateTripError(
        err.response?.data?.message ||
        'Не вдалося створити поїздку'
      )

    } finally {
      setCreateTripLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault()

    setUpdateUserLoading(true)

    setUpdateUserMessage({
      type: '',
      text: ''
    })

    try {
      const response = await api.patch(
        '/api/users/me',
        {
          fullName: fullNameInput
        }
      )

      setUser(response.data)

      setUpdateUserMessage({
        type: 'success',
        text: 'Профіль успішно оновлено!'
      })

    } catch (err) {
      setUpdateUserMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Не вдалося оновити дані'
      })

    } finally {
      setUpdateUserLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault()

    setPasswordLoading(true)

    setPasswordMessage({
      type: '',
      text: ''
    })

    try {
      await api.patch(
        '/api/users/me/password',
        {
          currentPassword:
            passwordForm.currentPassword,
          newPassword:
            passwordForm.newPassword
        }
      )

      setPasswordMessage({
        type: 'success',
        text: 'Пароль успішно змінено!'
      })

      setPasswordForm({
        currentPassword: '',
        newPassword: ''
      })

    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Помилка при зміні пароля'
      })

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

    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  const copyInviteCode = (code) => {
    if (!code) return

    navigator.clipboard.writeText(code)

    setCopiedCode(true)

    setTimeout(
      () => setCopiedCode(false),
      2000
    )
  }

  // ОНОВЛЕНА ЛОГІКА ФІЛЬТРАЦІЇ
  const filteredTrips = trips.filter(trip => {
    const status = (trip.status || 'PLANNING').toUpperCase()
    const nav = (activeNav || '').toLowerCase()

    // 1. Фільтрація за пунктом лівого Sidebar
    let matchesNav = true

    if (nav.includes('поточні') || nav.includes('current')) {
      // У Поточних відображаємо ТІЛЬКИ PLANNING та IN_PROGRESS
      matchesNav = ['PLANNING', 'IN_PROGRESS'].includes(status)
    } else if (nav.includes('історія') || nav.includes('history')) {
      // В Історії відображаємо ТІЛЬКИ COMPLETED
      matchesNav = status === 'COMPLETED'
    } else if (nav.includes('видалені') || nav.includes('deleted')) {
      // У Видалених відображаємо ТІЛЬКИ DELETED
      matchesNav = status === 'DELETED'
    }

    // 2. Фільтрація за вкладками дашборду (All / Upcoming / In progress)
    let matchesTab = true
    const tab = (activeTab || '').toLowerCase()

    if (tab === 'upcoming' || tab.includes('план')) {
      matchesTab = status === 'PLANNING'
    } else if (tab === 'in progress' || tab.includes('процес')) {
      matchesTab = status === 'IN_PROGRESS'
    }

    // 3. Текстовий пошук
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !query || isSearchQueryUuid
        ? true
        : (trip.title && trip.title.toLowerCase().includes(query)) ||
          (trip.description && trip.description.toLowerCase().includes(query))

    return matchesNav && matchesTab && matchesSearch
  })

  return (
    <div className="app-layout">
      <div className="mobile-topbar">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
          aria-label="Відкрити меню"
        >
          <Menu size={22} color="#2b2b2b" />
        </button>
        <span style={{ fontWeight: '700', fontSize: '16px', color: '#2b2b2b' }}>WayPoint</span>
        <div style={{ width: '22px' }} />
      </div>

      <div
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'sidebar-overlay-visible' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <div className={`sidebar ${isMobileSidebarOpen ? 'sidebar-open' : ''}`}>
        <Sidebar
          activeNav={activeNav}
          setActiveNav={(nav) => {
            setActiveNav(nav)
            setIsMobileSidebarOpen(false)
          }}
          selectedTrip={selectedTrip}
          setSelectedTrip={(trip) => {
            setSelectedTrip(trip)
            setIsMobileSidebarOpen(false)
          }}
          user={user}
          getInitials={getInitials}
          onOpenSettings={() => {
            setFullNameInput(
              user?.fullName || ''
            )

            setUpdateUserMessage({
              type: '',
              text: ''
            })

            setPasswordMessage({
              type: '',
              text: ''
            })

            setIsSettingsOpen(true)
            setIsMobileSidebarOpen(false)
          }}
          onLogout={handleLogout}
        />
      </div>

      <main className="main-content">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearchQueryUuid={
            isSearchQueryUuid
          }
          handleSearchKeyDown={
            handleSearchKeyDown
          }
          handleJoinByInviteCode={
            handleJoinByInviteCode
          }
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
            setIsNewPrepOpen={
              setIsNewPrepOpen
            }
            prepLoading={prepLoading}
            preparations={preparations}
            expandedPrepId={
              expandedPrepId
            }
            setExpandedPrepId={
              setExpandedPrepId
            }
            handleTogglePrepComplete={
              handleTogglePrepComplete
            }
            handleDeletePrepPoint={
              handleDeletePrepPoint
            }
            copyInviteCode={
              copyInviteCode
            }
            copiedCode={copiedCode}
            members={members}
            membersLoading={
              membersLoading
            }
            getInitials={getInitials}
            currentUserRole={
              currentUserRole
            }
            currentUserId={user?.id}
            handleEditTrip={handleEditTrip}
            editTripLoading={editTripLoading}
            editTripError={editTripError}
            handleDeleteTrip={
              handleDeleteTrip
            }
            handleLeaveTrip={
              handleLeaveTrip
            }
            handleUpdateMemberRole={
              handleUpdateMemberRole
            }
            handleRemoveMember={
              handleRemoveMember
            }
            handleAssignMember={
              handleAssignMember
            }
            routeView={routeView}
            setRouteView={setRouteView}
            routeFilter={routeFilter}
            setRouteFilter={setRouteFilter}
            routeLoading={routeLoading}
            checkpoints={checkpoints}
            transfers={transfers}
            expandedRouteId={expandedRouteId}
            setExpandedRouteId={setExpandedRouteId}
            onOpenNewRouteItem={openNewRouteItem}
            onDeleteRouteItem={handleDeleteRouteItem}
            onOpenEditRouteItem={openEditRouteItem}
            stats={tripStats}
            statsLoading={tripStatsLoading}
            statsView={statsView}
            setStatsView={setStatsView}
          />
        ) : loading ? (
          <div style={styles.loaderContainer}>
            <Loader2
              size={36}
              style={{
                animation:
                  'spin 1s linear infinite'
              }}
              color="#ba6e51"
            />

            <p
              style={{
                marginTop: '12px',
                color: '#666'
              }}
            >
              Завантаження даних...
            </p>
          </div>
        ) : (
          <TripsDashboardView
            activeNav={activeNav}
            setIsNewTripOpen={
              setIsNewTripOpen
            }
            trips={trips}
            setSelectedTrip={
              setSelectedTrip
            }
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filteredTrips={
              filteredTrips
            }
            searchQuery={
              searchQuery
            }
            stats={stats}
            activities={activities}
          />
        )}
      </main>

      {/* Універсальна модалка для створення подорожі */}
      <NewTripModal
        isOpen={isNewTripOpen}
        onClose={() => setIsNewTripOpen(false)}
        tripData={newTripData}
        setTripData={setNewTripData}
        handleSubmit={handleCreateTrip}
        loading={createTripLoading}
        error={createTripError}
        isEdit={false}
      />

      <NewPrepModal
        isOpen={isNewPrepOpen}
        onClose={() =>
          setIsNewPrepOpen(false)
        }
        newPrepData={newPrepData}
        setNewPrepData={
          setNewPrepData
        }
        handleCreatePrepPoint={
          handleCreatePrepPoint
        }
        createPrepLoading={
          createPrepLoading
        }
      />

      <RouteItemModal
        isOpen={isRouteModalOpen}
        onClose={closeRouteModal}
        mode={routeModalMode}
        formData={routeFormData}
        setFormData={setRouteFormData}
        onSubmit={handleSubmitRouteItem}
        submitLoading={routeSubmitLoading}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() =>
          setIsSettingsOpen(false)
        }
        fullNameInput={
          fullNameInput
        }
        setFullNameInput={
          setFullNameInput
        }
        handleUpdateProfile={
          handleUpdateProfile
        }
        updateUserLoading={
          updateUserLoading
        }
        updateUserMessage={
          updateUserMessage
        }
        passwordForm={
          passwordForm
        }
        setPasswordForm={
          setPasswordForm
        }
        handleChangePassword={
          handleChangePassword
        }
        passwordLoading={
          passwordLoading
        }
        passwordMessage={
          passwordMessage
        }
      />
    </div>
  )
}