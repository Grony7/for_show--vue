<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@/shared/ui'
import { useSettingsStore } from '@/entities/settings'

const props = defineProps<{
  sectionName: string
}>()

const settingsStore = useSettingsStore()
const projectIdText = ref('')
const errorMessage = ref<string | null>(null)

function submitProject(): void {
  const projectId = Number(projectIdText.value.trim())

  if (!Number.isInteger(projectId) || projectId <= 0) {
    errorMessage.value = 'ID проекта должен быть положительным числом.'
    return
  }

  settingsStore.addProject({ id: projectId, name: props.sectionName })
  projectIdText.value = ''
  errorMessage.value = null
}
</script>

<template>
  <form class="quick-add" @submit.prevent="submitProject">
    <span class="quick-add__hint">Раздел не найден в реестре. Впишите ID проекта Bitrix:</span>

    <div class="quick-add__controls">
      <input
        v-model="projectIdText"
        class="quick-add__input"
        type="text"
        inputmode="numeric"
        placeholder="Например, 13"
        :aria-label="`ID проекта для раздела ${sectionName}`"
      />
      <BaseButton type="submit" variant="primary" size="small">Привязать</BaseButton>
    </div>

    <p v-if="errorMessage" class="quick-add__error">{{ errorMessage }}</p>
  </form>
</template>

<style scoped lang="scss">
.quick-add {
  @include stack;

  padding: 12px;
  background: var(--warning-surface);
  border: 1px solid var(--warning-border);
  border-radius: $radius-control;

  &__hint {
    font-size: 0.82rem;
    color: var(--warning);
  }

  &__controls {
    @include row;
  }

  &__input {
    @include control($radius-small);

    font-size: 0.85rem;
    background: var(--surface);
    padding: 6px 10px;
    width: 160px;
  }

  &__error {
    @include caption;

    color: var(--danger);
  }
}
</style>
