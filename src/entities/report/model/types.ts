import type { TaskRow } from '@/entities/task'

export interface ParseIssue {
  severity: 'warning' | 'error'
  lineNumber: number
  sourceLineText: string
  message: string
}

export interface RawSection {
  rawName: string
  taskRows: TaskRow[]
  sectionTotalText: string | null
}

export interface BitrixParsingResult {
  sections: RawSection[]
  grandTotalText: string | null
  parsingIssues: ParseIssue[]
}

export interface ReportSection extends RawSection {
  matchedProjectId: number | null
  displayName: string
}
