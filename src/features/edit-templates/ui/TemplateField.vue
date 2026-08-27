<script setup lang="ts">
import { templateVariableHintByToken } from '@/entities/report'

const props = defineProps<{
  label: string
  modelValue: string
  variableTokens: readonly string[]
  rows?: number
  hint?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [templateText: string]
}>()

function updateTemplate(event: Event): void {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

function appendToken(variableToken: string): void {
  const templateText = props.modelValue

  if (templateText.length === 0) {
    emit('update:modelValue', variableToken)
    return
  }

  const separator = /\s$/.test(templateText) ? '' : ' '
  emit('update:modelValue', `${templateText}${separator}${variableToken}`)
}
</script>

<template>
  <div class="template-field">
    <label class="template-field__label">
      {{ label }}
      <textarea
        class="template-field__input"
        :rows="rows ?? 4"
        :value="modelValue"
        @input="updateTemplate"
      />
    </label>

    <p v-if="hint" class="template-field__hint">{{ hint }}</p>

    <div class="template-field__tokens">
      <button
        v-for="variableToken in variableTokens"
        :key="variableToken"
        type="button"
        class="template-field__token"
        :title="templateVariableHintByToken[variableToken] ?? 'Вставить переменную в шаблон.'"
        @click="appendToken(variableToken)"
      >
        {{ variableToken }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.template-field {
  @include stack;

  &__label {
    @include field-label;
  }

  &__input {
    @include control;
    @include mono;

    font-size: 0.85rem;
    line-height: 1.5;
    padding: 10px 12px;
    resize: vertical;
  }

  &__hint {
    @include caption;
  }

  &__tokens {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__token {
    @include mono;

    font-size: 0.75rem;
    color: var(--accent);
    background: var(--accent-surface);
    border: 1px solid transparent;
    border-radius: $radius-small;
    padding: 3px 8px;
    cursor: pointer;
    transition: border-color 0.15s ease;

    &:hover {
      border-color: var(--accent);
    }
  }
}
</style>
