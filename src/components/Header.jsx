import React from 'react'
import { Search, Bell, Loader2, X, UserCheck } from 'lucide-react'
import { styles } from '../styles/tripListPageStyles'

export default function Header({
  searchQuery,
  setSearchQuery,
  isSearchQueryUuid,
  handleSearchKeyDown,
  handleJoinByInviteCode,
  joinLoading
}) {
  return (
    <header style={styles.topHeader}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          ...styles.searchBox,
          borderColor: isSearchQueryUuid ? '#ba6e51' : '#e5e5e5',
          width: isSearchQueryUuid ? '380px' : '300px',
          transition: 'all 0.2s ease'
        }}>
          <Search size={18} color={isSearchQueryUuid ? '#ba6e51' : '#8e8e8e'} />
          <input 
            type="text" 
            placeholder="Пошук поїздок або інвайт-код..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            style={styles.searchInput} 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', color: '#8e8e8e' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isSearchQueryUuid && (
          <button 
            onClick={handleJoinByInviteCode}
            disabled={joinLoading}
            style={styles.joinCodeBtn}
            title="Приєднатися до поїздки за кодом"
          >
            {joinLoading ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <UserCheck size={16} /> Приєднатися
              </>
            )}
          </button>
        )}
      </div>

      <button style={styles.bellBtn}>
        <Bell size={18} color="#2b2b2b" />
      </button>
    </header>
  )
}