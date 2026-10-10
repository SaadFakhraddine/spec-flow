<script setup lang="ts">
import { useSpecDetail } from '@/composables/useSpecDetail'
import { formatDate, formatRelative } from '@/utils/format'
import { specBorder, specStatusLabel, taskStatusLabel } from '@/utils/status'
import Button from '@/components/ui/Button.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import Select from '@/components/ui/Select.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import ActivityTimeline from '@/components/features/ActivityTimeline.vue'
import CommentsPanel from '@/components/features/CommentsPanel.vue'
import LinkTaskModal from '@/components/features/LinkTaskModal.vue'
import SpecCoverage from '@/components/features/SpecCoverage.vue'
import SpecEditor from '@/components/features/SpecEditor.vue'
import SpecSection from '@/components/features/SpecSection.vue'

const {
  selectedSpec,
  revisions,
  isLoading,
  error,
  editing,
  linking,
  confirmDelete,
  draft,
  errors,
  isAdmin,
  statusOptions,
  load,
  startEdit,
  save,
  onStatus,
  link,
  onArchiveToggle,
  onDelete,
  openTask,
} = useSpecDetail()
</script>

<template>
  <PageWrapper :title="selectedSpec?.title ?? 'Spec'" subtitle="Technical agreement for the work">
    <template #actions>
      <Button v-if="isAdmin && selectedSpec && !editing" variant="secondary" @click="startEdit">Edit</Button>
      <Button v-if="isAdmin && selectedSpec" variant="secondary" @click="onArchiveToggle">
        {{ selectedSpec.archivedAt ? 'Unarchive' : 'Archive' }}
      </Button>
      <Button v-if="isAdmin && selectedSpec" variant="danger" @click="confirmDelete = true">Delete</Button>
    </template>
    <LoadingSkeleton v-if="isLoading && !selectedSpec" />
    <div v-else-if="error && !selectedSpec">
      <p class="text-body text-danger">{{ error }}</p>
      <Button class="mt-3" variant="secondary" @click="load">Retry</Button>
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
        <p v-if="selectedSpec.archivedAt" class="sf-chip w-fit bg-elevated text-muted">
          Archived {{ formatDate(selectedSpec.archivedAt) }}
        </p>
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
              <button type="button" class="text-body text-primary" @click="openTask(task.id)">
                {{ task.title }}
              </button>
              <span class="sf-chip bg-elevated text-muted">{{ taskStatusLabel[task.status] }}</span>
            </li>
          </ul>
        </section>
        <section class="sf-panel p-4">
          <h2 class="text-body font-medium">History</h2>
          <p v-if="revisions.length === 0" class="mt-2 text-body text-muted">
            Versions are saved when a spec is approved.
          </p>
          <ul v-else class="mt-2 space-y-2">
            <li
              v-for="rev in revisions"
              :key="rev.id"
              class="border-b border-line pb-2 last:border-b-0"
            >
              <p class="text-body">
                v{{ rev.version }} · {{ rev.title }}
                <span class="text-muted">({{ specStatusLabel[rev.status] }})</span>
              </p>
              <p class="text-label text-muted">
                {{ rev.createdBy.name }} · {{ formatRelative(rev.createdAt) }}
              </p>
            </li>
          </ul>
        </section>
      </div>
      <aside class="space-y-4 lg:sticky lg:top-4">
        <div class="sf-panel h-fit space-y-4 p-4" :class="specBorder[selectedSpec.status]">
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
          <p v-if="selectedSpec.approvedBy" class="text-label text-muted">
            Approved by {{ selectedSpec.approvedBy.name }}
            <span v-if="selectedSpec.approvedAt"> · {{ formatDate(selectedSpec.approvedAt) }}</span>
          </p>
        </div>
        <SpecCoverage :spec="selectedSpec" />
        <ActivityTimeline :spec-id="selectedSpec.id" empty-message="Spec status changes show up here." />
      </aside>
      <div class="lg:col-span-2">
        <CommentsPanel resource="specs" :parent-id="selectedSpec.id" />
      </div>
    </div>
    <LinkTaskModal
      v-if="linking && selectedSpec"
      :linked-ids="selectedSpec.tasks.map((task) => task.id)"
      @close="linking = false"
      @pick="link"
    />
    <ConfirmDialog
      v-if="confirmDelete"
      title="Delete spec?"
      message="Linked tasks will be unlinked. This cannot be undone."
      confirm-label="Delete"
      @cancel="confirmDelete = false"
      @confirm="onDelete"
    />
  </PageWrapper>
</template>
