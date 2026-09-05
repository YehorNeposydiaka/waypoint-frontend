import React from 'react'
import {
  Compass,
  Home,
  MapPin,
  History,
  BarChart3,
  Trash2,
  Settings,
  LogOut
} from 'lucide-react'
import { styles } from '../styles/tripListPageStyles'

export default function Sidebar({
  activeNav,
  setActiveNav,
  selectedTrip,
  setSelectedTrip,
  user,
  getInitials,
  onOpenSettings,
  onLogout
}) {
  const navItems = [
    { name: 'Головна', icon: <Home size={18} /> },
    { name: 'Поточні подорожі', icon: <MapPin size={18} /> },
    { name: 'Історія подорожей', icon: <History size={18} /> },
    { name: 'Статистика', icon: <BarChart3 size={18} /> },
    { name: 'Видалені подорожі', icon: <Trash2 size={18} /> },
  ]

  return (
    <aside style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px' }}>
      <div>
        <div style={styles.logoContainer}>
          <Compass size={24} color="#2b2b2b" />
          <span style={styles.logoText}>WayPoint</span>
        </div>

        <nav style={styles.navMenu}>
          {navItems.map(item => (
            <button
              key={item.name}
              onClick={() => {
                setSelectedTrip(null)
                setActiveNav(item.name)
              }}
              style={{
                ...styles.navItem,
                ...(activeNav === item.name && !selectedTrip ? styles.navItemActive : {})
              }}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </nav>
      </div>

      <div style={styles.sidebarFooter}>
        <button onClick={onOpenSettings} style={styles.navItem}>
          <Settings size={18} /> Налаштування
        </button>
        
        <div style={styles.userProfile}>
          <div style={styles.avatar}>
            {user ? getInitials(user.fullName) : '...'}
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>
              {user ? user.fullName : 'Завантаження...'}
            </span>
            <span style={styles.userRole}>
              {user ? user.email : ''}
            </span>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn} title="Вийти">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}