import React from 'react'
import { Loader2, Clock, BarChart3 } from 'lucide-react'
import { styles } from '../../../styles/tripListPageStyles'
import DonutChart from './DonutChart'
import {
  formatUAH,
  formatPercent,
  formatDuration,
  buildCategoryBreakdown,
  buildTypeBreakdown,
  TRANSFER_TYPE_STAT_LABELS,
  CHECKPOINT_TYPE_STAT_LABELS
} from '../../../utils/statsUtils'

function CategoryBar({ label, value, total, color }) {
  const percent = total > 0 ? (value / total) * 100 : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: color, display: 'inline-block' }} />
          {label}
        </span>
        <span style={{ color: '#666' }}>{formatUAH(value)} · {formatPercent(value, total)}</span>
      </div>
      <div style={{ height: '8px', backgroundColor: '#f0ebe6', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percent}%`, backgroundColor: color, borderRadius: '4px' }} />
      </div>
    </div>
  )
}

function TypeBreakdownList({ title, entries, categoryTotal, tripTotal, color }) {
  if (entries.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span style={{ fontSize: '13px', fontWeight: '700', color: '#2b2b2b', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: color, display: 'inline-block' }} />
        {title}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {entries.map(entry => (
          <div key={entry.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingLeft: '16px' }}>
            <span style={{ color: '#4a4a4a' }}>{entry.label}</span>
            <span style={{ color: '#666' }}>
              {formatUAH(entry.value)} · {formatPercent(entry.value, categoryTotal)} від категорії · {formatPercent(entry.value, tripTotal)} від поїздки
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StatsTab({ stats, statsLoading, statsView, setStatsView }) {
  if (statsLoading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} color="#ba6e51" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div style={styles.emptyTripsBox}>
        <BarChart3 size={36} color="#ba6e51" />
        <p style={{ margin: '12px 0 0 0', fontWeight: '500', color: '#666' }}>
          Статистику ще не вдалося завантажити
        </p>
      </div>
    )
  }

  const categories = buildCategoryBreakdown(stats)
  const total = Number(stats.total) || 0

  const transferTypes = buildTypeBreakdown(stats, TRANSFER_TYPE_STAT_LABELS)
  const checkpointTypes = buildTypeBreakdown(stats, CHECKPOINT_TYPE_STAT_LABELS)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
      <div style={styles.segmentedControlSmall}>
        <button
          onClick={() => setStatsView('overview')}
          style={{ ...styles.segmentedBtnSmall, ...(statsView === 'overview' ? styles.segmentedBtnActiveSmall : {}) }}
        >
          Огляд
        </button>
        <button
          onClick={() => setStatsView('details')}
          style={{ ...styles.segmentedBtnSmall, ...(statsView === 'details' ? styles.segmentedBtnActiveSmall : {}) }}
        >
          Деталі
        </button>
      </div>

      {stats.transferTime > 0 && (
        <div style={{ ...styles.sideCard, display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px' }}>
          <Clock size={18} color="#ba6e51" />
          <span style={{ fontSize: '13px', color: '#4a4a4a' }}>
            Загальний час в дорозі: <strong>{formatDuration(stats.transferTime)}</strong>
          </span>
        </div>
      )}

      {statsView === 'overview' ? (
        <div style={styles.sideCard}>
          <div className="stats-overview-row" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
            <DonutChart segments={categories} total={total} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minWidth: '220px' }}>
              {categories.map(cat => (
                <CategoryBar key={cat.id} label={cat.label} value={cat.value} total={total} color={cat.color} />
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '24px' }}>
            <div style={styles.statBox}>
              <span style={styles.statNumber}>{stats.transfersAmount}</span>
              <span style={styles.statLabel}>Трансферів</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statNumber}>{stats.checkpointsAmount}</span>
              <span style={styles.statLabel}>Точок</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statNumber}>{stats.preparationAmount}</span>
              <span style={styles.statLabel}>Пунктів підготовки</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...styles.sideCard, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TypeBreakdownList
            title={`Трансфер · ${formatUAH(stats.transferTotalCost)}`}
            entries={transferTypes}
            categoryTotal={stats.transferTotalCost}
            tripTotal={total}
            color="#3a6fb5"
          />
          <TypeBreakdownList
            title={`Точки · ${formatUAH(stats.checkpointsCost)}`}
            entries={checkpointTypes}
            categoryTotal={stats.checkpointsCost}
            tripTotal={total}
            color="#ba6e51"
          />

          {stats.preparationCost > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#2b2b2b' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#6ea86e', display: 'inline-block' }} />
                Підготовка
              </span>
              <span style={{ color: '#666' }}>
                {formatUAH(stats.preparationCost)} · {formatPercent(stats.preparationCost, total)} від поїздки
              </span>
            </div>
          )}

          {transferTypes.length === 0 && checkpointTypes.length === 0 && (stats.preparationCost ?? 0) === 0 && (
            <p style={{ margin: 0, fontSize: '13px', color: '#8e8e8e' }}>Ще немає витрат для деталізації</p>
          )}
        </div>
      )}
    </div>
  )
}