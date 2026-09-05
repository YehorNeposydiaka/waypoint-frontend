import React from 'react'
import { X, Loader2 } from 'lucide-react'
import { styles } from '../../styles/tripListPageStyles'

export default function SettingsModal({
  isOpen,
  onClose,
  fullNameInput,
  setFullNameInput,
  handleUpdateProfile,
  updateUserLoading,
  updateUserMessage,
  passwordForm,
  setPasswordForm,
  handleChangePassword,
  passwordLoading,
  passwordMessage
}) {
  if (!isOpen) return null

  return (
    <div style={styles.modalOverlay}>
      <div className="modal-content" style={{ ...styles.modalContent, maxWidth: '500px' }}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Налаштування профілю</h3>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <form onSubmit={handleUpdateProfile} style={styles.modalForm}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>Особисті дані</h4>
            {updateUserMessage.text && (
              <div style={updateUserMessage.type === 'error' ? styles.errorBanner : styles.successBanner}>
                {updateUserMessage.text}
              </div>
            )}
            <div>
              <label style={styles.label}>Повне ім'я</label>
              <input
                type="text"
                required
                value={fullNameInput}
                onChange={e => setFullNameInput(e.target.value)}
                style={styles.input}
              />
            </div>
            <button type="submit" disabled={updateUserLoading} style={{ ...styles.primaryBtn, alignSelf: 'flex-start' }}>
              {updateUserLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Зберегти зміни'}
            </button>
          </form>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: 0 }} />

          <form onSubmit={handleChangePassword} style={styles.modalForm}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>Зміна пароля</h4>
            {passwordMessage.text && (
              <div style={passwordMessage.type === 'error' ? styles.errorBanner : styles.successBanner}>
                {passwordMessage.text}
              </div>
            )}
            <div>
              <label style={styles.label}>Поточний пароль</label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Новий пароль</label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                style={styles.input}
              />
            </div>
            <button type="submit" disabled={passwordLoading} style={{ ...styles.primaryBtn, alignSelf: 'flex-start' }}>
              {passwordLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Змінити пароль'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}