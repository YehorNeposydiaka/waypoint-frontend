import React from 'react'
import { Plus, Loader2, MapPin, List, CalendarRange } from 'lucide-react'
import RouteItem from './RouteItem'
import { styles } from '../../../styles/tripListPageStyles'
import { getTripDays, getItemDateKey, compareByTime } from '../../../utils/routeUtils'

export default function RouteTab({
  selectedTrip,
  routeView,
  setRouteView,
  routeFilter,
  setRouteFilter,
  canEdit,
  onOpenNew,
  routeLoading,
  checkpoints,
  transfers,
  expandedRouteId,
  setExpandedRouteId,
  onDeleteItem,
  onOpenEdit
}) {
  const allItems = [
    ...checkpoints.map(c => ({ ...c, kind: 'checkpoint' })),
    ...transfers.map(t => ({ ...t, kind: 'transfer' }))
  ]

  const filteredItems = allItems.filter(item => {
    if (routeFilter === 'Transfers') return item.kind === 'transfer'
    if (routeFilter === 'Checkpoints') return item.kind === 'checkpoint'
    return true
  }).sort(compareByTime)

  const tripDays = getTripDays(selectedTrip?.startDate, selectedTrip?.endDate)

  const itemsByDay = tripDays.reduce((acc, day) => {
    acc[day] = allItems.filter(item => getItemDateKey(item) === day).sort(compareByTime)
    return acc
  }, {})

  const undatedItems = allItems.filter(item => !getItemDateKey(item))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={styles.segmentedControlSmall}>
          <button
            onClick={() => setRouteView('list')}
            style={{ ...styles.segmentedBtnSmall, ...(routeView === 'list' ? styles.segmentedBtnActiveSmall : {}), display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <List size={13} /> Список
          </button>
          <button
            onClick={() => setRouteView('timeline')}
            style={{ ...styles.segmentedBtnSmall, ...(routeView === 'timeline' ? styles.segmentedBtnActiveSmall : {}), display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <CalendarRange size={13} /> Таймлайн
          </button>
        </div>

        {canEdit && (
          <button onClick={onOpenNew} style={styles.primaryBtn}>
            <Plus size={16} /> Додати
          </button>
        )}
      </div>

      {routeView === 'list' && (
        <div style={styles.segmentedControlSmall}>
          {[
            { id: 'All', label: 'Всі' },
            { id: 'Transfers', label: 'Трансфери' },
            { id: 'Checkpoints', label: 'Точки' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setRouteFilter(f.id)}
              style={{ ...styles.segmentedBtnSmall, ...(routeFilter === f.id ? styles.segmentedBtnActiveSmall : {}) }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {routeLoading ? (
        <div style={styles.loaderContainer}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} color="#ba6e51" />
        </div>
      ) : allItems.length === 0 ? (
        <div style={styles.emptyTripsBox}>
          <MapPin size={36} color="#ba6e51" />
          <p style={{ margin: '12px 0 0 0', fontWeight: '500', color: '#666' }}>
            {canEdit ? 'Додайте першу точку або трансфер маршруту' : 'Маршрут ще порожній'}
          </p>
        </div>
      ) : routeView === 'list' ? (
        filteredItems.length === 0 ? (
          <div style={styles.emptyTripsBox}>
            <p style={{ margin: 0, fontWeight: '500', color: '#666' }}>Немає елементів для обраного фільтра</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredItems.map(item => (
              <RouteItem
                key={`${item.kind}-${item.id}`}
                item={item}
                expandedId={expandedRouteId}
                setExpandedId={setExpandedRouteId}
                canEdit={canEdit}
                onDelete={onDeleteItem}
                onOpenEdit={onOpenEdit}
              />
            ))}
          </div>
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {tripDays.map((day, index) => (
            <div key={day}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#2b2b2b' }}>День {index + 1}</span>
                <span style={{ fontSize: '12px', color: '#8e8e8e' }}>
                  {new Date(`${day}T00:00:00`).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>

              {itemsByDay[day].length === 0 ? (
                <div style={{ ...styles.emptyTripsBox, padding: '20px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#8e8e8e' }}>Немає запланованих пунктів</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {itemsByDay[day].map(item => (
                    <RouteItem
                      key={`${item.kind}-${item.id}`}
                      item={item}
                      expandedId={expandedRouteId}
                      setExpandedId={setExpandedRouteId}
                      canEdit={canEdit}
                      onDelete={onDeleteItem}
                      onOpenEdit={onOpenEdit}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {undatedItems.length > 0 && (
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#2b2b2b', marginBottom: '10px' }}>
                Без дати
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {undatedItems.map(item => (
                  <RouteItem
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    expandedId={expandedRouteId}
                    setExpandedId={setExpandedRouteId}
                    canEdit={canEdit}
                    onDelete={onDeleteItem}
                    onOpenEdit={onOpenEdit}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}