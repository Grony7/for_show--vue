<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton, BasePanel, IssueList } from '@/shared/ui'
import { useReportStore } from '@/entities/report'

const reportStore = useReportStore()

const placeholderText = [
  'Внутренние задачи',
  'ID\tЗадача\tВремя',
  '1001\tПодготовка макетов\t4 ч. 10м.',
  'Итого:\t4 ч. 10м.',
].join('\n')

const parseIssueItems = computed(() =>
  reportStore.parsingIssues.map((parseIssue) => ({
    severity: parseIssue.severity,
    message: `Строка ${parseIssue.lineNumber}: ${parseIssue.message}`,
    details: parseIssue.sourceLineText,
  })),
)

function updateRawInputText(event: Event): void {
  reportStore.setRawInputText((event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <BasePanel
    title="Исходные данные"
    subtitle="Вставьте отчёт из Bitrix24 целиком — вместе с заголовками разделов и строками «Итого»."
  >
    <textarea
      class="input__textarea"
      :value="reportStore.rawInputText"
      :placeholder="placeholderText"
      spellcheck="false"
      aria-label="Текст отчёта из Bitrix"
      @input="updateRawInputText"
    />

    <div class="input__actions">
      <BaseButton variant="primary" @click="reportStore.parseRawInput()">
        Разобрать отчёт
      </BaseButton>
      <span v-if="reportStore.informationMessage" class="input__message" role="status">
        {{ reportStore.informationMessage }}
      </span>
    </div>

    <IssueList
      v-if="reportStore.parsingIssues.length > 0"
      title="Проблемы разбора"
      :issues="parseIssueItems"
    />
  </BasePanel>
</template>

<style scoped lang="scss">
.input {
  &__textarea {
    @include code-area;

    min-height: 220px;
    white-space: pre;
    overflow-x: auto;
  }

  &__actions {
    @include row(12px);
  }

  &__message {
    font-size: 0.82rem;
    color: var(--text-muted);
  }
}
</style>
