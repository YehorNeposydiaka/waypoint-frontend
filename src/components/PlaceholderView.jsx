import React from 'react'
import { styles } from '../styles/tripListPageStyles'

export default function PlaceholderView({ title, icon }) {
  return (
    <div style={styles.placeholderContainer}>
      <div style={styles.placeholderIconWrapper}>{icon}</div>
      <h2 style={styles.placeholderTitle}>{title}</h2>
      <p style={styles.placeholderSubtitle}>
        Цей розділ наразі порожній або знаходиться в розробці.
      </p>
    </div>
  )
}