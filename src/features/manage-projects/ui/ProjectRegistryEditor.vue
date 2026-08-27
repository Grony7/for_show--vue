<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@/shared/ui'
import { useSettingsStore } from '@/entities/settings'

const settingsStore = useSettingsStore()

const newProjectIdText = ref('')
const newProjectName = ref('')
const errorMessage = ref<string | null>(null)

function addProject(): void {
  const projectId = Number(newProjectIdText.value.trim())
  const projectName = newProjectName.value.trim()

  if (!Number.isInteger(projectId) || projectId <= 0) {
    errorMessage.value = 'ID проекта должен быть положительным числом.'
    return
  }

  if (projectName.length === 0) {
    errorMessage.value = 'Укажите название раздела так, как оно приходит из Bitrix.'
    return
  }

  settingsStore.addProject({ id: projectId, name: projectName })
  newProjectIdText.value = ''
  newProjectName.value = ''
  errorMessage.value = null
}

function updateProjectId(projectIndex: number, event: Event): void {
  const project = settingsStore.projects[projectIndex]
  const projectId = Number((event.target as HTMLInputElement).value.trim())

  if (!project || !Number.isInteger(projectId) || projectId <= 0) {
    return
  }

  settingsStore.updateProject(projectIndex, { ...project, id: projectId })
}

function updateProjectName(projectIndex: number, event: Event): void {
  const project = settingsStore.projects[projectIndex]

  if (!project) {
    return
  }

  settingsStore.updateProject(projectIndex, {
    ...project,
    name: (event.target as HTMLInputElement).value,
  })
}
</script>

<template>
  <div class="registry">
    <p v-if="settingsStore.projects.length === 0" class="registry__empty">
      Реестр пуст. Добавьте проекты вручную или привяжите их прямо из разобранного отчёта.
    </p>

    <ul v-else class="registry__list">
      <li
        v-for="(project, projectIndex) in settingsStore.projects"
        :key="projectIndex"
        class="registry__item"
      >
        <input
          class="registry__input registry__input--id"
          type="text"
          inputmode="numeric"
          :value="project.id"
          aria-label="ID проекта Bitrix"
          @change="updateProjectId(projectIndex, $event)"
        />
        <input
          class="registry__input registry__input--name"
          type="text"
          :value="project.name"
          aria-label="Название раздела в выгрузке Bitrix"
          @input="updateProjectName(projectIndex, $event)"
        />
        <BaseButton
          variant="danger"
          size="small"
          @click="settingsStore.removeProject(projectIndex)"
        >
          Удалить
        </BaseButton>
      </li>
    </ul>

    <form class="registry__form" @submit.prevent="addProject">
      <input
        v-model="newProjectIdText"
        class="registry__input registry__input--id"
        type="text"
        inputmode="numeric"
        placeholder="ID"
        aria-label="ID нового проекта"
      />
      <input
        v-model="newProjectName"
        class="registry__input registry__input--name"
        type="text"
        placeholder="Название раздела, например «Исследования (внутренний)»"
        aria-label="Название нового раздела"
      />
      <BaseButton type="submit" variant="primary" size="small">Добавить</BaseButton>
    </form>

    <p v-if="errorMessage" class="registry__error">{{ errorMessage }}</p>
  </div>
</template>

<style scoped lang="scss">
.registry {
  @include stack(10px);

  &__empty {
    @include caption;

    font-size: 0.85rem;
  }

  &__list {
    @include reset-list;
    @include stack;
  }

  &__item {
    @include row;
  }

  &__form {
    @include row;

    padding-top: 10px;
    border-top: 1px dashed var(--border);
  }

  &__input {
    @include control($radius-small);

    font-size: 0.85rem;
    padding: 6px 10px;

    &--id {
      @include mono;

      width: 96px;
    }

    &--name {
      flex: 1 1 220px;
      min-width: 0;

      @include below($breakpoint-mobile) {
        flex-basis: 100%;
        order: -1;
      }
    }
  }

  &__error {
    @include caption;

    font-size: 0.8rem;
    color: var(--danger);
  }
}
</style>
