import type { BitrixProject } from '@/entities/project'
import type { TaskStatusPreset } from '@/entities/task'

export interface TemplatePreset {
  id: string
  name: string
  lineTemplate: string
  sectionTemplate: string
  documentTemplate: string
  shouldFlattenHierarchy: boolean
}

export interface ReportSettings {
  projects: BitrixProject[]
  linkTemplate: string
  statuses: TaskStatusPreset[]
  defaultStatusId: string
  presets: TemplatePreset[]
  activePresetId: string
}

export interface LegacyReportSettings extends Partial<ReportSettings> {
  lineTemplate?: string
  sectionTemplate?: string
  documentTemplate?: string
  shouldFlattenHierarchy?: boolean
}
