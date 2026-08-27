<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@/shared/ui'
import { useSettingsStore } from '@/entities/settings'

const settingsStore = useSettingsStore()

const newShortLabel = ref('')
const newLabel = ref('')
const errorMessage = ref<string | null>(null)

function addStatus(): void {
  const shortLabel = newShortLabel.value.trim()
  const label = newLabel.value.trim()

  if (shortLabel.length === 0 || label.length === 0) {
    errorMessage.value = 'Заполните и короткое название кнопки, и текст для отчёта.'
    return
  }

  settingsStore.addStatus({ shortLabel, label })
  newShortLabel.value = ''
  newLabel.value = ''
  errorMessage.value = null
}

function updateShortLabel(statusId: string, event: Event): void {
  settingsStore.updateStatus(statusId, {
    shortLabel: (event.target as HTMLInputElement).value,
  })
}

function updateLabel(statusId: string, event: Event): void {
  settingsStore.updateStatus(statusId, { label: (event.target as HTMLInputElement).value })
}
</script>

<template>
  <div class="statuses">
    <ul class="statuses__list">
      <li v-for="status in settingsStore.statuses" :key="status.id" class="statuses__item">
        <input
          class="statuses__input statuses__input--short"
          type="text"
          :value="status.shortLabel"
          aria-label="Короткое название для кнопки"
          @input="updateShortLabel(status.id, $event)"
        />
        <input
          class="statuses__input statuses__input--label"
          type="text"
          :value="status.label"
          aria-label="Текст статуса в отчёте"
          @input="updateLabel(status.id, $event)"
        />

        <label class="statuses__default" :title="'Статус по умолчанию для новых задач'">
          <input
            type="radio"
            name="defaultStatus"
            :checked="settingsStore.defaultStatusId === status.id"
            @change="settingsStore.setDefaultStatus(status.id)"
          />
          по умолчанию
        </label>

        <BaseButton
          variant="danger"
          size="small"
          :disabled="!settingsStore.canRemoveStatus"
          :title="settingsStore.canRemoveStatus ? 'Удалить статус' : 'Нужен хотя бы один статус'"
          @click="settingsStore.removeStatus(status.id)"
        >
          Удалить
        </BaseButton>
      </li>
    </ul>

    <form class="statuses__form" @submit.prevent="addStatus">
      <input
        v-model="newShortLabel"
        class="statuses__input statuses__input--short"
        type="text"
        placeholder="Кнопка"
        aria-label="Короткое название нового статуса"
      />
      <input
        v-model="newLabel"
        class="statuses__input statuses__input--label"
        type="text"
        placeholder="Текст в отчёте, например «Проверил задачу»"
        aria-label="Текст нового статуса в отчёте"
      />
      <BaseButton type="submit" variant="primary" size="small">Добавить</BaseButton>
    </form>

    <p v-if="errorMessage" class="statuses__error">{{ errorMessage }}</p>
  </div>
</template>

<style scoped lang="scss">
.statuses {
  @include stack(10px);

  &__list {
    @include reset-list;
    @include stack;
  }

  &__item,
  &__form {
    @include row;
  }

  &__form {
    padding-top: 10px;
    border-top: 1px dashed var(--border);
  }

  &__input {
    @include control($radius-small);

    font-size: 0.85rem;
    padding: 6px 10px;

    &--short {
      width: 120px;
    }

    &--label {
      flex: 1 1 240px;
      min-width: 0;
    }
  }

  &__default {
    @include row(4px);

    font-size: 0.78rem;
    color: var(--text-muted);
    cursor: pointer;
    white-space: nowrap;

    input {
      width: 14px;
      height: 14px;
      accent-color: var(--accent);
    }
  }

  &__error {
    @include caption;

    font-size: 0.8rem;
    color: var(--danger);
  }
}
</style>
