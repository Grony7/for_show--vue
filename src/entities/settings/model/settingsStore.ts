import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  defaultReportDocumentTemplate,
  defaultReportLineTemplate,
  defaultReportSectionTemplate,
  defaultTaskLinkTemplate,
  settingsStorageKey,
} from '@/shared/config'
import { createId, loadJsonFromStorage, saveJsonToStorage } from '@/shared/lib'
import type { BitrixProject } from '@/entities/project'
import type { TaskStatusPreset } from '@/entities/task'
import { buildDefaultTaskStatuses, defaultTaskStatusId } from '@/entities/task'
import type { LegacyReportSettings, ReportSettings, TemplatePreset } from './types'

const defaultPresetId = 'default'

function buildDefaultPreset(): TemplatePreset {
  return {
    id: defaultPresetId,
    name: 'Основной',
    lineTemplate: defaultReportLineTemplate,
    sectionTemplate: defaultReportSectionTemplate,
    documentTemplate: defaultReportDocumentTemplate,
    shouldFlattenHierarchy: false,
  }
}

function buildDefaultSettings(): ReportSettings {
  return {
    projects: [],
    linkTemplate: defaultTaskLinkTemplate,
    statuses: buildDefaultTaskStatuses(),
    defaultStatusId: defaultTaskStatusId,
    presets: [buildDefaultPreset()],
    activePresetId: defaultPresetId,
  }
}

function restorePresets(savedSettings: LegacyReportSettings): TemplatePreset[] {
  if (Array.isArray(savedSettings.presets) && savedSettings.presets.length > 0) {
    return savedSettings.presets
  }

  const hasLegacyTemplates =
    typeof savedSettings.documentTemplate === 'string' ||
    typeof savedSettings.sectionTemplate === 'string' ||
    typeof savedSettings.lineTemplate === 'string'

  if (!hasLegacyTemplates) {
    return [buildDefaultPreset()]
  }

  const defaultPreset = buildDefaultPreset()

  return [
    {
      ...defaultPreset,
      lineTemplate: savedSettings.lineTemplate || defaultPreset.lineTemplate,
      sectionTemplate: savedSettings.sectionTemplate || defaultPreset.sectionTemplate,
      documentTemplate: savedSettings.documentTemplate || defaultPreset.documentTemplate,
      shouldFlattenHierarchy: savedSettings.shouldFlattenHierarchy ?? false,
    },
  ]
}

function mergeWithDefaults(savedSettings: LegacyReportSettings | null): ReportSettings {
  const defaultSettings = buildDefaultSettings()

  if (!savedSettings) {
    return defaultSettings
  }

  const presets = restorePresets(savedSettings)
  const statuses =
    Array.isArray(savedSettings.statuses) && savedSettings.statuses.length > 0
      ? savedSettings.statuses
      : defaultSettings.statuses
  const activePresetId = presets.some((preset) => preset.id === savedSettings.activePresetId)
    ? (savedSettings.activePresetId as string)
    : (presets[0]?.id ?? defaultPresetId)
  const defaultStatusId = statuses.some((status) => status.id === savedSettings.defaultStatusId)
    ? (savedSettings.defaultStatusId as string)
    : (statuses[0]?.id ?? defaultTaskStatusId)

  return {
    projects: Array.isArray(savedSettings.projects) ? savedSettings.projects : [],
    linkTemplate: savedSettings.linkTemplate || defaultSettings.linkTemplate,
    statuses,
    defaultStatusId,
    presets,
    activePresetId,
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const initialSettings = mergeWithDefaults(
    loadJsonFromStorage<LegacyReportSettings>(settingsStorageKey),
  )

  const projects = ref<BitrixProject[]>(initialSettings.projects)
  const linkTemplate = ref(initialSettings.linkTemplate)
  const statuses = ref<TaskStatusPreset[]>(initialSettings.statuses)
  const defaultStatusId = ref(initialSettings.defaultStatusId)
  const presets = ref<TemplatePreset[]>(initialSettings.presets)
  const activePresetId = ref(initialSettings.activePresetId)

  const activePreset = computed<TemplatePreset>(() => {
    const foundPreset = presets.value.find((preset) => preset.id === activePresetId.value)

    return foundPreset ?? presets.value[0] ?? buildDefaultPreset()
  })

  function updateActivePreset(patch: Partial<Omit<TemplatePreset, 'id'>>): void {
    presets.value = presets.value.map((preset) =>
      preset.id === activePreset.value.id ? { ...preset, ...patch } : preset,
    )
  }

  const lineTemplate = computed({
    get: () => activePreset.value.lineTemplate,
    set: (value: string) => updateActivePreset({ lineTemplate: value }),
  })

  const sectionTemplate = computed({
    get: () => activePreset.value.sectionTemplate,
    set: (value: string) => updateActivePreset({ sectionTemplate: value }),
  })

  const documentTemplate = computed({
    get: () => activePreset.value.documentTemplate,
    set: (value: string) => updateActivePreset({ documentTemplate: value }),
  })

  const shouldFlattenHierarchy = computed({
    get: () => activePreset.value.shouldFlattenHierarchy,
    set: (value: boolean) => updateActivePreset({ shouldFlattenHierarchy: value }),
  })

  const templates = computed(() => ({
    lineTemplate: activePreset.value.lineTemplate,
    sectionTemplate: activePreset.value.sectionTemplate,
    documentTemplate: activePreset.value.documentTemplate,
    linkTemplate: linkTemplate.value,
  }))

  const isUsingDefaultLinkTemplate = computed(
    () => linkTemplate.value.trim() === defaultTaskLinkTemplate,
  )

  const canRemovePreset = computed(() => presets.value.length > 1)
  const canRemoveStatus = computed(() => statuses.value.length > 1)

  function addProject(project: BitrixProject): void {
    projects.value = [...projects.value, project]
  }

  function updateProject(projectIndex: number, project: BitrixProject): void {
    projects.value = projects.value.map((existingProject, index) =>
      index === projectIndex ? project : existingProject,
    )
  }

  function removeProject(projectIndex: number): void {
    projects.value = projects.value.filter((_project, index) => index !== projectIndex)
  }

  function addPreset(name: string): string {
    const newPreset: TemplatePreset = { ...buildDefaultPreset(), id: createId(), name }

    presets.value = [...presets.value, newPreset]
    activePresetId.value = newPreset.id

    return newPreset.id
  }

  function duplicateActivePreset(): string {
    const newPreset: TemplatePreset = {
      ...activePreset.value,
      id: createId(),
      name: `${activePreset.value.name} — копия`,
    }

    presets.value = [...presets.value, newPreset]
    activePresetId.value = newPreset.id

    return newPreset.id
  }

  function renamePreset(presetId: string, name: string): void {
    presets.value = presets.value.map((preset) =>
      preset.id === presetId ? { ...preset, name } : preset,
    )
  }

  function removePreset(presetId: string): void {
    if (!canRemovePreset.value) {
      return
    }

    presets.value = presets.value.filter((preset) => preset.id !== presetId)

    if (activePresetId.value === presetId) {
      activePresetId.value = presets.value[0]?.id ?? defaultPresetId
    }
  }

  function setActivePreset(presetId: string): void {
    activePresetId.value = presetId
  }

  function resetActivePresetTemplates(): void {
    const defaultPreset = buildDefaultPreset()

    updateActivePreset({
      lineTemplate: defaultPreset.lineTemplate,
      sectionTemplate: defaultPreset.sectionTemplate,
      documentTemplate: defaultPreset.documentTemplate,
    })
    linkTemplate.value = defaultTaskLinkTemplate
  }

  function addStatus(status: Omit<TaskStatusPreset, 'id'>): string {
    const newStatus: TaskStatusPreset = { ...status, id: createId() }

    statuses.value = [...statuses.value, newStatus]

    return newStatus.id
  }

  function updateStatus(statusId: string, patch: Partial<Omit<TaskStatusPreset, 'id'>>): void {
    statuses.value = statuses.value.map((status) =>
      status.id === statusId ? { ...status, ...patch } : status,
    )
  }

  function removeStatus(statusId: string): void {
    if (!canRemoveStatus.value) {
      return
    }

    statuses.value = statuses.value.filter((status) => status.id !== statusId)

    if (defaultStatusId.value === statusId) {
      defaultStatusId.value = statuses.value[0]?.id ?? defaultTaskStatusId
    }
  }

  function setDefaultStatus(statusId: string): void {
    defaultStatusId.value = statusId
  }

  watch(
    [projects, linkTemplate, statuses, defaultStatusId, presets, activePresetId],
    () => {
      saveJsonToStorage<ReportSettings>(settingsStorageKey, {
        projects: projects.value,
        linkTemplate: linkTemplate.value,
        statuses: statuses.value,
        defaultStatusId: defaultStatusId.value,
        presets: presets.value,
        activePresetId: activePresetId.value,
      })
    },
    { deep: true },
  )

  return {
    projects,
    linkTemplate,
    statuses,
    defaultStatusId,
    presets,
    activePresetId,
    activePreset,
    lineTemplate,
    sectionTemplate,
    documentTemplate,
    shouldFlattenHierarchy,
    templates,
    isUsingDefaultLinkTemplate,
    canRemovePreset,
    canRemoveStatus,
    addProject,
    updateProject,
    removeProject,
    addPreset,
    duplicateActivePreset,
    renamePreset,
    removePreset,
    setActivePreset,
    resetActivePresetTemplates,
    addStatus,
    updateStatus,
    removeStatus,
    setDefaultStatus,
  }
})
