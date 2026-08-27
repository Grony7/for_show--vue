import { describe, expect, it } from 'vitest'
import type { RawSection } from '../model/types'
import { matchSectionsToProjects } from './matchSectionsToProjects'

function buildSection(rawName: string): RawSection {
  return { rawName, taskRows: [], sectionTotalText: '1 ч. 0м.' }
}

describe('matchSectionsToProjects', () => {
  it('находит проект по названию раздела', () => {
    const reportSections = matchSectionsToProjects(
      [buildSection('Внутренние задачи')],
      [{ id: 1001, name: 'Внутренние задачи' }],
    )

    expect(reportSections[0]).toMatchObject({
      matchedProjectId: 1001,
      displayName: 'Внутренние задачи',
    })
  })

  it('игнорирует регистр и лишние пробелы при сопоставлении', () => {
    const reportSections = matchSectionsToProjects(
      [buildSection('  исследования   (ВНУТРЕННИЙ)  ')],
      [{ id: 3001, name: 'Исследования (внутренний)' }],
    )

    expect(reportSections[0]).toMatchObject({
      matchedProjectId: 3001,
      displayName: 'Исследования (внутренний)',
    })
  })

  it('оставляет исходное название, если проект не найден', () => {
    const reportSections = matchSectionsToProjects([buildSection('Новый проект')], [])

    expect(reportSections[0]).toMatchObject({
      matchedProjectId: null,
      displayName: 'Новый проект',
    })
  })
})
