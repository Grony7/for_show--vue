<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <section class="panel">
    <header class="panel__header">
      <div>
        <h2 class="panel__title">{{ title }}</h2>
        <p v-if="subtitle" class="panel__subtitle">{{ subtitle }}</p>
      </div>
      <div class="panel__actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="panel__body">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.panel {
  @include stack(16px);

  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: $radius-panel;
  padding: 20px;

  @include below($breakpoint-mobile) {
    gap: 12px;
    padding: 14px;
    border-radius: 10px;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-strong);

    @include below($breakpoint-mobile) {
      font-size: 0.98rem;
    }
  }

  &__subtitle {
    @include caption;

    margin-top: 4px;
    font-size: 0.85rem;
  }

  &__actions {
    @include row;
  }

  &__body {
    @include stack(14px);
  }
}
</style>
