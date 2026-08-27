<script setup lang="ts">
import { BaseButton, BasePanel } from '@/shared/ui'
import {
  documentTemplateVariableTokens,
  lineTemplateVariableTokens,
  sectionTemplateVariableTokens,
  useReportStore,
} from '@/entities/report'
import { useSettingsStore } from '@/entities/settings'
import { TemplateField } from '@/features/edit-templates'

const reportStore = useReportStore()
const settingsStore = useSettingsStore()

function updateReportDate(event: Event): void {
  reportStore.setReportDate((event.target as HTMLInputElement).value)
}

function updateLinkTemplate(event: Event): void {
  settingsStore.linkTemplate = (event.target as HTMLInputElement).value
}

function updateFlattenHierarchy(event: Event): void {
  settingsStore.shouldFlattenHierarchy = (event.target as HTMLInputElement).checked
}
</script>

<template>
  <BasePanel title="Шаблоны отчёта" subtitle="Настройки сохраняются автоматически.">
    <template #actions>
      <BaseButton size="small" @click="settingsStore.resetTemplates()">Сбросить шаблоны</BaseButton>
    </template>

    <div class="editor__row">
      <label class="editor__label">
        Дата отчёта
        <input
          class="editor__input"
          type="date"
          :value="reportStore.reportDate"
          @input="updateReportDate"
        />
      </label>

      <label class="editor__label editor__label--grow">
        Шаблон ссылки на задачу
        <input
          class="editor__input editor__input--mono"
          type="text"
          :value="settingsStore.linkTemplate"
          placeholder="https://bitrix.example.com/workgroups/group/{projectId}/tasks/task/view/{id}/"
          @input="updateLinkTemplate"
        />
        <span class="editor__hint">
          {{ '{id}' }} — ID задачи, {{ '{projectId}' }} — ID группы из реестра проектов.
        </span>
      </label>
    </div>

    <label class="editor__checkbox">
      <input
        type="checkbox"
        :checked="settingsStore.shouldFlattenHierarchy"
        @change="updateFlattenHierarchy"
      />
      <span>
        Плоский список задач
        <em class="editor__checkbox-hint">
          (без галочки вложенность подзадач сохраняется отступами)
        </em>
      </span>
    </label>

    <TemplateField
      v-model="settingsStore.documentTemplate"
      label="Шаблон документа"
      hint="Обязательно должен содержать {sections} — иначе переменная добавится в конец автоматически."
      :variable-tokens="documentTemplateVariableTokens"
      :rows="6"
    />

    <TemplateField
      v-model="settingsStore.sectionTemplate"
      label="Шаблон раздела (проекта)"
      hint="Здесь подставляется ID проекта Bitrix из реестра. Обязательно должен содержать {list}."
      :variable-tokens="sectionTemplateVariableTokens"
      :rows="5"
    />

    <TemplateField
      v-model="settingsStore.lineTemplate"
      label="Шаблон строки задачи"
      :variable-tokens="lineTemplateVariableTokens"
      :rows="3"
    />
  </BasePanel>
</template>

<style scoped lang="scss">
.editor {
  &__row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__label {
    @include field-label;

    &--grow {
      flex: 1 1 320px;
      min-width: 0;
    }
  }

  &__input {
    @include control;

    font-size: 0.85rem;
    padding: 8px 12px;

    &--mono {
      @include mono;
    }
  }

  &__hint {
    @include caption;

    font-weight: 400;
  }

  &__checkbox {
    @include row;

    font-size: 0.85rem;
    color: var(--text);
    cursor: pointer;
  }

  &__checkbox-hint {
    color: var(--text-muted);
    font-style: normal;
    font-size: 0.8rem;
  }
}
</style>
