import React from 'react'
import { CheckSquare, Square, Trash2, UserPlus, ChevronDown, ChevronUp } from 'lucide-react'
import { styles } from '../../../styles/tripListPageStyles'

export default function PreparationItem({
  item,
  expandedPrepId,
  setExpandedPrepId,
  members = [],
  canEdit,
  onToggleComplete,
  onDeletePrep,
  onOpenAssignModal
}) {
  const isExpanded = expandedPrepId === item.id
  const assignedMember = members.find(m => String(m.userId) === String(item.assignedMemberId))

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '10px',
      padding: '12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => onToggleComplete(item.id)}>
          {item.completed ? (
            <CheckSquare size={20} color="#ba6e51" />
          ) : (
            <Square size={20} color="#888" />
          )}
          <span style={{
            fontSize: '15px',
            fontWeight: '500',
            textDecoration: item.completed ? 'line-through' : 'none',
            color: item.completed ? '#888' : '#2b2b2b'
          }}>
            {item.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onOpenAssignModal(item)}
            title="Призначити відповідального"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e5e5',
              background: '#f9f9f9', cursor: 'pointer', fontSize: '12px', color: '#555'
            }}
          >
            <UserPlus size={14} />
            <span>{assignedMember ? assignedMember.fullName : 'Ніхто'}</span>
          </button>

          {item.description && (
            <button
              onClick={() => setExpandedPrepId(isExpanded ? null : item.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#666' }}
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => onDeletePrep(item.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#d32f2f' }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {isExpanded && item.description && (
        <div style={{ padding: '8px 12px', backgroundColor: '#f9f9f9', borderRadius: '6px', fontSize: '13px', color: '#666', marginTop: '4px' }}>
          {item.description}
        </div>
      )}
    </div>
  )
}