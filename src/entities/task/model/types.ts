export const taskStatusValues = ['STARTED', 'CONTINUING', 'DONE', 'FINISHED'] as const

export type TaskStatus = (typeof taskStatusValues)[number]

export const taskStatusLabelByValue: Record<TaskStatus, string> = {
  STARTED: 'Начал выполнение задачи',
  CONTINUING: 'Продолжаю выполнение задачи',
  DONE: 'Выполнил задачу',
  FINISHED: 'Закончил выполнение задачи',
}

export const taskStatusShortLabelByValue: Record<TaskStatus, string> = {
  STARTED: 'Начал',
  CONTINUING: 'Продолжаю',
  DONE: 'Выполнил',
  FINISHED: 'Закончил',
}

export const defaultTaskStatus: TaskStatus = 'DONE'

export interface TaskRow {
  id: number
  title: string
  durationText: string
  nestingLevel: number
  status: TaskStatus
  isIncluded: boolean
}
