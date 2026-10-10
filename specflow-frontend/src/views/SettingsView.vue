<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppearanceForm from '@/components/features/AppearanceForm.vue'
import DefaultsForm from '@/components/features/DefaultsForm.vue'
import NotificationsForm from '@/components/features/NotificationsForm.vue'
import ProfilePanel from '@/components/features/ProfilePanel.vue'
import SettingsNav from '@/components/layout/SettingsNav.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'

const route = useRoute()
const section = computed(() => String(route.params.section || 'appearance'))

const titles: Record<string, { title: string; subtitle: string }> = {
  appearance: { title: 'Appearance', subtitle: 'Theme, accent, and density' },
  profile: { title: 'Profile', subtitle: 'How you show up on SpecFlow work' },
  notifications: { title: 'Notifications', subtitle: 'Choose which alerts reach you' },
  defaults: { title: 'Defaults', subtitle: 'Landing page, Tasks view, and scope' },
}

const meta = computed(() => titles[section.value] ?? titles.appearance)
</script>

<template>
  <PageWrapper title="Settings" subtitle="Personal SpecFlow preferences">
    <div class="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <SettingsNav />
      <div class="sf-panel sf-panel-pad min-w-0 max-w-2xl">
        <h2 class="text-section font-medium">{{ meta.title }}</h2>
        <p class="mt-1 mb-5 text-body text-muted">{{ meta.subtitle }}</p>
        <AppearanceForm v-if="section === 'appearance'" />
        <ProfilePanel v-else-if="section === 'profile'" />
        <NotificationsForm v-else-if="section === 'notifications'" />
        <DefaultsForm v-else-if="section === 'defaults'" />
        <p v-else class="text-body text-muted">Unknown settings section.</p>
      </div>
    </div>
  </PageWrapper>
</template>
