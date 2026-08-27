import type { RenderTemplateResult, TemplateIssue, TemplateScope } from './types'

const placeholderPattern = /\{([^{}]+)\}/g

function buildUnknownVariableIssue(variableName: string, scope: TemplateScope): TemplateIssue {
  return {
    severity: 'warning',
    scope,
    message: `Неизвестная переменная "{${variableName}}" в шаблоне.`,
  }
}

export function renderTemplate(
  templateText: string,
  variables: Record<string, string>,
  allowedVariableNames: readonly string[],
  scope: TemplateScope,
): RenderTemplateResult {
  const issues: TemplateIssue[] = []
  const unknownVariableNames = new Set<string>()
  const allowedVariableNameSet = new Set(allowedVariableNames)

  const renderedText = templateText.replaceAll(
    placeholderPattern,
    (_match, rawVariableName: string) => {
      const variableName = rawVariableName.trim()

      if (!allowedVariableNameSet.has(variableName)) {
        unknownVariableNames.add(variableName)
        return ''
      }

      return variables[variableName] ?? ''
    },
  )

  unknownVariableNames.forEach((unknownVariableName) => {
    issues.push(buildUnknownVariableIssue(unknownVariableName, scope))
  })

  return { renderedText, issues }
}

export function ensureRequiredPlaceholder(
  templateText: string,
  requiredPlaceholder: string,
  scope: TemplateScope,
): RenderTemplateResult {
  if (templateText.includes(requiredPlaceholder)) {
    return { renderedText: templateText, issues: [] }
  }

  return {
    renderedText: `${templateText}\n\n${requiredPlaceholder}`,
    issues: [
      {
        severity: 'warning',
        scope,
        message: `В шаблоне отсутствует переменная "${requiredPlaceholder}". Она автоматически добавлена в конец.`,
      },
    ],
  }
}

export function deduplicateTemplateIssues(templateIssues: TemplateIssue[]): TemplateIssue[] {
  const issueKeySet = new Set<string>()
  const deduplicatedIssues: TemplateIssue[] = []

  templateIssues.forEach((templateIssue) => {
    const issueKey = `${templateIssue.scope}:${templateIssue.severity}:${templateIssue.message}`

    if (issueKeySet.has(issueKey)) {
      return
    }

    issueKeySet.add(issueKey)
    deduplicatedIssues.push(templateIssue)
  })

  return deduplicatedIssues
}
