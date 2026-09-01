import React from 'react'
import { CheckSquare, Square, Trash2, UserPlus, ChevronDown, ChevronUp, Paperclip, Calendar } from 'lucide-react'
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
  const isCompleted = item.completed || item.isCompleted || false

  const assignedMember = members.find(m => 
    m.userId != null && 
    item.assignedMemberId != null && 
    String(m.userId).toLowerCase() === String(item.assignedMemberId).toLowerCase()
  )

  const toggleExpand = () => {
    setExpandedPrepId(isExpanded ? null : item.id)
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '10px',
      overflow: 'hidden'
    }}>
      {/* ВЕРХНЯ ЧАСТИНА КАРТКИ */}
      <div 
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={toggleExpand}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onToggleComplete(item.id)
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {isCompleted ? (
              <CheckSquare size={20} color="#2e7d32" />
            ) : (
              <Square size={20} color="#888" />
            )}
          </button>
          
          <span style={{
            fontSize: '15px',
            fontWeight: '600',
            textDecoration: isCompleted ? 'line-through' : 'none',
            color: isCompleted ? '#888' : '#2b2b2b'
          }}>
            {item.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {assignedMember && (
            <span style={{ fontSize: '13px', color: '#ba6e51', fontWeight: '600' }}>
              👤 {assignedMember.fullName}
            </span>
          )}

          {item.deadline && (
            <span style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} />
              {new Date(item.deadline).toLocaleDateString()}
            </span>
          )}

          <button 
            onClick={(e) => {
              e.stopPropagation()
              toggleExpand()
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#666' }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* РОЗГОРНУТА ЧАСТИНА */}
      {isExpanded && (
        <div style={{
          padding: '14px 16px',
          backgroundColor: '#fafafa',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {(item.note || item.description) && (
            <div>
              <span style={{ fontWeight: '600', fontSize: '13px', color: '#666' }}>Нотатка: </span>
              <span style={{ fontSize: '13px', color: '#2b2b2b' }}>{item.note || item.description}</span>
            </div>
          )}

          {item.attachmentLink && (
            <div>
              <span style={{ fontWeight: '600', fontSize: '13px', color: '#666' }}>Вкладення: </span>
              <a href={item.attachmentLink} target="_blank" rel="noreferrer" style={{ color: '#ba6e51', fontSize: '13px', textDecoration: 'underline' }}>
                <Paperclip size={13} style={{ display: 'inline', marginRight: '4px' }} />
                {item.attachmentLink}
              </a>
            </div>
          )}

          {item.cost !== null && item.cost !== undefined && (
            <div>
              <span style={{ fontWeight: '600', fontSize: '13px', color: '#666' }}>Вартість: </span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#2b2b2b' }}>${item.cost}</span>
            </div>
          )}

          {canEdit && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
              <button
                onClick={() => onOpenAssignModal(item)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ba6e51', fontSize: '13px', fontWeight: '600' }}
              >
                <UserPlus size={14} />
                {assignedMember ? 'Змінити відповідального' : 'Призначити відповідального'}
              </button>

              <button
                onClick={() => onDeletePrep(item.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', fontSize: '13px', fontWeight: '600' }}
              >
                <Trash2 size={14} /> Видалити
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}