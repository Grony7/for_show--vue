<script setup lang="ts">
import { ref } from 'vue'
import { copyTextToClipboard } from '@/shared/lib'
import { BaseButton } from '@/shared/ui'

const props = defineProps<{
  reportText: string
}>()

const statusMessage = ref<string | null>(null)

const messageByResult = {
  success: 'Отчёт скопирован в буфер обмена.',
  unsupported: 'Буфер обмена недоступен в этом браузере.',
  failed: 'Не удалось скопировать отчёт.',
} as const

async function copyReport(): Promise<void> {
  if (props.reportText.trim().length === 0) {
    statusMessage.value = 'Нет данных для копирования.'
    return
  }

  statusMessage.value = messageByResult[await copyTextToClipboard(props.reportText)]
}
</script>

<template>
  <div class="copy">
    <BaseButton variant="primary" @click="copyReport">Копировать отчёт</BaseButton>
    <span v-if="statusMessage" class="copy__status" role="status">{{ statusMessage }}</span>
  </div>
</template>

<style scoped lang="scss">
.copy {
  @include row(12px);

  &__status {
    font-size: 0.82rem;
    color: var(--text-muted);
  }
}
</style>
