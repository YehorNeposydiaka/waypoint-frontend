// src/utils/routeUtils.js
// Допоміжні функції для табу "Поїздка" (чекпоінти + трансфери)

export const CHECKPOINT_TYPE_LABELS = {
  FOOD: 'Їжа',
  ENTERTAINMENT: 'Розваги',
  LANDMARK: "Пам'ятка",
  ACCOMMODATION: 'Проживання',
  SHOPPING: 'Шопінг',
  OTHER: 'Інше'
}

export const TRANSFER_TYPE_LABELS = {
  PLANE: 'Літак',
  CAR: 'Авто',
  SHIP: 'Корабель',
  TRAIN: 'Потяг',
  BUS: 'Автобус',
  FOOT: 'Пішки',
  OTHER: 'Інше'
}

// Час елемента маршруту, який використовується для сортування/групування по днях.
// Для чекпоінта — startTime, для трансферу — departureTime.
export function getItemTime(item) {
  if (item.kind === 'transfer') return item.departureTime || null
  return item.startTime || null
}

// Порівняння для сортування за хронологією; елементи без часу йдуть в кінець.
export function compareByTime(a, b) {
  const ta = getItemTime(a)
  const tb = getItemTime(b)
  if (!ta && !tb) return 0
  if (!ta) return 1
  if (!tb) return -1
  return new Date(ta) - new Date(tb)
}

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDateOnly(value) {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatTimeOnly(value) {
  if (!value) return ''
  const date = new Date(value)
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0
  if (!hasTime) return ''
  return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
}

// Повертає масив дат (як 'YYYY-MM-DD' рядків) поїздки від startDate до endDate включно.
export function getTripDays(startDate, endDate) {
  if (!startDate) return []
  const start = new Date(`${startDate}T00:00:00`)
  const end = endDate ? new Date(`${endDate}T00:00:00`) : start

  const days = []
  const current = new Date(start)
  while (current <= end) {
    days.push(current.toISOString().slice(0, 10))
    current.setDate(current.getDate() + 1)
  }
  return days
}

// Повертає 'YYYY-MM-DD' для дати елемента маршруту (для групування по днях таймлайну)
export function getItemDateKey(item) {
  const time = getItemTime(item)
  if (!time) return null
  return new Date(time).toISOString().slice(0, 10)
}

// Формує LocalDateTime-сумісний рядок ('YYYY-MM-DDTHH:mm:ss') з окремих date/time інпутів.
// Якщо час не вказано — використовується 00:00.
export function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr) return null
  const time = timeStr && timeStr.trim() ? timeStr : '00:00'
  return `${dateStr}T${time}:00`
}

// Додає до дати+часу (рядок 'YYYY-MM-DDTHH:mm:ss' або 'YYYY-MM-DD') duration у хвилинах.
export function addMinutes(dateTimeStr, minutes) {
  if (!dateTimeStr || !minutes) return null
  const date = new Date(dateTimeStr)
  date.setMinutes(date.getMinutes() + Number(minutes))
  // Повертаємо у форматі без міллісекунд/таймзони, сумісному з LocalDateTime
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}