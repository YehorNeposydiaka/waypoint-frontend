import React from 'react'
import { X, Loader2, Upload } from 'lucide-react'
import { styles } from '../../styles/tripListPageStyles'

export default function NewTripModal({
  isOpen,
  onClose,
  newTripData,
  setNewTripData,
  handleCreateTrip,
  createTripLoading,
  createTripError
}) {
  if (!isOpen) return null

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0] || null

    setNewTripData({
      ...newTripData,
      coverFile: file
    })
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>
            Нова подорож
          </h3>

          <button
            onClick={onClose}
            style={styles.closeBtn}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleCreateTrip}
          style={styles.modalForm}
        >
          {createTripError && (
            <div style={styles.errorBanner}>
              {createTripError}
            </div>
          )}

          <div>
            <label style={styles.label}>
              Назва поїздки *
            </label>

            <input
              type="text"
              required
              placeholder="напр. Відпустка в Карпатах"
              value={newTripData.title}
              onChange={e =>
                setNewTripData({
                  ...newTripData,
                  title: e.target.value
                })
              }
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>
              Опис
            </label>

            <textarea
              placeholder="Короткий опис або ціль поїздки"
              value={newTripData.description}
              onChange={e =>
                setNewTripData({
                  ...newTripData,
                  description: e.target.value
                })
              }
              style={{
                ...styles.input,
                height: '80px',
                resize: 'vertical'
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}
          >
            <div>
              <label style={styles.label}>
                Дата початку *
              </label>

              <input
                type="date"
                required
                value={newTripData.startDate}
                onChange={e =>
                  setNewTripData({
                    ...newTripData,
                    startDate: e.target.value
                  })
                }
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Дата кінця *
              </label>

              <input
                type="date"
                required
                value={newTripData.endDate}
                onChange={e =>
                  setNewTripData({
                    ...newTripData,
                    endDate: e.target.value
                  })
                }
                style={styles.input}
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>
              Обкладинка
            </label>

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
                {newTripData.coverFile
                  ? newTripData.coverFile.name
                  : 'Вибрати зображення'}
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                style={{ display: 'none' }}
              />
            </label>

            {newTripData.coverFile && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#666'
                }}
              >
                Обрано:{' '}
                {newTripData.coverFile.name}
              </div>
            )}
          </div>

          <div style={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.secondaryBtn}
            >
              Скасувати
            </button>

            <button
              type="submit"
              disabled={createTripLoading}
              style={styles.primaryBtn}
            >
              {createTripLoading ? (
                <>
                  <Loader2
                    size={16}
                    style={{
                      animation:
                        'spin 1s linear infinite'
                    }}
                  />

                  Завантаження...
                </>
              ) : (
                'Створити'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}