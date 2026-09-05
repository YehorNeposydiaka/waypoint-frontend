import React from 'react'

// Простий SVG-донат без зовнішніх залежностей.
// segments: [{ id, label, value, color }]
export default function DonutChart({ segments, total, size = 180, strokeWidth = 26 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  const safeTotal = total > 0 ? total : 1
  let cumulativePercent = 0

  const arcs = segments
    .filter(s => s.value > 0)
    .map(segment => {
      const fraction = segment.value / safeTotal
      const dashArray = `${fraction * circumference} ${circumference}`
      const dashOffset = -cumulativePercent * circumference
      cumulativePercent += fraction
      return { ...segment, dashArray, dashOffset }
    })

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f0ebe6"
          strokeWidth={strokeWidth}
        />
        {arcs.map(arc => (
          <circle
            key={arc.id}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            transform={`rotate(-90 ${center} ${center})`}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{ fontSize: '12px', color: '#8e8e8e' }}>Всього</span>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#2b2b2b', textAlign: 'center' }}>
          {total.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴
        </span>
      </div>
    </div>
  )
}