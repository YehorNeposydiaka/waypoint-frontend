import React from 'react'
import { Plus, Loader2, Luggage } from 'lucide-react'
import PreparationItem from './PreparationItem'
import { styles } from '../../../styles/tripListPageStyles'

export default function PreparationTab({
  prepFilter,
  setPrepFilter,
  prepUserFilter,
  setPrepUserFilter,
  canEdit,
  setIsNewPrepOpen,
  prepLoading,
  filteredPreparations,
  expandedPrepId,
  setExpandedPrepId,
  members,
  onToggleComplete,
  onDeletePrep,
  onOpenAssignModal
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={styles.segmentedControlSmall}>
            {['All', 'Active', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setPrepFilter(status)}
                style={{
                  ...styles.segmentedBtnSmall,
                  ...(prepFilter === status ? styles.segmentedBtnActiveSmall : {})
                }}
              >
                {status === 'All' ? 'Всі' : status === 'Active' ? 'Актуальні' : 'Виконані'}
              </button>
            ))}
          </div>

          {canEdit && (
            <button onClick={() => setIsNewPrepOpen(true)} style={styles.primaryBtn}>
              <Plus size={16} /> Додати
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Учасник:</span>
          <select
            value={prepUserFilter}
            onChange={(e) => setPrepUserFilter(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: '8px', border: '1px solid #e5e5e5',
              backgroundColor: '#fff', fontSize: '13px', color: '#2b2b2b', outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="All">Всі учасники</option>
            {members.map(m => (
              <option key={m.userId} value={m.userId}>
                {m.fullName || m.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {prepLoading ? (
        <div style={styles.loaderContainer}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} color="#ba6e51" />
        </div>
      ) : filteredPreparations.length === 0 ? (
        <div style={styles.emptyTripsBox}>
          <Luggage size={36} color="#ba6e51" />
          <p style={{ margin: '12px 0 0 0', fontWeight: '500', color: '#666' }}>
            {canEdit ? 'Пункти підготовки відсутні для обраних фільтрів' : 'Немає пунктів підготовки'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredPreparations.map(item => (
            <PreparationItem
              key={item.id}
              item={item}
              expandedPrepId={expandedPrepId}
              setExpandedPrepId={setExpandedPrepId}
              members={members}
              canEdit={canEdit}
              onToggleComplete={onToggleComplete}
              onDeletePrep={onDeletePrep}
              onOpenAssignModal={onOpenAssignModal}
            />
          ))}
        </div>
      )}
    </div>
  )
}