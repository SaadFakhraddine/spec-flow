<script setup lang="ts">
import { onMounted, ref } from 'vue'
import apiClient from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { ApiResponse, ProfileDto } from '@/types'
import { activityLabel } from '@/utils/activityLabel'
import { formatRelative } from '@/utils/format'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'

const auth = useAuthStore()
const toast = useToast()

const profile = ref<ProfileDto | null>(null)
const name = ref('')
const loading = ref(true)
const saving = ref(false)
const error = ref('')

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const response = await apiClient.get<ApiResponse<ProfileDto>>('/auth/me/profile')
    profile.value = response.data.data
    name.value = response.data.data.user.name
    auth.setUser(response.data.data.user)
  } catch {
    error.value = 'Could not load profile'
  } finally {
    loading.value = false
  }
}

async function saveName(): Promise<void> {
  const trimmed = name.value.trim()
  if (!trimmed || trimmed === profile.value?.user.name) return
  saving.value = true
  try {
    const response = await apiClient.patch<ApiResponse<ProfileDto['user']>>('/auth/me', {
      name: trimmed,
    })
    auth.setUser(response.data.data)
    if (profile.value) profile.value = { ...profile.value, user: response.data.data }
    toast.success('Display name updated')
  } catch {
    toast.error('Could not update name')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <LoadingSkeleton v-if="loading" :rows="3" />
  <div v-else-if="error">
    <p class="text-body text-danger">{{ error }}</p>
    <Button class="mt-3" variant="secondary" @click="load">Retry</Button>
  </div>
  <div v-else-if="profile" class="space-y-6">
    <header class="flex flex-wrap items-start gap-3">
      <div class="min-w-0 flex-1">
        <Input id="profile-name" v-model="name" label="Display name" />
        <p class="mt-2 truncate text-body text-muted">{{ profile.user.email }}</p>
      </div>
      <span class="sf-chip mt-6 bg-elevated text-primary">{{ profile.user.role }}</span>
    </header>
    <Button :loading="saving" :disabled="!name.trim()" @click="saveName">Save name</Button>

    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-md border border-line px-3 py-2">
        <p class="font-mono text-title text-primary">{{ profile.stats.openAssigned }}</p>
        <p class="text-label text-muted">Open assigned</p>
      </div>
      <div class="rounded-md border border-line px-3 py-2">
        <p class="font-mono text-title text-primary">{{ profile.stats.watching }}</p>
        <p class="text-label text-muted">Watching</p>
      </div>
      <div class="rounded-md border border-line px-3 py-2">
        <p class="font-mono text-title text-primary">{{ profile.stats.unreadNotifications }}</p>
        <p class="text-label text-muted">Unread alerts</p>
      </div>
      <div class="rounded-md border border-line px-3 py-2">
        <p class="font-mono text-title text-primary">{{ profile.stats.blockedAssigned }}</p>
        <p class="text-label text-muted">Blocked assigned</p>
      </div>
    </div>

    <section>
      <h3 class="text-section font-medium">Recent on your work</h3>
      <p v-if="profile.recent.length === 0" class="mt-2 text-body text-muted">
        No recent activity on your work yet.
      </p>
      <ul v-else class="mt-2 space-y-2">
        <li
          v-for="item in profile.recent"
          :key="item.id"
          class="border-b border-line pb-2 last:border-b-0"
        >
          <RouterLink
            v-if="item.taskId"
            :to="`/tasks/${item.taskId}`"
            class="text-body text-primary hover:brightness-110"
          >
            {{ activityLabel(item) }}
          </RouterLink>
          <p v-else class="text-body">{{ activityLabel(item) }}</p>
          <p class="text-label text-muted">{{ formatRelative(item.createdAt) }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>
