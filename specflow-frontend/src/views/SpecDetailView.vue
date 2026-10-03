<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSpecs } from '@/composables/useSpecs'
import { useToast } from '@/composables/useToast'
import type { SpecForm, SpecStatus } from '@/types'
import { specBorder, specStatusLabel, specStatuses, taskStatusLabel } from '@/utils/status'
import { fieldErrors, specSchema } from '@/utils/validators'
import Button from '@/components/ui/Button.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import Select from '@/components/ui/Select.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import LinkTaskModal from '@/components/features/LinkTaskModal.vue'
import SpecEditor from '@/components/features/SpecEditor.vue'
import SpecSection from '@/components/features/SpecSection.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const toast = useToast()
const { selectedSpec, isLoading, error, fetchSpecById, updateSpec, addTaskToSpec } = useSpecs()
const editing = ref(false)
const linking = ref(false)
const draft = ref<SpecForm | null>(null)
const errors = ref<Record<string, string>>({})
const isAdmin = computed(() => user.value?.role === 'admin')
const statusOptions = specStatuses.map((value) => ({ value, label: specStatusLabel[value] }))

function specId(): string {
  return String(route.params.id)
}

onMounted(() => {
  void fetchSpecById(specId())
})

function startEdit(): void {
  if (!selectedSpec.value) return
  draft.value = {
    title: selectedSpec.value.title,
    businessGoal: selectedSpec.value.businessGoal,
    technicalApproach: selectedSpec.value.technicalApproach,
    apiDesign: selectedSpec.value.apiDesign,
    edgeCases: selectedSpec.value.edgeCases.length ? selectedSpec.value.edgeCases : [''],
    acceptanceCriteria: selectedSpec.value.acceptanceCriteria,
    regressionRisks: selectedSpec.value.regressionRisks,
    status: selectedSpec.value.status,
  }
  editing.value = true
}

async function save(): Promise<void> {
  if (!draft.value) return
  const filled = {
    ...draft.value,
    edgeCases: draft.value.edgeCases.map((item) => item.trim()).filter(Boolean),
    acceptanceCriteria: draft.value.acceptanceCriteria.map((item) => item.trim()).filter(Boolean),
  }
  errors.value = fieldErrors(specSchema, filled)
  if (Object.values(errors.value).some(Boolean)) return
  const updated = await updateSpec(specId(), filled)
  if (!updated) {
    toast.error(error.value || 'Could not save the spec')
    return
  }
  editing.value = false
  toast.success('Spec updated')
}

async function onStatus(status: string): Promise<void> {
  const updated = await updateSpec(specId(), { status: status as SpecStatus })
  if (updated) toast.success('Status updated')
  else toast.error(error.value || 'Could not update status')
}

async function link(taskId: string): Promise<void> {
  const updated = await addTaskToSpec(specId(), taskId)
  linking.value = false
  if (updated) toast.success('Task linked')
  else toast.error(error.value || 'Could not link the task')
}
</script>

<template>
  <PageWrapper :title="selectedSpec?.title ?? 'Spec'" subtitle="Technical agreement for the work">
    <template #actions>
      <Button v-if="isAdmin && selectedSpec && !editing" variant="secondary" @click="startEdit">Edit</Button>
    </template>
    <LoadingSkeleton v-if="isLoading && !selectedSpec" />
    <div v-else-if="error && !selectedSpec">
      <p class="text-body text-danger">{{ error }}</p>
      <Button class="mt-3" variant="secondary" @click="fetchSpecById(specId())">Retry</Button>
    </div>
    <SpecEditor
      v-else-if="editing && draft"
      v-model="draft"
      :errors="errors"
      :submitting="isLoading"
      submit-label="Save spec"
      @submit="save"
      @cancel="editing = false"
    />
    <div v-else-if="selectedSpec" class="grid gap-6 lg:grid-cols-[1fr_16rem]">
      <div class="flex flex-col gap-3">
        <SpecSection label="Business goal" :text="selectedSpec.businessGoal" />
        <SpecSection label="Technical approach" :text="selectedSpec.technicalApproach" />
        <SpecSection label="API design" :text="selectedSpec.apiDesign || '—'" />
        <SpecSection label="Edge cases" :items="selectedSpec.edgeCases" />
        <SpecSection label="Acceptance criteria" :items="selectedSpec.acceptanceCriteria" />
        <SpecSection label="Regression risks" :text="selectedSpec.regressionRisks || '—'" />
        <section class="sf-panel p-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-body font-medium">Linked tasks</h2>
            <Button v-if="isAdmin" variant="ghost" @click="linking = true">Add existing task</Button>
          </div>
          <ul class="space-y-2">
            <li
              v-for="task in selectedSpec.tasks"
              :key="task.id"
              class="flex items-center gap-3 border-l-2 border-line pl-3"
            >
              <button type="button" class="text-body text-primary" @click="router.push(`/tasks/${task.id}`)">
                {{ task.title }}
              </button>
              <span class="sf-chip bg-elevated text-muted">{{ taskStatusLabel[task.status] }}</span>
            </li>
          </ul>
        </section>
      </div>
      <aside class="sf-panel h-fit space-y-4 p-4 lg:sticky lg:top-4" :class="specBorder[selectedSpec.status]">
        <p class="text-label uppercase tracking-wide text-muted">Workflow</p>
        <Select
          v-if="isAdmin"
          id="spec-status"
          :model-value="selectedSpec.status"
          label="Status"
          :options="statusOptions"
          @update:model-value="onStatus"
        />
        <p v-else class="sf-chip bg-elevated text-text">{{ specStatusLabel[selectedSpec.status] }}</p>
        <p class="text-label text-muted">Created by {{ selectedSpec.createdBy.name }}</p>
      </aside>
    </div>
    <LinkTaskModal
      v-if="linking && selectedSpec"
      :linked-ids="selectedSpec.tasks.map((task) => task.id)"
      @close="linking = false"
      @pick="link"
    />
  </PageWrapper>
</template>
