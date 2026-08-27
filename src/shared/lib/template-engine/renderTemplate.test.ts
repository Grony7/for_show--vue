import { describe, expect, it } from 'vitest'
import { ensureRequiredPlaceholder, renderTemplate } from './renderTemplate'

const allowedVariableNames = ['id', 'title'] as const

describe('renderTemplate', () => {
  it('подставляет известные переменные', () => {
    const renderResult = renderTemplate(
      '№{id} — {title}',
      { id: '42', title: 'Задача' },
      allowedVariableNames,
      'lineTemplate',
    )

    expect(renderResult.renderedText).toBe('№42 — Задача')
    expect(renderResult.issues).toHaveLength(0)
  })

  it('удаляет неизвестную переменную и предупреждает о ней один раз', () => {
    const renderResult = renderTemplate(
      '{id} {unknown} {unknown}',
      { id: '42' },
      allowedVariableNames,
      'lineTemplate',
    )

    expect(renderResult.renderedText).toBe('42  ')
    expect(renderResult.issues).toEqual([
      {
        severity: 'warning',
        scope: 'lineTemplate',
        message: 'Неизвестная переменная "{unknown}" в шаблоне.',
      },
    ])
  })
})

describe('ensureRequiredPlaceholder', () => {
  it('не меняет шаблон, если переменная уже есть', () => {
    const result = ensureRequiredPlaceholder('До {list} после', '{list}', 'sectionTemplate')

    expect(result.renderedText).toBe('До {list} после')
    expect(result.issues).toHaveLength(0)
  })

  it('дописывает переменную в конец и предупреждает', () => {
    const result = ensureRequiredPlaceholder('Только текст', '{list}', 'sectionTemplate')

    expect(result.renderedText).toBe('Только текст\n\n{list}')
    expect(result.issues[0]).toMatchObject({ severity: 'warning', scope: 'sectionTemplate' })
  })
})
