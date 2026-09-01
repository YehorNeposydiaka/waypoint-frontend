import React from 'react'
import { styles } from '../../styles/tripListPageStyles'

export default function TripHeroCard({ selectedTrip }) {
  // Перевірка всіх можливих полів обкладинки з DTO
  const tripCoverImage = selectedTrip?.coverPhotoUrl || selectedTrip?.coverUrl || selectedTrip?.imageUrl || selectedTrip?.cover || null

  return (
    <div style={{
      ...styles.heroCard,
      backgroundColor: '#ba6e51',
      backgroundImage: tripCoverImage ? `url(${tripCoverImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
      minHeight: '180px'
    }}>
      <div style={{
        ...styles.heroOverlay,
        backgroundColor: tripCoverImage ? 'rgba(0, 0, 0, 0.45)' : 'transparent',
        padding: '24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }}>
        <div>
          <span style={styles.heroBadge}>{selectedTrip?.status || 'PLANNING'}</span>
          <h2 style={{ ...styles.heroTitle, color: '#ffffff', margin: '8px 0 4px 0' }}>{selectedTrip?.title}</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
            {selectedTrip?.startDate} — {selectedTrip?.endDate}
          </p>
        </div>
      </div>
    </div>
  )
}