import type { TaskRow } from '@/entities/task'
import { defaultTaskStatusId } from '@/entities/task'
import type { BitrixParsingResult, ParseIssue, RawSection } from '../model/types'
import {
  arrowGlobalPattern,
  columnSeparatorPattern,
  durationSomewherePattern,
  grandTotalMarkerPattern,
  grandTotalValuePattern,
  sectionTotalPattern,
  taskLinePattern,
} from './patterns'

function isColumnHeaderLine(line: string): boolean {
  const firstCell = line.split(columnSeparatorPattern)[0]

  return firstCell?.trim().toLowerCase() === 'id'
}

function countNestingLevel(arrowsText: string): number {
  return arrowsText.match(arrowGlobalPattern)?.length ?? 0
}

function buildTaskRow(
  groups: Record<string, string | undefined>,
  statusId: string,
): TaskRow | null {
  const taskId = Number(groups.id)

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return null
  }

  return {
    id: taskId,
    title: (groups.title ?? '').trim(),
    durationText: `${Number(groups.hours)} ч. ${Number(groups.minutes)}м.`,
    nestingLevel: countNestingLevel(groups.arrows ?? ''),
    statusId,
    isIncluded: true,
  }
}

function createSection(rawName: string): RawSection {
  return { rawName, taskRows: [], sectionTotalText: null }
}

export function parseBitrixText(
  rawInputText: string,
  defaultStatusId: string = defaultTaskStatusId,
): BitrixParsingResult {
  const rawLines = rawInputText.split(/\r?\n/)
  const sections: RawSection[] = []
  const parsingIssues: ParseIssue[] = []

  let currentSection: RawSection | null = null
  let grandTotalText: string | null = null
  let isExpectingGrandTotalValue = false

  const closeCurrentSection = (): void => {
    if (currentSection) {
      sections.push(currentSection)
      currentSection = null
    }
  }

  rawLines.forEach((rawLine, lineIndex) => {
    const lineNumber = lineIndex + 1
    const line = rawLine.trim()

    if (line.length === 0) {
      return
    }

    if (isExpectingGrandTotalValue) {
      isExpectingGrandTotalValue = false
      const grandTotalMatch = grandTotalValuePattern.exec(line)

      if (grandTotalMatch?.groups?.duration) {
        grandTotalText = grandTotalMatch.groups.duration.trim()
        return
      }
    }

    if (grandTotalMarkerPattern.test(line)) {
      closeCurrentSection()
      isExpectingGrandTotalValue = true
      return
    }

    const sectionTotalMatch = sectionTotalPattern.exec(line)
    if (sectionTotalMatch?.groups?.duration) {
      if (!currentSection) {
        parsingIssues.push({
          severity: 'warning',
          lineNumber,
          sourceLineText: rawLine,
          message: 'Строка «Итого» встретилась вне раздела и была пропущена.',
        })
        return
      }

      currentSection.sectionTotalText = sectionTotalMatch.groups.duration.trim()
      closeCurrentSection()
      return
    }

    if (isColumnHeaderLine(line)) {
      return
    }

    const taskMatch = taskLinePattern.exec(line)
    if (taskMatch?.groups) {
      const taskRow = buildTaskRow(taskMatch.groups, defaultStatusId)

      if (!taskRow) {
        parsingIssues.push({
          severity: 'error',
          lineNumber,
          sourceLineText: rawLine,
          message: 'ID задачи должен быть положительным числом.',
        })
        return
      }

      if (!currentSection) {
        currentSection = createSection('Без раздела')
        parsingIssues.push({
          severity: 'warning',
          lineNumber,
          sourceLineText: rawLine,
          message: 'Задача встретилась до заголовка раздела — добавлена в раздел «Без раздела».',
        })
      }

      currentSection.taskRows.push(taskRow)
      return
    }

    if (currentSection && durationSomewherePattern.test(line)) {
      parsingIssues.push({
        severity: 'error',
        lineNumber,
        sourceLineText: rawLine,
        message: 'Не удалось разобрать строку задачи. Ожидается: <ID> <название> <N ч. Nм.>.',
      })
      return
    }

    if (currentSection) {
      parsingIssues.push({
        severity: 'warning',
        lineNumber,
        sourceLineText: rawLine,
        message: `Раздел «${currentSection.rawName}» закрыт без строки «Итого».`,
      })
      closeCurrentSection()
    }

    currentSection = createSection(line)
  })

  closeCurrentSection()

  return { sections, grandTotalText, parsingIssues }
}
