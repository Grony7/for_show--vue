const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/

export function buildDefaultReportDate(): string {
  const now = new Date()
  const yearText = String(now.getFullYear())
  const monthText = String(now.getMonth() + 1).padStart(2, '0')
  const dayText = String(now.getDate()).padStart(2, '0')

  return `${yearText}-${monthText}-${dayText}`
}

export function formatReportDate(reportDate: string): string {
  const normalizedDate = reportDate.trim()
  const dateMatchResult = isoDatePattern.exec(normalizedDate)

  if (!dateMatchResult) {
    return normalizedDate
  }

  const [, yearText, monthText, dayText] = dateMatchResult

  return `${dayText}.${monthText}.${yearText}`
}
