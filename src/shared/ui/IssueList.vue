<script setup lang="ts">
interface IssueListItem {
  severity: 'warning' | 'error'
  message: string
  details?: string
}

defineProps<{
  title: string
  issues: IssueListItem[]
  emptyText?: string
}>()
</script>

<template>
  <div class="issues">
    <h3 class="issues__title">{{ title }}</h3>

    <p v-if="issues.length === 0" class="issues__empty">
      {{ emptyText ?? 'Проблем не найдено.' }}
    </p>

    <ul v-else class="issues__list">
      <li v-for="(issue, issueIndex) in issues" :key="issueIndex" class="issues__item">
        <span :class="['issues__badge', `issues__badge--${issue.severity}`]">
          {{ issue.severity === 'error' ? 'ошибка' : 'внимание' }}
        </span>
        <span class="issues__message">{{ issue.message }}</span>
        <code v-if="issue.details" class="issues__details">{{ issue.details }}</code>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.issues {
  @include stack;

  &__title {
    @include section-caption;
  }

  &__empty {
    @include caption;

    font-size: 0.85rem;
  }

  &__list {
    @include reset-list;
    @include stack;
  }

  &__item {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 0.85rem;
  }

  &__badge {
    flex-shrink: 0;
    border-radius: $radius-pill;
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;

    &--warning {
      background: var(--warning-surface);
      color: var(--warning);
    }

    &--error {
      background: var(--danger-surface);
      color: var(--danger);
    }
  }

  &__message {
    color: var(--text);
  }

  &__details {
    @include mono;

    flex-basis: 100%;
    font-size: 0.78rem;
    color: var(--text-muted);
    background: var(--surface-raised);
    border-radius: $radius-small;
    padding: 4px 8px;
    overflow-x: auto;
  }
}
</style>
