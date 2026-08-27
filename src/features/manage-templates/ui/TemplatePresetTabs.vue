<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@/shared/ui'
import { useSettingsStore } from '@/entities/settings'

const settingsStore = useSettingsStore()

const isCreating = ref(false)
const newPresetName = ref('')

function startCreating(): void {
  isCreating.value = true
  newPresetName.value = ''
}

function confirmCreating(): void {
  const presetName = newPresetName.value.trim()

  settingsStore.addPreset(presetName.length > 0 ? presetName : 'Новый шаблон')
  isCreating.value = false
  newPresetName.value = ''
}

function cancelCreating(): void {
  isCreating.value = false
  newPresetName.value = ''
}

function renameActivePreset(event: Event): void {
  settingsStore.renamePreset(
    settingsStore.activePreset.id,
    (event.target as HTMLInputElement).value,
  )
}
</script>

<template>
  <div class="presets">
    <div class="presets__tabs" role="tablist" aria-label="Наборы шаблонов">
      <button
        v-for="preset in settingsStore.presets"
        :key="preset.id"
        type="button"
        role="tab"
        class="presets__tab"
        :class="{ 'presets__tab--active': preset.id === settingsStore.activePresetId }"
        :aria-selected="preset.id === settingsStore.activePresetId"
        @click="settingsStore.setActivePreset(preset.id)"
      >
        {{ preset.name }}
      </button>

      <button
        v-if="!isCreating"
        type="button"
        class="presets__add"
        title="Добавить набор шаблонов"
        @click="startCreating"
      >
        +
      </button>
    </div>

    <form v-if="isCreating" class="presets__create" @submit.prevent="confirmCreating">
      <input
        v-model="newPresetName"
        class="presets__input"
        type="text"
        placeholder="Название, например «Mattermost»"
        aria-label="Название нового набора шаблонов"
      />
      <BaseButton type="submit" variant="primary" size="small">Создать</BaseButton>
      <BaseButton variant="ghost" size="small" @click="cancelCreating">Отмена</BaseButton>
    </form>

    <div class="presets__controls">
      <label class="presets__name">
        Название набора
        <input
          class="presets__input"
          type="text"
          :value="settingsStore.activePreset.name"
          aria-label="Название активного набора шаблонов"
          @input="renameActivePreset"
        />
      </label>

      <div class="presets__actions">
        <BaseButton size="small" @click="settingsStore.duplicateActivePreset()">
          Дублировать
        </BaseButton>
        <BaseButton
          variant="danger"
          size="small"
          :disabled="!settingsStore.canRemovePreset"
          :title="
            settingsStore.canRemovePreset ? 'Удалить набор' : 'Нужен хотя бы один набор шаблонов'
          "
          @click="settingsStore.removePreset(settingsStore.activePreset.id)"
        >
          Удалить набор
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.presets {
  @include stack(10px);

  &__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
  }

  &__tab {
    font: inherit;
    font-size: 0.85rem;
    color: var(--text-muted);
    background: transparent;
    border: 1px solid transparent;
    border-radius: $radius-small;
    padding: 5px 12px;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;

    &:hover {
      background: var(--surface-raised);
      color: var(--text-strong);
    }

    &--active {
      background: var(--accent-surface);
      color: var(--accent);
      font-weight: 500;
    }
  }

  &__add {
    font: inherit;
    font-size: 1rem;
    line-height: 1;
    color: var(--text-muted);
    background: transparent;
    border: 1px dashed var(--border);
    border-radius: $radius-small;
    padding: 5px 12px;
    cursor: pointer;

    &:hover {
      color: var(--accent);
      border-color: var(--accent);
    }
  }

  &__create {
    @include row;
  }

  &__controls {
    @include row(12px);

    justify-content: space-between;
  }

  &__name {
    @include field-label;

    flex: 1 1 220px;
    min-width: 0;
  }

  &__actions {
    @include row;
  }

  &__input {
    @include control($radius-small);

    font-size: 0.85rem;
    padding: 6px 10px;
    flex: 1 1 200px;
    min-width: 0;
  }
}
</style>
