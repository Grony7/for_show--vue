const durationSource = String.raw`\d+\s*ч\.\s*\d+\s*м\.`

const arrowSource = String.raw`(?:→|->)`

export const durationSomewherePattern = new RegExp(durationSource, 'u')

export const sectionTotalPattern = new RegExp(
  String.raw`^Итого\s*:?\s*(?<duration>${durationSource})\s*$`,
  'iu',
)

export const grandTotalMarkerPattern = /^Итоговый\s+результат\s*:?\s*$/iu

export const grandTotalValuePattern = new RegExp(
  String.raw`^Время\s*:?\s*(?<duration>${durationSource})\s*$`,
  'iu',
)

export const taskLinePattern = new RegExp(
  String.raw`^(?<id>\d+)\s+(?<arrows>(?:${arrowSource}\s*)*)(?<title>.+?)\s+(?<hours>\d+)\s*ч\.\s*(?<minutes>\d+)\s*м\.\s*$`,
  'u',
)

export const arrowGlobalPattern = new RegExp(arrowSource, 'gu')

export const columnSeparatorPattern = /\t|\s{2,}/
