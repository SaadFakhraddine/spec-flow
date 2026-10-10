<script setup lang="ts">
import { onMounted, ref } from 'vue'
import apiClient from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { ApiResponse, User } from '@/types'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'

const auth = useAuthStore()
const toast = useToast()

const name = ref('')
const email = ref('')
const role = ref('')
const loading = ref(true)
const saving = ref(false)
const error = ref('')

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    if (auth.user) {
      name.value = auth.user.name
      email.value = auth.user.email
      role.value = auth.user.role
    }
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    auth.setUser(response.data.data)
    name.value = response.data.data.name
    email.value = response.data.data.email
    role.value = response.data.data.role
  } catch {
    error.value = 'Could not load profile'
  } finally {
    loading.value = false
  }
}

async function saveName(): Promise<void> {
  const trimmed = name.value.trim()
  if (!trimmed || trimmed === auth.user?.name) return
  saving.value = true
  try {
    const response = await apiClient.patch<ApiResponse<User>>('/auth/me', { name: trimmed })
    auth.setUser(response.data.data)
    name.value = response.data.data.name
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
  <LoadingSkeleton v-if="loading" :rows="2" />
  <div v-else-if="error">
    <p class="text-body text-danger">{{ error }}</p>
    <Button class="mt-3" variant="secondary" @click="load">Retry</Button>
  </div>
  <div v-else class="max-w-md space-y-4">
    <div class="flex flex-wrap items-end gap-3">
      <div class="min-w-0 flex-1">
        <Input id="profile-name" v-model="name" label="Display name" />
      </div>
      <span class="sf-chip mb-0.5 bg-elevated text-primary">{{ role }}</span>
    </div>
    <p class="text-body text-muted">{{ email }}</p>
    <Button :loading="saving" :disabled="!name.trim()" @click="saveName">Save name</Button>
  </div>
</template>
