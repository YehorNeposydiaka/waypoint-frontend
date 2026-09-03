import React from 'react'
import { X, Loader2, MapPin, Plane } from 'lucide-react'
import { styles } from '../../styles/tripListPageStyles'
import { CHECKPOINT_TYPE_LABELS, TRANSFER_TYPE_LABELS } from '../../utils/routeUtils'

// formData shape (uniform across checkpoint/transfer for simplicity on the frontend):
// {
//   itemType: 'CHECKPOINT' | 'TRANSFER',
//   title, note, cost,
//   checkpointType, location, startDate, startTime, useDuration, endDate, endTime, durationMinutes,
//   transferType, departureLocation, arrivalLocation, departureDate, departureTime, arrivalDate, arrivalTime
// }

export default function RouteItemModal({
  isOpen,
  onClose,
  mode, // 'create' | 'edit'
  formData,
  setFormData,
  onSubmit,
  submitLoading
}) {
  if (!isOpen) return null

  const isTransfer = formData.itemType === 'TRANSFER'
  const showTypePicker = mode === 'create' && !formData.itemType

  const update = (patch) => setFormData({ ...formData, ...patch })

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>
            {mode === 'edit'
              ? (isTransfer ? 'Редагувати трансфер' : 'Редагувати точку')
              : showTypePicker
                ? 'Новий пункт маршруту'
                : (isTransfer ? 'Новий трансфер' : 'Нова точка')}
          </h3>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        {showTypePicker ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => update({ itemType: 'CHECKPOINT' })}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                borderRadius: '10px', border: '1px solid #e5e5e5', background: '#fff',
                cursor: 'pointer', textAlign: 'left'
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f3ece7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color="#ba6e51" />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Точка</div>
                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Місце, активність або подія</div>
              </div>
            </button>

            <button
              onClick={() => update({ itemType: 'TRANSFER' })}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                borderRadius: '10px', border: '1px solid #e5e5e5', background: '#fff',
                cursor: 'pointer', textAlign: 'left'
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eaf1fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plane size={18} color="#3a6fb5" />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Трансфер</div>
                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Переміщення між точками</div>
              </div>
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={styles.modalForm}>
            <div>
              <label style={styles.label}>Заголовок *</label>
              <input
                type="text"
                required
                placeholder={isTransfer ? 'напр. Переліт до Барселони' : 'напр. Музей Прадо'}
                value={formData.title}
                onChange={e => update({ title: e.target.value })}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>{isTransfer ? 'Тип трансферу' : 'Тип точки'}</label>
              <select
                value={isTransfer ? formData.transferType : formData.checkpointType}
                onChange={e => update(isTransfer ? { transferType: e.target.value } : { checkpointType: e.target.value })}
                style={styles.input}
              >
                {Object.entries(isTransfer ? TRANSFER_TYPE_LABELS : CHECKPOINT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Нотатка</label>
              <textarea
                placeholder="Деталі або коментар..."
                value={formData.note}
                onChange={e => update({ note: e.target.value })}
                style={{ ...styles.input, height: '60px', resize: 'vertical' }}
              />
            </div>

            {isTransfer ? (
              <>
                <div>
                  <label style={styles.label}>Звідки *</label>
                  <input
                    type="text"
                    required
                    placeholder="Місто / аеропорт відправлення"
                    value={formData.departureLocation}
                    onChange={e => update({ departureLocation: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Куди *</label>
                  <input
                    type="text"
                    required
                    placeholder="Місто / аеропорт прибуття"
                    value={formData.arrivalLocation}
                    onChange={e => update({ arrivalLocation: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={styles.label}>Дата відправлення *</label>
                    <input
                      type="date"
                      required
                      value={formData.departureDate}
                      onChange={e => update({ departureDate: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Час відправлення *</label>
                    <input
                      type="time"
                      required
                      value={formData.departureTime}
                      onChange={e => update({ departureTime: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={styles.label}>Дата прибуття</label>
                    <input
                      type="date"
                      value={formData.arrivalDate}
                      onChange={e => update({ arrivalDate: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Час прибуття</label>
                    <input
                      type="time"
                      value={formData.arrivalTime}
                      onChange={e => update({ arrivalTime: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div>
                  <label style={styles.label}>Посилання на квиток</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.ticketUrl}
                    onChange={e => update({ ticketUrl: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={styles.label}>Місце *</label>
                  <input
                    type="text"
                    required
                    placeholder="Адреса або назва місця"
                    value={formData.location}
                    onChange={e => update({ location: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={styles.label}>Дата *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={e => update({ startDate: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Час (необов'язково)</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={e => update({ startTime: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="checkbox"
                      checked={formData.useDuration}
                      onChange={e => update({ useDuration: e.target.checked })}
                    />
                    Вказати тривалість
                  </label>
                  {formData.useDuration && (
                    <input
                      type="number"
                      min="0"
                      step="5"
                      placeholder="Тривалість у хвилинах"
                      value={formData.durationMinutes}
                      onChange={e => update({ durationMinutes: e.target.value })}
                      style={styles.input}
                    />
                  )}
                </div>
              </>
            )}

            <div>
              <label style={styles.label}>Орієнтовна вартість ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.cost}
                onChange={e => update({ cost: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.modalActions}>
              <button type="button" onClick={onClose} style={styles.secondaryBtn}>Скасувати</button>
              <button type="submit" disabled={submitLoading} style={styles.primaryBtn}>
                {submitLoading
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : (mode === 'edit' ? 'Зберегти' : 'Додати')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}