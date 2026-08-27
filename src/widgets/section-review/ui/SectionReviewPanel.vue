<script setup lang="ts">
import { BaseButton, BasePanel } from '@/shared/ui'
import { taskStatusShortLabelByValue, taskStatusValues } from '@/entities/task'
import { useReportStore } from '@/entities/report'
import SectionCard from './SectionCard.vue'

const reportStore = useReportStore()
</script>

<template>
  <BasePanel
    title="Разделы и задачи"
    subtitle="Строки «Итого» берутся из Bitrix как есть и не пересчитываются при исключении задач."
  >
    <template #actions>
      <BaseButton
        v-for="taskStatus in taskStatusValues"
        :key="taskStatus"
        size="small"
        @click="reportStore.applyStatusToAllTasks(taskStatus)"
      >
        Всем: {{ taskStatusShortLabelByValue[taskStatus] }}
      </BaseButton>
    </template>

    <p v-if="reportStore.reportSections.length === 0" class="review__empty">
      Пока нет разобранных разделов. Вставьте отчёт из Bitrix и нажмите «Разобрать отчёт».
    </p>

    <div v-else class="review__sections">
      <SectionCard
        v-for="(reportSection, sectionIndex) in reportStore.reportSections"
        :key="`${reportSection.rawName}-${sectionIndex}`"
        :section="reportSection"
        :section-index="sectionIndex"
      />

      <p class="review__grand-total">
        Итоговый результат из Bitrix:
        <strong>{{ reportStore.grandTotalText ?? 'не найдено' }}</strong>
      </p>
    </div>
  </BasePanel>
</template>

<style scoped lang="scss">
.review {
  &__empty {
    margin: 0;
    font-size: 0.88rem;
    color: var(--text-muted);
  }

  &__sections {
    @include stack(14px);
  }

  &__grand-total {
    margin: 0;
    padding-top: 6px;
    font-size: 0.88rem;
    color: var(--text-muted);
    text-align: right;

    strong {
      @include mono;

      color: var(--text-strong);
    }
  }
}
</style>
