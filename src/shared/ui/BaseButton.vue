<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'medium' | 'small'
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  {
    variant: 'secondary',
    size: 'medium',
    type: 'button',
    disabled: false,
  },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['button', `button--${variant}`, `button--${size}`]"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.button {
  border-radius: $radius-control;
  border: 1px solid transparent;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;

  &--medium {
    padding: 9px 16px;
    font-size: 0.9rem;
  }

  &--small {
    padding: 5px 10px;
    font-size: 0.8rem;
  }

  &--primary {
    background: var(--accent);
    color: var(--accent-contrast);

    &:hover:not(:disabled) {
      background: var(--accent-hover);
    }
  }

  &--secondary {
    background: var(--surface-raised);
    border-color: var(--border);
    color: var(--text-strong);

    &:hover:not(:disabled) {
      border-color: var(--accent);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--text-muted);

    &:hover:not(:disabled) {
      color: var(--text-strong);
      background: var(--surface-raised);
    }
  }

  &--danger {
    background: transparent;
    border-color: var(--border);
    color: var(--danger);

    &:hover:not(:disabled) {
      border-color: var(--danger);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
