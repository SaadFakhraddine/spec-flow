<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useTasks } from '@/composables/useTasks'
import { useToast } from '@/composables/useToast'
import type { ChecklistItem, TaskInput, TaskStatus } from '@/types'
import { formatDate } from '@/utils/format'
import { taskBorder, taskPriorities, taskStatusLabel, taskStatuses } from '@/utils/status'
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

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const toast = useToast()
const {
  selectedTask, isLoading, error, fetchTaskById, updateTask, deleteTask, assignTask, watchTask, unwatchTask,
} = useTasks()
const editing = ref(false)
const confirming = ref(false)
const linkDraft = ref('')
const draft = ref({ title: '', description: '', priority: 'medium', dueDate: '', tags: '', externalUrl: '' })
const statusOptions = taskStatuses.map((value) => ({ value, label: taskStatusLabel[value] }))
const priorityOptions = taskPriorities.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}))
const isAdmin = computed(() => user.value?.role === 'admin')
const checklistReady = computed(() => selectedTask.value?.checklist.every((item) => item.done) ?? true)

function taskId(): string {
  return String(route.params.id)
}

onMounted(async () => {
  await fetchTaskById(taskId())
  linkDraft.value = selectedTask.value?.externalUrl ?? ''
})

async function saveLink(): Promise<void> {
  const updated = await updateTask(taskId(), { externalUrl: linkDraft.value.trim() || null })
  if (updated) toast.success('Link saved')
  else toast.error(error.value || 'Could not save link')
}

async function onStatus(status: string): Promise<void> {
  const updated = await updateTask(taskId(), { status: status as TaskStatus })
  if (!updated) {
    toast.error(error.value || 'Could not update status')
    return
  }
  if (status === 'done' && !checklistReady.value) {
    toast.error('Marked done with an incomplete checklist')
  } else {
    toast.success('Status updated')
  }
}

function startEdit(): void {
  if (!selectedTask.value) return
  draft.value = {
    title: selectedTask.value.title,
    description: selectedTask.value.description,
    priority: selectedTask.value.priority,
    dueDate: selectedTask.value.dueDate ? selectedTask.value.dueDate.slice(0, 10) : '',
    tags: selectedTask.value.tags.join(', '),
    externalUrl: selectedTask.value.externalUrl,
  }
  editing.value = true
}

async function saveEdit(): Promise<void> {
  const input: Partial<TaskInput> = {
    title: draft.value.title,
    description: draft.value.description,
    priority: draft.value.priority as TaskInput['priority'],
    tags: draft.value.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    dueDate: draft.value.dueDate ? new Date(draft.value.dueDate).toISOString() : null,
    externalUrl: draft.value.externalUrl.trim() || null,
  }
  const updated = await updateTask(taskId(), input)
  if (!updated) {
    toast.error(error.value || 'Could not save the task')
    return
  }
  editing.value = false
  toast.success('Task updated')
}

async function onAssign(userId: string): Promise<void> {
  if (!userId) return
  const updated = await assignTask(taskId(), userId)
  if (updated) toast.success('Task assigned')
  else toast.error(error.value || 'Could not assign the task')
}

async function onWatchToggle(): Promise<void> {
  const watching = selectedTask.value?.watching
  const updated = watching ? await unwatchTask(taskId()) : await watchTask(taskId())
  if (updated) toast.success(watching ? 'Unwatched' : 'Watching')
  else toast.error(error.value || 'Could not update watch')
}

async function onBlockers(payload: { blockedReason: string; blockedBy: string[] }): Promise<void> {
  const updated = await updateTask(taskId(), payload)
  if (updated) toast.success('Blockers updated')
  else toast.error(error.value || 'Could not update blockers')
}

async function onChecklist(items: ChecklistItem[]): Promise<void> {
  const updated = await updateTask(taskId(), { checklist: items })
  if (!updated) toast.error(error.value || 'Could not update checklist')
}

async function onDelete(): Promise<void> {
  const ok = await deleteTask(taskId())
  confirming.value = false
  if (!ok) {
    toast.error(error.value || 'Could not delete the task')
    return
  }
  toast.success('Task deleted')
  await router.push('/tasks')
}
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
            <div v-if="selectedTask.externalUrl">
              <dt class="text-label text-muted">External link</dt>
              <dd class="mt-1">
                <a class="text-primary" :href="selectedTask.externalUrl" target="_blank" rel="noopener noreferrer">
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
                  v-if="selectedTask.externalUrl"
                  class="text-body text-primary"
                  :href="selectedTask.externalUrl"
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
