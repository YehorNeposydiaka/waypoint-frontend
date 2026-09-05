import React from 'react'
import { X, Loader2 } from 'lucide-react'
import { styles } from '../../styles/tripListPageStyles'

export default function NewPrepModal({
  isOpen,
  onClose,
  newPrepData,
  setNewPrepData,
  handleCreatePrepPoint,
  createPrepLoading
}) {
  if (!isOpen) return null

  return (
    <div style={styles.modalOverlay}>
      <div className="modal-content" style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Новий пункт підготовки</h3>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>
        <form onSubmit={handleCreatePrepPoint} style={styles.modalForm}>
          <div>
            <label style={styles.label}>Заголовок *</label>
            <input
              type="text"
              required
              placeholder="напр. Купити квитки на потяг"
              value={newPrepData.title}
              onChange={e => setNewPrepData({ ...newPrepData, title: e.target.value })}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Нотатка</label>
            <textarea
              placeholder="Деталі або коментар..."
              value={newPrepData.note}
              onChange={e => setNewPrepData({ ...newPrepData, note: e.target.value })}
              style={{ ...styles.input, height: '60px', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={styles.label}>Кінцевий термін (Deadline)</label>
              <input
                type="date"
                value={newPrepData.deadline}
                onChange={e => setNewPrepData({ ...newPrepData, deadline: e.target.value })}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Орієнтовна вартість ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newPrepData.cost}
                onChange={e => setNewPrepData({ ...newPrepData, cost: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>
          <div>
            <label style={styles.label}>Посилання на вкладення / документ</label>
            <input
              type="url"
              placeholder="https://..."
              value={newPrepData.attachmentLink}
              onChange={e => setNewPrepData({ ...newPrepData, attachmentLink: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.secondaryBtn}>Скасувати</button>
            <button type="submit" disabled={createPrepLoading} style={styles.primaryBtn}>
              {createPrepLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Додати'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}