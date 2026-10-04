<script setup lang="ts">
import AppearanceForm from '@/components/features/AppearanceForm.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'
</script>

<template>
  <PageWrapper title="Settings" subtitle="Personal appearance for SpecFlow">
    <div class="sf-panel sf-panel-pad max-w-2xl">
      <h2 class="mb-1 text-label uppercase tracking-wide text-muted">Appearance</h2>
      <AppearanceForm />
    </div>
  </PageWrapper>
</template>
