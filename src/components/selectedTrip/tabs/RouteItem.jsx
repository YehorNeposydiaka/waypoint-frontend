import React from 'react'
import { ChevronDown, ChevronUp, Trash2, Pencil, MapPin, Plane, Link as LinkIcon, Clock } from 'lucide-react'
import { styles } from '../../../styles/tripListPageStyles'
import {
  CHECKPOINT_TYPE_LABELS,
  TRANSFER_TYPE_LABELS,
  formatDateOnly,
  formatTimeOnly
} from '../../../utils/routeUtils'

export default function RouteItem({
  item,
  expandedId,
  setExpandedId,
  canEdit,
  onDelete,
  onOpenEdit
}) {
  const isTransfer = item.kind === 'transfer'
  const isExpanded = expandedId === `${item.kind}-${item.id}`

  const toggleExpand = () => {
    setExpandedId(isExpanded ? null : `${item.kind}-${item.id}`)
  }

  const primaryTime = isTransfer ? item.departureTime : item.startTime
  const secondaryTime = isTransfer ? item.arrivalTime : item.endTime

  const typeLabel = isTransfer
    ? (TRANSFER_TYPE_LABELS[item.type] || item.type)
    : (CHECKPOINT_TYPE_LABELS[item.checkpointType] || item.checkpointType)

  return (
    <div style={styles.prepCard}>
      <div style={styles.prepCardHeader} onClick={toggleExpand}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: isTransfer ? '#eaf1fb' : '#f3ece7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {isTransfer
              ? <Plane size={16} color="#3a6fb5" />
              : <MapPin size={16} color="#ba6e51" />}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ ...styles.prepTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.title}
            </span>
            <span style={{ fontSize: '11px', color: '#8e8e8e' }}>{typeLabel}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {primaryTime && (
            <span style={styles.prepDeadline}>
              <Clock size={13} style={{ marginRight: '4px' }} />
              {formatDateOnly(primaryTime)}
              {formatTimeOnly(primaryTime) && ` · ${formatTimeOnly(primaryTime)}`}
            </span>
          )}

          <button onClick={(e) => { e.stopPropagation(); toggleExpand() }} style={styles.expandBtn}>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={styles.prepCardBody}>
          {(item.note) && (
            <div style={styles.prepDetailRow}>
              <span style={styles.prepDetailLabel}>Нотатка:</span>
              <span style={{ fontSize: '13px' }}>{item.note}</span>
            </div>
          )}

          {isTransfer ? (
            <>
              <div style={styles.prepDetailRow}>
                <span style={styles.prepDetailLabel}>Звідки:</span>
                <span style={{ fontSize: '13px' }}>{item.departureLocation}</span>
              </div>
              <div style={styles.prepDetailRow}>
                <span style={styles.prepDetailLabel}>Куди:</span>
                <span style={{ fontSize: '13px' }}>{item.arrivalLocation}</span>
              </div>
              {secondaryTime && (
                <div style={styles.prepDetailRow}>
                  <span style={styles.prepDetailLabel}>Прибуття:</span>
                  <span style={{ fontSize: '13px' }}>
                    {formatDateOnly(secondaryTime)}
                    {formatTimeOnly(secondaryTime) && ` · ${formatTimeOnly(secondaryTime)}`}
                  </span>
                </div>
              )}
              {item.ticketUrl && (
                <div style={styles.prepDetailRow}>
                  <span style={styles.prepDetailLabel}>Квиток:</span>
                  <a href={item.ticketUrl} target="_blank" rel="noreferrer" style={styles.prepLink}>
                    <LinkIcon size={13} /> {item.ticketUrl}
                  </a>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={styles.prepDetailRow}>
                <span style={styles.prepDetailLabel}>Місце:</span>
                <span style={{ fontSize: '13px' }}>{item.location}</span>
              </div>
              {secondaryTime && (
                <div style={styles.prepDetailRow}>
                  <span style={styles.prepDetailLabel}>До:</span>
                  <span style={{ fontSize: '13px' }}>
                    {formatDateOnly(secondaryTime)}
                    {formatTimeOnly(secondaryTime) && ` · ${formatTimeOnly(secondaryTime)}`}
                  </span>
                </div>
              )}
            </>
          )}

          {item.cost !== null && item.cost !== undefined && (
            <div style={styles.prepDetailRow}>
              <span style={styles.prepDetailLabel}>Вартість:</span>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>${item.cost}</span>
            </div>
          )}

          {canEdit && (
            <div style={styles.prepActionsRow}>
              <button onClick={() => onOpenEdit(item)} style={styles.prepActionBtn}>
                <Pencil size={13} /> Редагувати
              </button>
              <button
                onClick={() => onDelete(item)}
                style={{ ...styles.prepActionBtn, color: '#d32f2f' }}
              >
                <Trash2 size={13} /> Видалити
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}