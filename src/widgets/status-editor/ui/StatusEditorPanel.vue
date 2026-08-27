<script setup lang="ts">
import { BasePanel } from '@/shared/ui'
import { StatusEditor } from '@/features/manage-statuses'
</script>

<template>
  <BasePanel
    title="Статусы задач"
    subtitle="Короткое название — надпись на кнопке, полный текст подставляется в {statusText}."
  >
    <StatusEditor />
  </BasePanel>
</template>
