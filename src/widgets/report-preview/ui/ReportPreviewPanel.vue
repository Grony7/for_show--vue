<script setup lang="ts">
import { computed } from 'vue'
import { templateScopeLabelByValue } from '@/shared/lib'
import { BasePanel, IssueList } from '@/shared/ui'
import { useReportStore } from '@/entities/report'
import { CopyReportButton } from '@/features/copy-report'

const reportStore = useReportStore()

const buildIssueItems = computed(() =>
  reportStore.reportBuildIssues.map((templateIssue) => ({
    severity: templateIssue.severity,
    message: `${templateScopeLabelByValue[templateIssue.scope]}: ${templateIssue.message}`,
  })),
)
</script>

<template>
  <BasePanel title="Готовый отчёт">
    <template #actions>
      <CopyReportButton :report-text="reportStore.markdownReportText" />
    </template>

    <textarea
      class="preview__output"
      readonly
      :value="reportStore.markdownReportText"
      placeholder="После разбора здесь появится готовый markdown-отчёт."
      aria-label="Готовый markdown-отчёт"
    />

    <IssueList
      v-if="reportStore.reportBuildIssues.length > 0"
      title="Проблемы шаблонов"
      :issues="buildIssueItems"
    />
  </BasePanel>
</template>

<style scoped lang="scss">
.preview {
  &__output {
    @include code-area;

    min-height: 320px;

    @include below($breakpoint-mobile) {
      min-height: 240px;
      font-size: 0.8rem;
    }
  }
}
</style>
