<script setup lang="ts">
import { BasePanel } from '@/shared/ui'
import { ProjectRegistryEditor } from '@/features/manage-projects'
</script>

<template>
  <BasePanel
    title="Реестр проектов Bitrix"
    subtitle="Название должно совпадать с заголовком раздела в выгрузке — регистр и лишние пробелы не важны."
  >
    <ProjectRegistryEditor />
  </BasePanel>
</template>
