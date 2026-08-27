import type { BitrixProject } from '@/entities/project'
import { normalizeProjectName } from '@/entities/project'
import type { RawSection, ReportSection } from '../model/types'

export function matchSectionsToProjects(
  rawSections: RawSection[],
  projects: BitrixProject[],
): ReportSection[] {
  const projectByNormalizedName = new Map<string, BitrixProject>()

  projects.forEach((project) => {
    projectByNormalizedName.set(normalizeProjectName(project.name), project)
  })

  return rawSections.map((rawSection) => {
    const matchedProject = projectByNormalizedName.get(normalizeProjectName(rawSection.rawName))

    return {
      ...rawSection,
      matchedProjectId: matchedProject?.id ?? null,
      displayName: matchedProject?.name ?? rawSection.rawName,
    }
  })
}
