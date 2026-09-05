// src/utils/statsUtils.js
// Допоміжні функції для табу "Статистика"

export const TRANSFER_TYPE_STAT_LABELS = {
  planeTransferCost: 'Літак',
  carTransferCost: 'Авто',
  shipTransferCost: 'Корабель',
  trainTransferCost: 'Потяг',
  busTransferCost: 'Автобус',
  otherTransferCost: 'Інше'
}

export const CHECKPOINT_TYPE_STAT_LABELS = {
  foodCost: 'Їжа',
  entertainmentCost: 'Розваги',
  landmarkCost: "Пам'ятки",
  accommodationCost: 'Проживання',
  shoppingCost: 'Шопінг',
  otherCost: 'Інше'
}

export function formatUAH(value) {
  const num = Number(value) || 0
  return `${num.toLocaleString('uk-UA', { maximumFractionDigits: 2 })} ₴`
}

// Відсоток value відносно total; безпечно повертає 0 коли total дорівнює 0.
export function percentOf(value, total) {
  const num = Number(value) || 0
  const totalNum = Number(total) || 0
  if (totalNum === 0) return 0
  return (num / totalNum) * 100
}

export function formatPercent(value, total) {
  return `${percentOf(value, total).toFixed(1)}%`
}

export function formatDuration(totalMinutes) {
  const minutes = Number(totalMinutes) || 0
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours === 0) return `${mins} хв`
  if (mins === 0) return `${hours} год`
  return `${hours} год ${mins} хв`
}

// Будує три основні категорії (Трансфер / Точки / Підготовка) для donut+bars
export function buildCategoryBreakdown(stats) {
  if (!stats) return []
  return [
    { id: 'transfer', label: 'Трансфер', value: stats.transferTotalCost, color: '#3a6fb5' },
    { id: 'checkpoints', label: 'Точки', value: stats.checkpointsCost, color: '#ba6e51' },
    { id: 'preparation', label: 'Підготовка', value: stats.preparationCost, color: '#6ea86e' }
  ]
}

// Будує масив типів усередині категорії (для деталізації), з сумою і кольором категорії.
export function buildTypeBreakdown(stats, labelsMap) {
  if (!stats) return []
  return Object.entries(labelsMap)
    .map(([key, label]) => ({ key, label, value: stats[key] ?? 0 }))
    .filter(entry => entry.value > 0)
    .sort((a, b) => b.value - a.value)
}