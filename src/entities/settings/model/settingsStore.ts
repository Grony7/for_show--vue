import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  defaultReportDocumentTemplate,
  defaultReportLineTemplate,
  defaultReportSectionTemplate,
  defaultTaskLinkTemplate,
  settingsStorageKey,
} from '@/shared/config'
import { loadJsonFromStorage, saveJsonToStorage } from '@/shared/lib'
import type { BitrixProject } from '@/entities/project'
import type { ReportSettings } from './types'

function buildDefaultSettings(): ReportSettings {
  return {
    projects: [],
    lineTemplate: defaultReportLineTemplate,
    sectionTemplate: defaultReportSectionTemplate,
    documentTemplate: defaultReportDocumentTemplate,
    linkTemplate: defaultTaskLinkTemplate,
    shouldFlattenHierarchy: false,
  }
}

function mergeWithDefaults(savedSettings: ReportSettings | null): ReportSettings {
  const defaultSettings = buildDefaultSettings()

  if (!savedSettings) {
    return defaultSettings
  }

  return {
    projects: Array.isArray(savedSettings.projects) ? savedSettings.projects : [],
    lineTemplate: savedSettings.lineTemplate || defaultSettings.lineTemplate,
    sectionTemplate: savedSettings.sectionTemplate || defaultSettings.sectionTemplate,
    documentTemplate: savedSettings.documentTemplate || defaultSettings.documentTemplate,
    linkTemplate: savedSettings.linkTemplate || defaultSettings.linkTemplate,
    shouldFlattenHierarchy: savedSettings.shouldFlattenHierarchy ?? false,
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const initialSettings = mergeWithDefaults(loadJsonFromStorage<ReportSettings>(settingsStorageKey))

  const projects = ref<BitrixProject[]>(initialSettings.projects)
  const lineTemplate = ref(initialSettings.lineTemplate)
  const sectionTemplate = ref(initialSettings.sectionTemplate)
  const documentTemplate = ref(initialSettings.documentTemplate)
  const linkTemplate = ref(initialSettings.linkTemplate)
  const shouldFlattenHierarchy = ref(initialSettings.shouldFlattenHierarchy)

  const templates = computed(() => ({
    lineTemplate: lineTemplate.value,
    sectionTemplate: sectionTemplate.value,
    documentTemplate: documentTemplate.value,
    linkTemplate: linkTemplate.value,
  }))

  const isUsingDefaultLinkTemplate = computed(
    () => linkTemplate.value.trim() === defaultTaskLinkTemplate,
  )

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

  function resetTemplates(): void {
    const defaultSettings = buildDefaultSettings()

    lineTemplate.value = defaultSettings.lineTemplate
    sectionTemplate.value = defaultSettings.sectionTemplate
    documentTemplate.value = defaultSettings.documentTemplate
    linkTemplate.value = defaultSettings.linkTemplate
  }

  watch(
    [
      projects,
      lineTemplate,
      sectionTemplate,
      documentTemplate,
      linkTemplate,
      shouldFlattenHierarchy,
    ],
    () => {
      saveJsonToStorage<ReportSettings>(settingsStorageKey, {
        projects: projects.value,
        lineTemplate: lineTemplate.value,
        sectionTemplate: sectionTemplate.value,
        documentTemplate: documentTemplate.value,
        linkTemplate: linkTemplate.value,
        shouldFlattenHierarchy: shouldFlattenHierarchy.value,
      })
    },
    { deep: true },
  )

  return {
    projects,
    lineTemplate,
    sectionTemplate,
    documentTemplate,
    linkTemplate,
    shouldFlattenHierarchy,
    templates,
    isUsingDefaultLinkTemplate,
    addProject,
    updateProject,
    removeProject,
    resetTemplates,
  }
})
