<script setup lang="ts">
import { ProjectRegistryPanel } from '@/widgets/project-registry'
import { ReportInputPanel } from '@/widgets/report-input'
import { ReportPreviewPanel } from '@/widgets/report-preview'
import { SectionReviewPanel } from '@/widgets/section-review'
import { StatusEditorPanel } from '@/widgets/status-editor'
import { TemplateEditorPanel } from '@/widgets/template-editor'
</script>

<template>
  <main class="page">
    <header class="page__header">
      <h1 class="page__title">Конструктор отчёта по проектам Bitrix24</h1>
      <p class="page__subtitle">
        Вставьте выгрузку из Bitrix, привяжите разделы к ID проектов и получите готовый markdown.
      </p>
    </header>

    <div class="page__grid">
      <div class="page__column">
        <ReportInputPanel />
        <ProjectRegistryPanel />
        <SectionReviewPanel />
      </div>

      <div class="page__column">
        <StatusEditorPanel />
        <TemplateEditorPanel />
        <ReportPreviewPanel />
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.page {
  @include stack(24px);

  max-width: 1440px;
  margin: 0 auto;
  padding: 32px 24px 64px;

  @include below($breakpoint-wide) {
    padding: 24px 16px 48px;
  }

  @include below($breakpoint-mobile) {
    gap: 16px;
    padding: 16px 12px 32px;
  }

  &__header {
    @include stack(6px);
  }

  &__title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 650;
    color: var(--text-strong);
    letter-spacing: -0.01em;

    @include below($breakpoint-mobile) {
      font-size: 1.2rem;
    }
  }

  &__subtitle {
    margin: 0;
    font-size: 0.92rem;
    color: var(--text-muted);

    @include below($breakpoint-mobile) {
      font-size: 0.85rem;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 20px;
    align-items: start;

    @include below($breakpoint-wide) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  &__column {
    @include stack(20px);

    min-width: 0;

    @include below($breakpoint-mobile) {
      gap: 16px;
    }
  }
}
</style>
