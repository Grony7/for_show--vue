import { describe, expect, it } from 'vitest'
import type { TaskRow } from '@/entities/task'
import type { ReportSection } from '../model/types'
import { buildReport } from './buildReport'
import type { ReportTemplates } from './buildReport'

const templates: ReportTemplates = {
  lineTemplate: '- {statusText} №{id} - {title} ({duration})',
  sectionTemplate: '## {projectName} (#{projectId})\n{list}\nИтого: {sectionTotal}',
  documentTemplate: 'Отчёт за {date}\n\n{sections}\n\nВсего: {grandTotal}',
  linkTemplate: 'https://bitrix.example.com/tasks/{id}',
}

function buildTask(overrides: Partial<TaskRow> = {}): TaskRow {
  return {
    id: 100,
    title: 'Задача',
    durationText: '1 ч. 0м.',
    nestingLevel: 0,
    status: 'DONE',
    isIncluded: true,
    ...overrides,
  }
}

function buildSection(overrides: Partial<ReportSection> = {}): ReportSection {
  return {
    rawName: 'Внутренние задачи',
    displayName: 'Внутренние задачи',
    matchedProjectId: 1001,
    sectionTotalText: '4 ч. 10м.',
    taskRows: [buildTask()],
    ...overrides,
  }
}

describe('buildReport', () => {
  it('подставляет ID проекта и замороженные итоги в отчёт', () => {
    const buildResult = buildReport({
      sections: [buildSection()],
      templates,
      reportDate: '2026-08-27',
      grandTotalText: '54 ч. 48м.',
      shouldFlattenHierarchy: false,
    })

    expect(buildResult.markdownReportText).toBe(
      [
        'Отчёт за 27.08.2026',
        '',
        '## Внутренние задачи (#1001)',
        '- Выполнил задачу №100 - Задача (1 ч. 0м.)',
        'Итого: 4 ч. 10м.',
        '',
        'Всего: 54 ч. 48м.',
      ].join('\n'),
    )
  })

  it('сохраняет вложенность отступами и убирает её в плоском режиме', () => {
    const sections = [
      buildSection({
        taskRows: [buildTask({ id: 1 }), buildTask({ id: 2, nestingLevel: 2, title: 'Подзадача' })],
      }),
    ]

    const nestedResult = buildReport({
      sections,
      templates,
      reportDate: '2026-08-27',
      grandTotalText: '1 ч. 0м.',
      shouldFlattenHierarchy: false,
    })
    const flatResult = buildReport({
      sections,
      templates,
      reportDate: '2026-08-27',
      grandTotalText: '1 ч. 0м.',
      shouldFlattenHierarchy: true,
    })

    expect(nestedResult.markdownReportText).toContain('    - Выполнил задачу №2 - Подзадача')
    expect(flatResult.markdownReportText).toContain('- Выполнил задачу №2 - Подзадача')
    expect(flatResult.markdownReportText).not.toContain('    - Выполнил задачу №2')
  })

  it('не пересчитывает «Итого» при исключении задачи из отчёта', () => {
    const buildResult = buildReport({
      sections: [
        buildSection({
          taskRows: [buildTask({ id: 1 }), buildTask({ id: 2, isIncluded: false })],
        }),
      ],
      templates,
      reportDate: '2026-08-27',
      grandTotalText: '54 ч. 48м.',
      shouldFlattenHierarchy: false,
    })

    expect(buildResult.markdownReportText).toContain('Итого: 4 ч. 10м.')
    expect(buildResult.markdownReportText).toContain('№1')
    expect(buildResult.markdownReportText).not.toContain('№2')
  })

  it('пропускает раздел, из которого исключены все задачи', () => {
    const buildResult = buildReport({
      sections: [buildSection({ taskRows: [buildTask({ isIncluded: false })] })],
      templates,
      reportDate: '2026-08-27',
      grandTotalText: '0 ч. 0м.',
      shouldFlattenHierarchy: false,
    })

    expect(buildResult.markdownReportText).not.toContain('Внутренние задачи')
  })

  it('подставляет ID группы и ID задачи в ссылку', () => {
    const buildResult = buildReport({
      sections: [buildSection({ matchedProjectId: 13, taskRows: [buildTask({ id: 4820 })] })],
      templates: {
        ...templates,
        lineTemplate: '- {statusText} №[{id}]({link}) - {title}',
        linkTemplate:
          'https://bitrix.example.com/workgroups/group/{projectId}/tasks/task/view/{id}/',
      },
      reportDate: '2026-08-27',
      grandTotalText: '1 ч. 0м.',
      shouldFlattenHierarchy: false,
    })

    expect(buildResult.markdownReportText).toContain(
      '- Выполнил задачу №[4820](https://bitrix.example.com/workgroups/group/13/tasks/task/view/4820/) - Задача',
    )
  })

  it('предупреждает, что без ID группы ссылка окажется неполной', () => {
    const buildResult = buildReport({
      sections: [buildSection({ matchedProjectId: null })],
      templates: {
        ...templates,
        linkTemplate:
          'https://bitrix.example.com/workgroups/group/{projectId}/tasks/task/view/{id}/',
      },
      reportDate: '2026-08-27',
      grandTotalText: '1 ч. 0м.',
      shouldFlattenHierarchy: false,
    })

    expect(buildResult.issues).toContainEqual(
      expect.objectContaining({
        scope: 'linkTemplate',
        message: expect.stringContaining('ссылки на его задачи будут неполными'),
      }),
    )
  })

  it('предупреждает о разделе без ID проекта', () => {
    const buildResult = buildReport({
      sections: [buildSection({ matchedProjectId: null })],
      templates,
      reportDate: '2026-08-27',
      grandTotalText: '1 ч. 0м.',
      shouldFlattenHierarchy: false,
    })

    expect(buildResult.issues).toContainEqual(
      expect.objectContaining({
        severity: 'warning',
        message: expect.stringContaining('не задан ID проекта'),
      }),
    )
  })

  it('дописывает отсутствующие обязательные переменные в шаблоны', () => {
    const buildResult = buildReport({
      sections: [buildSection()],
      templates: { ...templates, documentTemplate: 'Отчёт за {date}' },
      reportDate: '2026-08-27',
      grandTotalText: '1 ч. 0м.',
      shouldFlattenHierarchy: false,
    })

    expect(buildResult.markdownReportText).toContain('## Внутренние задачи (#1001)')
    expect(buildResult.issues).toContainEqual(
      expect.objectContaining({
        scope: 'documentTemplate',
        message: expect.stringContaining('{sections}'),
      }),
    )
  })
})
