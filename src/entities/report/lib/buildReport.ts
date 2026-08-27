import {
  defaultReportDocumentTemplate,
  defaultReportLineTemplate,
  defaultReportSectionTemplate,
  defaultTaskLinkTemplate,
} from '@/shared/config'
import type { TemplateIssue } from '@/shared/lib'
import {
  deduplicateTemplateIssues,
  ensureRequiredPlaceholder,
  formatReportDate,
  renderTemplate,
} from '@/shared/lib'
import type { TaskRow, TaskStatusPreset } from '@/entities/task'
import type { ReportSection } from '../model/types'
import {
  documentTemplateVariableNames,
  lineTemplateVariableNames,
  sectionTemplateVariableNames,
} from './templateVariables'
import type {
  DocumentTemplateVariables,
  LineTemplateVariables,
  SectionTemplateVariables,
} from './templateVariables'

const nestingIndentUnit = '  '

const missingDurationPlaceholder = '—'

export interface ReportTemplates {
  lineTemplate: string
  sectionTemplate: string
  documentTemplate: string
  linkTemplate: string
}

export interface BuildReportInput {
  sections: ReportSection[]
  templates: ReportTemplates
  statuses: TaskStatusPreset[]
  reportDate: string
  grandTotalText: string | null
  shouldFlattenHierarchy: boolean
}

export interface BuildReportResult {
  markdownReportText: string
  issues: TemplateIssue[]
}

function normalizeTemplate(templateValue: string, defaultTemplateValue: string): string {
  return templateValue.trim().length > 0 ? templateValue : defaultTemplateValue
}

export function buildTaskLink(
  taskId: number,
  projectId: number | null,
  linkTemplate: string,
): string {
  const normalizedLinkTemplate = normalizeTemplate(linkTemplate, defaultTaskLinkTemplate).trim()

  if (normalizedLinkTemplate.includes('{id}') || normalizedLinkTemplate.includes('{projectId}')) {
    return normalizedLinkTemplate
      .replaceAll('{projectId}', projectId === null ? '' : String(projectId))
      .replaceAll('{id}', String(taskId))
  }

  const templateWithTrailingSlash = normalizedLinkTemplate.endsWith('/')
    ? normalizedLinkTemplate
    : `${normalizedLinkTemplate}/`

  return `${templateWithTrailingSlash}${taskId}`
}

function buildLineVariables(
  taskRow: TaskRow,
  projectId: number | null,
  linkTemplate: string,
  statusLabelById: Map<string, string>,
): LineTemplateVariables {
  return {
    id: String(taskRow.id),
    title: taskRow.title,
    duration: taskRow.durationText,
    statusText: statusLabelById.get(taskRow.statusId) ?? '',
    projectId: projectId === null ? '' : String(projectId),
    link: buildTaskLink(taskRow.id, projectId, linkTemplate),
  }
}

export function buildReport(buildReportInput: BuildReportInput): BuildReportResult {
  const lineTemplate = normalizeTemplate(
    buildReportInput.templates.lineTemplate,
    defaultReportLineTemplate,
  )
  const documentTemplate = normalizeTemplate(
    buildReportInput.templates.documentTemplate,
    defaultReportDocumentTemplate,
  )

  const sectionTemplateWithPlaceholder = ensureRequiredPlaceholder(
    normalizeTemplate(buildReportInput.templates.sectionTemplate, defaultReportSectionTemplate),
    '{list}',
    'sectionTemplate',
  )
  const documentTemplateWithPlaceholder = ensureRequiredPlaceholder(
    documentTemplate,
    '{sections}',
    'documentTemplate',
  )

  const issues: TemplateIssue[] = [
    ...sectionTemplateWithPlaceholder.issues,
    ...documentTemplateWithPlaceholder.issues,
  ]

  const linkTemplateUsesProjectId = normalizeTemplate(
    buildReportInput.templates.linkTemplate,
    defaultTaskLinkTemplate,
  ).includes('{projectId}')

  const statusLabelById = new Map(
    buildReportInput.statuses.map((status) => [status.id, status.label]),
  )

  const renderedSectionTexts: string[] = []

  buildReportInput.sections.forEach((reportSection) => {
    const includedTaskRows = reportSection.taskRows.filter((taskRow) => taskRow.isIncluded)

    if (includedTaskRows.length === 0) {
      return
    }

    const renderedTaskLines = includedTaskRows.map((taskRow) => {
      const renderLineResult = renderTemplate(
        lineTemplate,
        buildLineVariables(
          taskRow,
          reportSection.matchedProjectId,
          buildReportInput.templates.linkTemplate,
          statusLabelById,
        ),
        lineTemplateVariableNames,
        'lineTemplate',
      )
      issues.push(...renderLineResult.issues)

      const indent = buildReportInput.shouldFlattenHierarchy
        ? ''
        : nestingIndentUnit.repeat(taskRow.nestingLevel)

      return `${indent}${renderLineResult.renderedText}`
    })

    const sectionVariables: SectionTemplateVariables = {
      projectName: reportSection.displayName,
      projectId:
        reportSection.matchedProjectId === null ? '' : String(reportSection.matchedProjectId),
      list: renderedTaskLines.join('\n'),
      sectionTotal: reportSection.sectionTotalText ?? missingDurationPlaceholder,
    }

    const renderSectionResult = renderTemplate(
      sectionTemplateWithPlaceholder.renderedText,
      sectionVariables,
      sectionTemplateVariableNames,
      'sectionTemplate',
    )
    issues.push(...renderSectionResult.issues)

    if (reportSection.matchedProjectId === null) {
      issues.push({
        severity: 'warning',
        scope: linkTemplateUsesProjectId ? 'linkTemplate' : 'sectionTemplate',
        message: linkTemplateUsesProjectId
          ? `Для раздела «${reportSection.rawName}» не задан ID проекта Bitrix — ссылки на его задачи будут неполными.`
          : `Для раздела «${reportSection.rawName}» не задан ID проекта Bitrix.`,
      })
    }

    renderedSectionTexts.push(renderSectionResult.renderedText)
  })

  const documentVariables: DocumentTemplateVariables = {
    date: formatReportDate(buildReportInput.reportDate),
    sections: renderedSectionTexts.join('\n\n'),
    grandTotal: buildReportInput.grandTotalText ?? missingDurationPlaceholder,
  }

  const renderDocumentResult = renderTemplate(
    documentTemplateWithPlaceholder.renderedText,
    documentVariables,
    documentTemplateVariableNames,
    'documentTemplate',
  )
  issues.push(...renderDocumentResult.issues)

  return {
    markdownReportText: renderDocumentResult.renderedText,
    issues: deduplicateTemplateIssues(issues),
  }
}
