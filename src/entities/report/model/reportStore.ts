import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { buildDefaultReportDate } from '@/shared/lib'
import type { TaskStatus } from '@/entities/task'
import { useSettingsStore } from '@/entities/settings'
import { buildReport } from '../lib/buildReport'
import { matchSectionsToProjects } from '../lib/matchSectionsToProjects'
import { parseBitrixText } from '../lib/parseBitrixText'
import type { ParseIssue, RawSection } from './types'

export const useReportStore = defineStore('report', () => {
  const settingsStore = useSettingsStore()

  const rawInputText = ref('')
  const rawSections = ref<RawSection[]>([])
  const grandTotalText = ref<string | null>(null)
  const parsingIssues = ref<ParseIssue[]>([])
  const reportDate = ref(buildDefaultReportDate())
  const informationMessage = ref<string | null>(null)

  const reportSections = computed(() =>
    matchSectionsToProjects(rawSections.value, settingsStore.projects),
  )

  const unmatchedSectionNames = computed(() =>
    reportSections.value
      .filter((reportSection) => reportSection.matchedProjectId === null)
      .map((reportSection) => reportSection.rawName),
  )

  const buildReportResult = computed(() =>
    buildReport({
      sections: reportSections.value,
      templates: settingsStore.templates,
      reportDate: reportDate.value,
      grandTotalText: grandTotalText.value,
      shouldFlattenHierarchy: settingsStore.shouldFlattenHierarchy,
    }),
  )

  const markdownReportText = computed(() => buildReportResult.value.markdownReportText)

  const reportBuildIssues = computed(() => {
    const issues = [...buildReportResult.value.issues]

    if (settingsStore.isUsingDefaultLinkTemplate && rawSections.value.length > 0) {
      issues.unshift({
        severity: 'warning',
        scope: 'linkTemplate',
        message: 'Замените ссылку по умолчанию на адрес вашего Bitrix24.',
      })
    }

    return issues
  })

  const totalTaskCount = computed(() =>
    rawSections.value.reduce((count, rawSection) => count + rawSection.taskRows.length, 0),
  )

  function parseRawInput(): void {
    const parsingResult = parseBitrixText(rawInputText.value)

    rawSections.value = parsingResult.sections
    grandTotalText.value = parsingResult.grandTotalText
    parsingIssues.value = parsingResult.parsingIssues

    const errorCount = parsingResult.parsingIssues.filter(
      (parseIssue) => parseIssue.severity === 'error',
    ).length
    const taskCount = parsingResult.sections.reduce(
      (count, rawSection) => count + rawSection.taskRows.length,
      0,
    )

    informationMessage.value =
      taskCount === 0 && parsingResult.sections.length === 0
        ? 'Не удалось найти ни одного раздела. Проверьте вставленный текст.'
        : `Разделов: ${parsingResult.sections.length}. Задач: ${taskCount}. Ошибок разбора: ${errorCount}.`
  }

  function setRawInputText(nextRawInputText: string): void {
    rawInputText.value = nextRawInputText
    informationMessage.value = null
  }

  function setReportDate(nextReportDate: string): void {
    reportDate.value = nextReportDate
  }

  function setTaskIncluded(sectionIndex: number, taskId: number, isIncluded: boolean): void {
    const targetSection = rawSections.value[sectionIndex]

    if (!targetSection) {
      return
    }

    targetSection.taskRows = targetSection.taskRows.map((taskRow) =>
      taskRow.id === taskId ? { ...taskRow, isIncluded } : taskRow,
    )
  }

  function setTaskStatus(sectionIndex: number, taskId: number, status: TaskStatus): void {
    const targetSection = rawSections.value[sectionIndex]

    if (!targetSection) {
      return
    }

    targetSection.taskRows = targetSection.taskRows.map((taskRow) =>
      taskRow.id === taskId ? { ...taskRow, status } : taskRow,
    )
  }

  function applyStatusToAllTasks(status: TaskStatus): void {
    rawSections.value = rawSections.value.map((rawSection) => ({
      ...rawSection,
      taskRows: rawSection.taskRows.map((taskRow) => ({ ...taskRow, status })),
    }))
    informationMessage.value = 'Статус применён ко всем задачам.'
  }

  function setSectionTasksIncluded(sectionIndex: number, isIncluded: boolean): void {
    const targetSection = rawSections.value[sectionIndex]

    if (!targetSection) {
      return
    }

    targetSection.taskRows = targetSection.taskRows.map((taskRow) => ({ ...taskRow, isIncluded }))
  }

  function setInformationMessage(message: string | null): void {
    informationMessage.value = message
  }

  return {
    rawInputText,
    rawSections,
    grandTotalText,
    parsingIssues,
    reportDate,
    informationMessage,
    reportSections,
    unmatchedSectionNames,
    markdownReportText,
    reportBuildIssues,
    totalTaskCount,
    parseRawInput,
    setRawInputText,
    setReportDate,
    setTaskIncluded,
    setTaskStatus,
    applyStatusToAllTasks,
    setSectionTasksIncluded,
    setInformationMessage,
  }
})
