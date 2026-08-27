<script setup lang="ts">
import type { TaskStatus } from '@/entities/task'
import {
  taskStatusLabelByValue,
  taskStatusShortLabelByValue,
  taskStatusValues,
} from '@/entities/task'

defineProps<{
  modelValue: TaskStatus
}>()

const emit = defineEmits<{
  'update:modelValue': [status: TaskStatus]
}>()

function selectStatus(status: TaskStatus): void {
  emit('update:modelValue', status)
}
</script>

<template>
  <div class="status" role="group" aria-label="Статус задачи">
    <button
      v-for="taskStatus in taskStatusValues"
      :key="taskStatus"
      type="button"
      class="status__button"
      :class="{ 'status__button--active': modelValue === taskStatus }"
      :title="taskStatusLabelByValue[taskStatus]"
      @click="selectStatus(taskStatus)"
    >
      {{ taskStatusShortLabelByValue[taskStatus] }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.status {
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: $radius-control;
  overflow: hidden;

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
