export const templateScopeValues = [
  'lineTemplate',
  'sectionTemplate',
  'documentTemplate',
  'linkTemplate',
] as const

export type TemplateScope = (typeof templateScopeValues)[number]

export const templateScopeLabelByValue: Record<TemplateScope, string> = {
  lineTemplate: 'Шаблон строки',
  sectionTemplate: 'Шаблон раздела',
  documentTemplate: 'Шаблон документа',
  linkTemplate: 'Шаблон ссылки',
}

export interface TemplateIssue {
  severity: 'warning' | 'error'
  scope: TemplateScope
  message: string
}

export interface RenderTemplateResult {
  renderedText: string
  issues: TemplateIssue[]
}
