<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSpecs } from '@/composables/useSpecs'
import { useToast } from '@/composables/useToast'
import type { SpecForm } from '@/types'
import { emptySpecForm, fieldErrors, specSchema } from '@/utils/validators'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import SpecEditor from '@/components/features/SpecEditor.vue'

const DRAFT_KEY = 'specflow:spec-draft'
const router = useRouter()
const toast = useToast()
const { createSpec, isLoading, error } = useSpecs()
const form = ref<SpecForm>(emptySpecForm())
const errors = ref<Record<string, string>>({})
let timer = 0

function saveDraft(): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(form.value))
}

function loadDraft(): void {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) return
  try {
    form.value = JSON.parse(raw) as SpecForm
  } catch {
    localStorage.removeItem(DRAFT_KEY)
  }
}

onMounted(() => {
  loadDraft()
  timer = window.setInterval(saveDraft, 30000)
})

onUnmounted(() => window.clearInterval(timer))

async function submit(): Promise<void> {
  const filled: SpecForm = {
    ...form.value,
    edgeCases: form.value.edgeCases.map((item) => item.trim()).filter(Boolean),
    acceptanceCriteria: form.value.acceptanceCriteria.map((item) => item.trim()).filter(Boolean),
  }
  errors.value = fieldErrors(specSchema, filled)
  if (Object.values(errors.value).some(Boolean)) return
  const created = await createSpec(filled)
  if (!created) {
    toast.error(error.value || 'Could not create the spec')
    return
  }
  localStorage.removeItem(DRAFT_KEY)
  toast.success('Spec created')
  await router.push(`/specs/${created.id}`)
}
</script>

<template>
  <PageWrapper title="New spec">
    <SpecEditor v-model="form" :errors="errors" :submitting="isLoading" submit-label="Create spec" @submit="submit" @cancel="router.push('/specs')" />
  </PageWrapper>
</template>
