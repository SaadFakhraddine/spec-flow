<script setup lang="ts">
import { useTaskDetail } from '@/composables/useTaskDetail'
import { formatDate } from '@/utils/format'
import { taskBorder } from '@/utils/status'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import Select from '@/components/ui/Select.vue'
import UserPicker from '@/components/ui/UserPicker.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import TaskComments from '@/components/features/TaskComments.vue'
import TaskBlockers from '@/components/features/TaskBlockers.vue'
import TaskChecklist from '@/components/features/TaskChecklist.vue'
import ActivityTimeline from '@/components/features/ActivityTimeline.vue'
import MarkdownBody from '@/components/ui/MarkdownBody.vue'

const {
  selectedTask,
  isLoading,
  error,
  editing,
  confirming,
  linkDraft,
  draft,
  statusOptions,
  priorityOptions,
  isAdmin,
  checklistReady,
  safeExternalUrl,
  taskId,
  fetchTaskById,
  saveLink,
  onStatus,
  startEdit,
  saveEdit,
  onAssign,
  onWatchToggle,
  onBlockers,
  onChecklist,
  onDelete,
} = useTaskDetail()
</script>

<template>
  <PageWrapper :title="selectedTask?.title ?? 'Task'" subtitle="Issue detail">
    <LoadingSkeleton v-if="isLoading && !selectedTask" />
    <div v-else-if="error && !selectedTask">
      <p class="text-body text-danger">{{ error }}</p>
      <Button class="mt-3" variant="secondary" @click="fetchTaskById(taskId())">Retry</Button>
    </div>
    <template v-else-if="selectedTask">
      <div class="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div>
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <span v-if="selectedTask.blocked" class="sf-chip bg-danger/15 text-danger">Blocked</span>
            <span v-if="!checklistReady" class="sf-chip bg-elevated text-muted">Checklist incomplete</span>
          </div>
          <div class="mb-6 flex flex-wrap items-end gap-3">
            <div class="w-44">
              <Select
                id="task-status"
                :model-value="selectedTask.status"
                label="Status"
                :options="statusOptions"
                @update:model-value="onStatus"
              />
            </div>
            <div v-if="isAdmin" class="min-w-[14rem] flex-1 basis-56">
              <UserPicker
                id="task-assign"
                :model-value="selectedTask.assignedTo?.id ?? ''"
                label="Assign to"
                @update:model-value="onAssign"
              />
            </div>
            <div class="flex flex-col">
              <span class="mb-1 block text-label text-transparent select-none" aria-hidden="true">Actions</span>
              <div class="flex flex-wrap gap-2">
                <Button variant="secondary" @click="onWatchToggle">
                  {{ selectedTask.watching ? 'Unwatch' : 'Watch' }}
                </Button>
                <Button v-if="isAdmin" variant="secondary" @click="startEdit">Edit</Button>
                <Button v-if="isAdmin" variant="danger" @click="confirming = true">Delete</Button>
              </div>
            </div>
          </div>
          <form v-if="editing" class="sf-panel mb-6 flex flex-col gap-4 p-4" @submit.prevent="saveEdit">
            <Input id="edit-title" v-model="draft.title" label="Title" />
            <Textarea id="edit-description" v-model="draft.description" label="Description" :max="500" />
            <Select id="edit-priority" v-model="draft.priority" label="Priority" :options="priorityOptions" />
            <Input id="edit-due" v-model="draft.dueDate" label="Due date" type="date" />
            <Input id="edit-tags" v-model="draft.tags" label="Tags" />
            <Input id="edit-link" v-model="draft.externalUrl" label="External link (PR / design)" />
            <div class="flex gap-2">
              <Button type="submit">Save</Button>
              <Button variant="ghost" type="button" @click="editing = false">Cancel</Button>
            </div>
          </form>
          <dl v-else class="sf-panel mb-4 space-y-4 p-4 text-body" :class="taskBorder[selectedTask.status]">
            <div>
              <dt class="text-label text-muted">Description</dt>
              <dd class="mt-1">
                <MarkdownBody v-if="selectedTask.description" :source="selectedTask.description" />
                <span v-else>—</span>
              </dd>
            </div>
            <div>
              <dt class="text-label text-muted">Priority</dt>
              <dd class="mt-1 capitalize">{{ selectedTask.priority }}</dd>
            </div>
            <div>
              <dt class="text-label text-muted">Due date</dt>
              <dd class="mt-1 font-mono text-label">{{ formatDate(selectedTask.dueDate) }}</dd>
            </div>
            <div v-if="safeExternalUrl">
              <dt class="text-label text-muted">External link</dt>
              <dd class="mt-1">
                <a class="text-primary" :href="safeExternalUrl" target="_blank" rel="noopener noreferrer">
                  Open link
                </a>
              </dd>
            </div>
            <div>
              <dt class="text-label text-muted">Created by</dt>
              <dd class="mt-1">{{ selectedTask.createdBy.name }}</dd>
            </div>
            <div>
              <dt class="text-label text-muted">Tags</dt>
              <dd class="mt-2 flex flex-wrap gap-2">
                <Badge v-for="tag in selectedTask.tags" :key="tag" :label="tag" />
              </dd>
            </div>
            <div v-if="selectedTask.specId">
              <dt class="text-label text-muted">Spec</dt>
              <dd class="mt-1">
                <RouterLink class="text-primary" :to="`/specs/${selectedTask.specId}`">Open linked spec</RouterLink>
              </dd>
            </div>
          </dl>
          <div class="space-y-4">
            <TaskBlockers
              :task-id="selectedTask.id"
              :reason="selectedTask.blockedReason"
              :blockers="selectedTask.blockedBy"
              @save="onBlockers"
            />
            <TaskChecklist :items="selectedTask.checklist" @change="onChecklist" />
            <section v-if="!editing" class="sf-panel space-y-2 p-4">
              <h2 class="text-section font-medium">External link</h2>
              <Input id="task-external-url" v-model="linkDraft" label="PR / design URL" placeholder="https://…" />
              <div class="flex items-center gap-3">
                <Button variant="secondary" @click="saveLink">Save link</Button>
                <a
                  v-if="safeExternalUrl"
                  class="text-body text-primary"
                  :href="safeExternalUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open link
                </a>
              </div>
            </section>
          </div>
        </div>
        <div class="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <TaskComments :task-id="selectedTask.id" />
          <ActivityTimeline :task-id="selectedTask.id" />
        </div>
      </div>
    </template>
    <ConfirmDialog
      v-if="confirming"
      title="Delete this task?"
      message="This removes the task from the board and from any linked spec."
      confirm-label="Delete"
      @cancel="confirming = false"
      @confirm="onDelete"
    />
  </PageWrapper>
</template>
