<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton } from '@/shared/ui'
import type { ReportSection } from '@/entities/report'
import { useReportStore } from '@/entities/report'
import { useSettingsStore } from '@/entities/settings'
import { TaskStatusControl } from '@/features/edit-task'
import { QuickAddProject } from '@/features/manage-projects'

const props = defineProps<{
  section: ReportSection
  sectionIndex: number
}>()

const reportStore = useReportStore()
const settingsStore = useSettingsStore()

const includedTaskCount = computed(
  () => props.section.taskRows.filter((taskRow) => taskRow.isIncluded).length,
)

const areAllTasksIncluded = computed(
  () =>
    includedTaskCount.value === props.section.taskRows.length && props.section.taskRows.length > 0,
)

function buildTitleIndentStyle(nestingLevel: number): Record<string, string> {
  const indentLevel = settingsStore.shouldFlattenHierarchy ? 0 : nestingLevel

  return { paddingLeft: `${indentLevel * 18}px` }
}

function toggleAllTasks(): void {
  reportStore.setSectionTasksIncluded(props.sectionIndex, !areAllTasksIncluded.value)
}

function updateTaskIncluded(taskId: number, event: Event): void {
  reportStore.setTaskIncluded(
    props.sectionIndex,
    taskId,
    (event.target as HTMLInputElement).checked,
  )
}

function updateTaskStatus(taskId: number, statusId: string): void {
  reportStore.setTaskStatus(props.sectionIndex, taskId, statusId)
}
</script>

<template>
  <article class="section">
    <header class="section__header">
      <div class="section__identity">
        <h3 class="section__name">{{ section.displayName }}</h3>
        <span v-if="section.matchedProjectId !== null" class="section__badge">
          ID проекта: {{ section.matchedProjectId }}
        </span>
        <span v-else class="section__badge section__badge--missing">ID проекта не задан</span>
      </div>

      <BaseButton size="small" variant="ghost" @click="toggleAllTasks">
        {{ areAllTasksIncluded ? 'Снять все' : 'Выбрать все' }}
      </BaseButton>
    </header>

    <QuickAddProject v-if="section.matchedProjectId === null" :section-name="section.rawName" />

    <div class="section__table-wrapper">
      <table class="section__table">
        <thead>
          <tr>
            <th class="section__cell--narrow">Вкл.</th>
            <th>Статус</th>
            <th class="section__cell--narrow">ID</th>
            <th>Задача</th>
            <th class="section__cell--time">Время</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="taskRow in section.taskRows"
            :key="taskRow.id"
            :class="{ 'section__row--excluded': !taskRow.isIncluded }"
          >
            <td class="section__cell--narrow">
              <input
                type="checkbox"
                :checked="taskRow.isIncluded"
                :aria-label="`Включить задачу ${taskRow.id} в отчёт`"
                @change="updateTaskIncluded(taskRow.id, $event)"
              />
            </td>
            <td>
              <TaskStatusControl
                :model-value="taskRow.statusId"
                @update:model-value="updateTaskStatus(taskRow.id, $event)"
              />
            </td>
            <td class="section__cell--id">{{ taskRow.id }}</td>
            <td>
              <span :style="buildTitleIndentStyle(taskRow.nestingLevel)" class="section__title">
                <span
                  v-if="taskRow.nestingLevel > 0 && !settingsStore.shouldFlattenHierarchy"
                  class="section__arrow"
                  aria-hidden="true"
                  >→</span
                >
                {{ taskRow.title }}
              </span>
            </td>
            <td class="section__cell--time">{{ taskRow.durationText }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="section__footer">
      <span>
        Итого из Bitrix:
        <strong>{{ section.sectionTotalText ?? 'не найдено' }}</strong>
      </span>
      <span class="section__counter">
        В отчёт попадёт задач: {{ includedTaskCount }} из {{ section.taskRows.length }}
      </span>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.section {
  @include stack(12px);

  padding: 16px;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 10px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__identity {
    @include row(10px);
  }

  &__name {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 600;
    color: var(--text-strong);
  }

  &__badge {
    @include mono;

    font-size: 0.75rem;
    color: var(--accent);
    background: var(--accent-surface);
    border-radius: $radius-pill;
    padding: 2px 10px;

    &--missing {
      color: var(--warning);
      background: var(--warning-surface);
    }
  }

  &__table-wrapper {
    overflow-x: auto;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;

    th {
      text-align: left;
      font-weight: 500;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
      padding: 6px 10px;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border-subtle);
      vertical-align: middle;
      color: var(--text);
    }
  }

  &__row--excluded {
    opacity: 0.45;
  }

  &__cell {
    &--narrow {
      width: 1%;
      white-space: nowrap;
    }

    &--id {
      @include mono;

      color: var(--text-muted);
    }

    &--time {
      @include mono;

      white-space: nowrap;
      color: var(--text-muted);
    }
  }

  &__title {
    display: inline-block;
  }

  &__arrow {
    color: var(--text-muted);
    margin-right: 4px;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 0.82rem;
    color: var(--text-muted);
    padding-top: 4px;

    strong {
      @include mono;

      color: var(--text-strong);
    }
  }

  &__counter {
    color: var(--text-muted);
  }
}
</style>
