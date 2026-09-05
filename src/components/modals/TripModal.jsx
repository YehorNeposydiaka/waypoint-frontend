// src/components/modals/TripModal.jsx
import React from 'react'
import { X, Loader2, Upload } from 'lucide-react'
import { styles } from '../../styles/tripListPageStyles'

export default function TripModal({
  isOpen,
  onClose,
  tripData,
  setTripData,
  handleSubmit,
  loading,
  error,
  isEdit = false // Прапорець: false = створення, true = редагування
}) {
  if (!isOpen) return null

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0] || null
    setTripData({
      ...tripData,
      coverFile: file
    })
  }

  const onSubmitForm = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (handleSubmit) {
      handleSubmit(e)
    }
  }

  return (
    <div style={styles.modalOverlay}>
      <div className="modal-content" style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>
            {isEdit ? 'Редагувати подорож' : 'Нова подорож'}
          </h3>

          <button onClick={onClose} style={styles.closeBtn} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmitForm} style={styles.modalForm}>
          {error && <div style={styles.errorBanner}>{error}</div>}

          <div>
            <label style={styles.label}>Назва поїздки *</label>
            <input
              type="text"
              required
              placeholder="напр. Відпустка в Карпатах"
              value={tripData.title || ''}
              onChange={e => setTripData({ ...tripData, title: e.target.value })}
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Опис</label>
            <textarea
              placeholder="Короткий опис або ціль поїздки"
              value={tripData.description || ''}
              onChange={e => setTripData({ ...tripData, description: e.target.value })}
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={styles.label}>Дата початку *</label>
              <input
                type="date"
                required
                value={tripData.startDate || ''}
                onChange={e => setTripData({ ...tripData, startDate: e.target.value })}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Дата кінця *</label>
              <input
                type="date"
                required
                value={tripData.endDate || ''}
                onChange={e => setTripData({ ...tripData, endDate: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>Обкладинка</label>
            <label
              style={{
                ...styles.input,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                minHeight: '44px',
                boxSizing: 'border-box'
              }}
            >
              <Upload size={18} />
              <span>
                {tripData.coverFile
                  ? tripData.coverFile.name
                  : isEdit ? 'Оновити зображення' : 'Завантажити зображення'}
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.secondaryBtn}>
              Скасувати
            </button>

            <button 
              type="submit" 
              disabled={loading} 
              style={styles.primaryBtn}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  {isEdit ? 'Збереження...' : 'Створення...'}
                </>
              ) : (
                isEdit ? 'Зберегти' : 'Створити'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}