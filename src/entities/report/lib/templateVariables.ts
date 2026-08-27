export const lineTemplateVariableNames = [
  'id',
  'title',
  'duration',
  'statusText',
  'projectId',
  'link',
] as const

export const sectionTemplateVariableNames = [
  'projectName',
  'projectId',
  'list',
  'sectionTotal',
] as const

export const documentTemplateVariableNames = ['date', 'sections', 'grandTotal'] as const

export type LineTemplateVariableName = (typeof lineTemplateVariableNames)[number]
export type SectionTemplateVariableName = (typeof sectionTemplateVariableNames)[number]
export type DocumentTemplateVariableName = (typeof documentTemplateVariableNames)[number]

export type LineTemplateVariables = Record<LineTemplateVariableName, string>
export type SectionTemplateVariables = Record<SectionTemplateVariableName, string>
export type DocumentTemplateVariables = Record<DocumentTemplateVariableName, string>

function toTokens(variableNames: readonly string[]): readonly string[] {
  return variableNames.map((variableName) => `{${variableName}}`)
}

export const lineTemplateVariableTokens = toTokens(lineTemplateVariableNames)
export const sectionTemplateVariableTokens = toTokens(sectionTemplateVariableNames)
export const documentTemplateVariableTokens = toTokens(documentTemplateVariableNames)

export const templateVariableHintByToken: Record<string, string> = {
  '{id}': 'ID задачи из выгрузки Bitrix.',
  '{title}': 'Название задачи без стрелок вложенности.',
  '{duration}': 'Время по задаче из Bitrix.',
  '{statusText}': 'Текст статуса, например «Выполнил задачу».',
  '{link}': 'Ссылка на задачу, собранная по шаблону ссылки.',
  '{projectName}': 'Название проекта из реестра либо заголовок раздела из выгрузки.',
  '{projectId}': 'ID проекта Bitrix из реестра проектов.',
  '{list}': 'Список строк задач раздела.',
  '{sectionTotal}': 'Строка «Итого» раздела — берётся из Bitrix без пересчёта.',
  '{date}': 'Дата отчёта.',
  '{sections}': 'Все разделы отчёта, собранные по шаблону раздела.',
  '{grandTotal}': 'Итоговое время из блока «Итоговый результат» — без пересчёта.',
}
