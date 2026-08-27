export interface TaskStatusPreset {
  id: string
  label: string
  shortLabel: string
}

export const defaultTaskStatusId = 'done'

export function buildDefaultTaskStatuses(): TaskStatusPreset[] {
  return [
    { id: 'started', label: 'Начал выполнение задачи', shortLabel: 'Начал' },
    { id: 'continuing', label: 'Продолжаю выполнение задачи', shortLabel: 'Продолжаю' },
    { id: 'done', label: 'Выполнил задачу', shortLabel: 'Выполнил' },
    { id: 'finished', label: 'Закончил выполнение задачи', shortLabel: 'Закончил' },
  ]
}

export interface TaskRow {
  id: number
  title: string
  durationText: string
  nestingLevel: number
  statusId: string
  isIncluded: boolean
}
