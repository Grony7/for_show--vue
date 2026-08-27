import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSettingsStore } from './settingsStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('наборы шаблонов', () => {
  it('начинает с одного набора по умолчанию', () => {
    const settingsStore = useSettingsStore()

    expect(settingsStore.presets).toHaveLength(1)
    expect(settingsStore.activePreset.name).toBe('Основной')
  })

  it('добавляет набор и сразу делает его активным', () => {
    const settingsStore = useSettingsStore()
    const presetId = settingsStore.addPreset('Mattermost')

    expect(settingsStore.presets).toHaveLength(2)
    expect(settingsStore.activePresetId).toBe(presetId)
    expect(settingsStore.activePreset.name).toBe('Mattermost')
  })

  it('хранит шаблоны раздельно по наборам', () => {
    const settingsStore = useSettingsStore()
    settingsStore.lineTemplate = 'шаблон для Bitrix'

    const mattermostId = settingsStore.addPreset('Mattermost')
    settingsStore.lineTemplate = 'шаблон для Mattermost'

    settingsStore.setActivePreset('default')
    expect(settingsStore.lineTemplate).toBe('шаблон для Bitrix')

    settingsStore.setActivePreset(mattermostId)
    expect(settingsStore.lineTemplate).toBe('шаблон для Mattermost')
  })

  it('дублирует активный набор вместе с содержимым', () => {
    const settingsStore = useSettingsStore()
    settingsStore.documentTemplate = 'исходный документ'

    settingsStore.duplicateActivePreset()

    expect(settingsStore.presets).toHaveLength(2)
    expect(settingsStore.activePreset.name).toBe('Основной — копия')
    expect(settingsStore.documentTemplate).toBe('исходный документ')
  })

  it('переключает активный набор при удалении текущего', () => {
    const settingsStore = useSettingsStore()
    const mattermostId = settingsStore.addPreset('Mattermost')

    settingsStore.removePreset(mattermostId)

    expect(settingsStore.presets).toHaveLength(1)
    expect(settingsStore.activePresetId).toBe('default')
  })

  it('не даёт удалить последний набор', () => {
    const settingsStore = useSettingsStore()

    settingsStore.removePreset('default')

    expect(settingsStore.canRemovePreset).toBe(false)
    expect(settingsStore.presets).toHaveLength(1)
  })
})

describe('статусы задач', () => {
  it('добавляет и меняет статус', () => {
    const settingsStore = useSettingsStore()
    const statusId = settingsStore.addStatus({ shortLabel: 'Проверил', label: 'Проверил задачу' })

    expect(settingsStore.statuses).toHaveLength(5)

    settingsStore.updateStatus(statusId, { label: 'Проверил задачу коллеги' })

    expect(settingsStore.statuses.at(-1)?.label).toBe('Проверил задачу коллеги')
  })

  it('переносит статус по умолчанию при удалении текущего', () => {
    const settingsStore = useSettingsStore()

    expect(settingsStore.defaultStatusId).toBe('done')

    settingsStore.removeStatus('done')

    expect(settingsStore.statuses.some((status) => status.id === 'done')).toBe(false)
    expect(settingsStore.defaultStatusId).toBe('started')
  })

  it('не даёт удалить последний статус', () => {
    const settingsStore = useSettingsStore()
    const remainingId = settingsStore.statuses[0]?.id ?? ''

    settingsStore.statuses
      .filter((status) => status.id !== remainingId)
      .forEach((status) => settingsStore.removeStatus(status.id))

    expect(settingsStore.statuses).toHaveLength(1)

    settingsStore.removeStatus(remainingId)

    expect(settingsStore.statuses).toHaveLength(1)
    expect(settingsStore.canRemoveStatus).toBe(false)
  })
})
