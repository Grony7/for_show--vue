<script setup lang="ts">
import { useSettingsStore } from '@/entities/settings'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [statusId: string]
}>()

const settingsStore = useSettingsStore()

function selectStatus(statusId: string): void {
  emit('update:modelValue', statusId)
}
</script>

<template>
  <div class="status" role="group" aria-label="Статус задачи">
    <button
      v-for="status in settingsStore.statuses"
      :key="status.id"
      type="button"
      class="status__button"
      :class="{ 'status__button--active': modelValue === status.id }"
      :title="status.label"
      @click="selectStatus(status.id)"
    >
      {{ status.shortLabel }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.status {
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: $radius-control;
  overflow: hidden;

  @include below($breakpoint-mobile) {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }

  &__button {
    border: none;
    background: transparent;
    color: var(--text-muted);
    font: inherit;
    font-size: 0.78rem;
    padding: 4px 9px;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;

    @include below($breakpoint-mobile) {
      flex: 1 1 auto;
      padding: 8px 10px;
    }

    & + & {
      border-left: 1px solid var(--border);
    }

    &:hover {
      background: var(--surface-raised);
      color: var(--text-strong);
    }

    &--active {
      background: var(--accent);
      color: var(--accent-contrast);

      &:hover {
        background: var(--accent-hover);
        color: var(--accent-contrast);
      }
    }
  }
}
</style>
