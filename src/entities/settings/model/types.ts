import type { BitrixProject } from '@/entities/project'

export interface ReportSettings {
  projects: BitrixProject[]
  lineTemplate: string
  sectionTemplate: string
  documentTemplate: string
  linkTemplate: string
  shouldFlattenHierarchy: boolean
}
