import { describe, expect, it } from 'vitest'
import { bitrixReportFixture } from './fixtures'
import { parseBitrixText } from './parseBitrixText'

describe('parseBitrixText', () => {
  it('разбирает разделы, задачи и итоги из образца выгрузки', () => {
    const parsingResult = parseBitrixText(bitrixReportFixture)

    expect(parsingResult.sections.map((section) => section.rawName)).toEqual([
      'Внутренние задачи',
      'Проект Альфа (поддержка)',
      'Исследования (внутренний)',
    ])
    expect(parsingResult.sections.map((section) => section.sectionTotalText)).toEqual([
      '4 ч. 10м.',
      '5 ч. 10м.',
      '24 ч. 24м.',
    ])
    expect(parsingResult.grandTotalText).toBe('54 ч. 48м.')
    expect(parsingResult.parsingIssues).toHaveLength(0)
  })

  it('вычисляет уровень вложенности по стрелкам и очищает от них название', () => {
    const parsingResult = parseBitrixText(bitrixReportFixture)
    const nestedSection = parsingResult.sections[1]

    expect(nestedSection?.taskRows).toEqual([
      expect.objectContaining({
        id: 2001,
        title: 'Вёрстка функционала Карта (Frontend)',
        nestingLevel: 0,
        durationText: '0 ч. 0м.',
        isIncluded: true,
      }),
      expect.objectContaining({
        id: 2002,
        title: 'Исправление багов после тестирования',
        nestingLevel: 1,
      }),
      expect.objectContaining({
        id: 2003,
        title: 'Исправление мелких багов',
        nestingLevel: 2,
        durationText: '5 ч. 10м.',
      }),
    ])
  })

  it('пропускает служебные строки заголовка таблицы', () => {
    const parsingResult = parseBitrixText(
      ['Проект', 'ID\tЗадача\tВремя', '10\tЗадача\t1 ч. 0м.', 'Итого:\t1 ч. 0м.'].join('\n'),
    )

    expect(parsingResult.sections).toHaveLength(1)
    expect(parsingResult.sections[0]?.taskRows).toHaveLength(1)
    expect(parsingResult.parsingIssues).toHaveLength(0)
  })

  it('сообщает о разделе, закрытом без строки «Итого»', () => {
    const parsingResult = parseBitrixText(
      ['Первый проект', '10\tЗадача\t1 ч. 0м.', 'Второй проект', '11\tДругая\t2 ч. 0м.'].join('\n'),
    )

    expect(parsingResult.sections).toHaveLength(2)
    expect(parsingResult.sections[0]?.sectionTotalText).toBeNull()
    expect(parsingResult.parsingIssues[0]).toMatchObject({
      severity: 'warning',
      message: expect.stringContaining('без строки «Итого»'),
    })
  })

  it('помечает ошибкой строку со временем, которую не удалось разобрать', () => {
    const parsingResult = parseBitrixText(
      ['Проект', 'сломанная строка 5 ч. 30м.', 'Итого:\t5 ч. 30м.'].join('\n'),
    )

    expect(parsingResult.parsingIssues).toEqual([
      expect.objectContaining({ severity: 'error', lineNumber: 2 }),
    ])
    expect(parsingResult.sections[0]?.taskRows).toHaveLength(0)
  })

  it('возвращает пустой результат для пустого ввода', () => {
    expect(parseBitrixText('')).toEqual({
      sections: [],
      grandTotalText: null,
      parsingIssues: [],
    })
  })
})
