import React from 'react'
import { Plus, Sparkles, Luggage, MoreHorizontal, Users } from 'lucide-react'
import PlaceholderView from './PlaceholderView'
import { styles } from '../styles/tripListPageStyles'

export default function TripsDashboardView({
  activeNav,
  setIsNewTripOpen,
  trips,
  setSelectedTrip,
  activeTab,
  setActiveTab,
  filteredTrips,
  searchQuery,
  stats,
  activities
}) {
  const navLower = (activeNav || '').toLowerCase()

  // 1. Перевіряємо, чи є поточний пункт меню розділом зі списком подорожей
  const isTripListNav =
    navLower.includes('головна') ||
    navLower.includes('поточні') ||
    navLower.includes('історія') ||
    navLower.includes('видалені') ||
    navLower.includes('current') ||
    navLower.includes('history') ||
    navLower.includes('deleted')

  // 2. Якщо це Статистика або інший розділ без карт — відображаємо плейхолдер
  if (!isTripListNav) {
    return <PlaceholderView title={activeNav} icon={<Luggage size={40} color="#ba6e51" />} />
  }

  // 3. Динамічний опис для підзаголовка залежно від активного розділу
  const getSubtitle = () => {
    if (navLower.includes('історія') || navLower.includes('history')) {
      return 'Переглядайте ваші завершені мандрівки та спогади.'
    }
    if (navLower.includes('видалені') || navLower.includes('deleted')) {
      return 'Архів видалених подорожей.'
    }
    return 'Плануйте та керуйте вашими подорожами в одному місці.'
  }

  return (
    <>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>{activeNav}</h1>
          <p style={styles.subtitle}>{getSubtitle()}</p>
        </div>
        <button onClick={() => setIsNewTripOpen(true)} style={styles.primaryBtn}>
          <Plus size={18} /> Нова подорож
        </button>
      </div>

      <div style={styles.dashboardGrid}>
        <div style={styles.leftColumn}>
          {/* Показуємо картку "Наступна подорож" тільки у Поточних або на Головній */}
          {(navLower.includes('поточні') || navLower.includes('головна')) && (
            trips.length > 0 ? (
              <div 
                onClick={() => setSelectedTrip(trips[0])}
                style={{
                  ...styles.heroCard,
                  cursor: 'pointer',
                  backgroundColor: '#ba6e51',
                  backgroundImage: trips[0].coverUrl ? `url(${trips[0].coverUrl})` : 'none'
                }}
              >
                <div style={styles.heroOverlay}>
                  <span style={styles.heroBadge}>Наступна подорож</span>
                  <h2 style={styles.heroTitle}>{trips[0].title}</h2>
                  
                  <div style={styles.heroFooter}>
                    <div style={styles.progressContainer}>
                      <span style={styles.daysText}>
                        {trips[0].daysToGo ? `${trips[0].daysToGo} днів до початку` : 'Скоро в дорогу'}
                      </span>
                      <div style={styles.progressBar}>
                        <div style={styles.progressFill}></div>
                      </div>
                    </div>
                    <button style={styles.heroBtn}>Open trip</button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.heroEmptyCard}>
                <Sparkles size={32} color="#ba6e51" />
                <h3 style={{ margin: '8px 0 4px 0', fontSize: '18px' }}>Немає запланованих пригод</h3>
                <p style={{ margin: 0, color: '#7a7a7a', fontSize: '14px' }}>
                  Створіть свою першу подорож або приєднайтеся за кодом!
                </p>
              </div>
            )
          )}

          <div style={styles.tripsSection}>
            <div style={styles.tripsSectionHeader}>
              <h3 style={styles.sectionTitle}>{activeNav}</h3>
              
              {/* Таби фільтрації ("All", "Upcoming", "In progress") рендеримо тільки у Поточних */}
              {(navLower.includes('поточні') || navLower.includes('головна')) && trips.length > 0 && (
                <div style={styles.controlsRow}>
                  <div style={styles.segmentedControlSmall}>
                    {['All', 'Upcoming', 'In progress'].map(tab => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        style={{
                          ...styles.segmentedBtnSmall,
                          ...(activeTab === tab ? styles.segmentedBtnActiveSmall : {})
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {filteredTrips.length > 0 ? (
              <div style={styles.cardsGrid}>
                {filteredTrips.map(trip => (
                  <div 
                    key={trip.id} 
                    onClick={() => setSelectedTrip(trip)}
                    style={{
                      ...styles.tripCard,
                      cursor: 'pointer',
                      backgroundColor: '#8a5a44',
                      backgroundImage: trip.coverUrl ? `url(${trip.coverUrl})` : 'none'
                    }}
                  >
                    <div style={styles.cardOverlay}>
                      <button 
                        style={styles.cardMoreBtn} 
                        onClick={(e) => { e.stopPropagation(); }}
                      >
                        <MoreHorizontal size={16} color="#fff" />
                      </button>
                      <div>
                        <h4 style={styles.cardTitle}>{trip.title}</h4>
                        <p style={styles.cardDates}>{trip.startDate} - {trip.endDate}</p>
                        <div style={styles.cardBadges}>
                          <span style={styles.tagBadge}>{trip.status || 'PLANNING'}</span>
                          <span style={styles.infoBadge}>{trip.activitiesCount || 0} подій</span>
                          <span style={styles.infoBadge}>
                            <Users size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            {trip.membersCount ?? 1} учасників
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyTripsBox}>
                <Luggage size={40} color="#ba6e51" />
                <h4 style={styles.emptyTitle}>
                  {searchQuery ? 'Поїздок за таким запитом не знайдено' : 'У цьому розділі немає поїздок'}
                </h4>
                <p style={styles.emptyText}>
                  {navLower.includes('історія') 
                    ? 'Завершені подорожі (зі статусом COMPLETED) з’являться тут.'
                    : 'Для початку вашої нової подорожі натисніть кнопку "Нова подорож" або введіть інвайт-код у полі пошуку.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ПРАВА КОЛОНКА (INSIGHTS) */}
        <div style={styles.rightColumn}>
          <div style={styles.sideCard}>
            <h3 style={styles.sideCardTitle}>Аналітика</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <span style={styles.statNumber}>{stats ? stats.upcomingTrips : 0}</span>
                <span style={styles.statLabel}>Майбутні подорожі</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statNumber}>{stats ? stats.plannedActivities : 0}</span>
                <span style={styles.statLabel}>Заплановані дії</span>
              </div>
            </div>
          </div>

          <div style={styles.sideCard}>
            <h3 style={styles.sideCardTitle}>Останні дії</h3>
            {activities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activities.map((act, idx) => (
                  <div key={idx} style={{ fontSize: '13px', color: '#4a4a4a', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: '600', color: '#2b2b2b' }}>{act.title}</div>
                    <div>{act.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#8e8e8e', margin: 0 }}>Останні дії відсутні.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}