export type { BitrixParsingResult, ParseIssue, RawSection, ReportSection } from './model/types'
export { useReportStore } from './model/reportStore'
export { buildReport, buildTaskLink } from './lib/buildReport'
export type { BuildReportInput, BuildReportResult, ReportTemplates } from './lib/buildReport'
export { matchSectionsToProjects } from './lib/matchSectionsToProjects'
export { parseBitrixText } from './lib/parseBitrixText'
export {
  documentTemplateVariableTokens,
  lineTemplateVariableTokens,
  sectionTemplateVariableTokens,
  templateVariableHintByToken,
} from './lib/templateVariables'
