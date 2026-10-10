<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSpecs } from '@/composables/useSpecs'
import { useToast } from '@/composables/useToast'
import type { Spec, SpecFilters, SpecStatus } from '@/types'
import { PAGE_LIMIT } from '@/types'
import { formatDate } from '@/utils/format'
import { specBorder, specStatusLabel, specStatuses } from '@/utils/status'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import Input from '@/components/ui/Input.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Select from '@/components/ui/Select.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import SpecCoverageChip from '@/components/features/SpecCoverageChip.vue'
import SpecPipeline from '@/components/features/SpecPipeline.vue'

type SpecsViewMode = 'pipeline' | 'table'

const SEARCH_DEBOUNCE_MS = 300

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { user } = useAuth()
const { specs, total, currentPage, isLoading, error, fetchSpecs, fetchPipeline, exportCsv } =
  useSpecs()

const filters = ref<SpecFilters>({
  status: typeof route.query.status === 'string' ? route.query.status : '',
  q: '',
  needsTasks: false,
})
const searchQ = ref('')
const archiveMode = ref('active')
let searchTimer: ReturnType<typeof setTimeout> | null = null
let suppressWatch = false

const view = computed<SpecsViewMode>(() =>
  route.query.view === 'table' ? 'table' : 'pipeline',
)

const statusOptions = [
  { value: '', label: 'All statuses' },
  ...specStatuses.map((value) => ({ value, label: specStatusLabel[value] })),
]
const archiveOptions = [
  { value: 'active', label: 'Active' },
  { value: 'include', label: 'Include archived' },
  { value: 'only', label: 'Archived only' },
]

const hasFilters = computed(() =>
  Boolean(
    filters.value.status ||
      filters.value.q ||
      filters.value.needsTasks ||
      archiveMode.value !== 'active',
  ),
)

const pipelineColumns = computed(() => {
  const columns = Object.fromEntries(specStatuses.map((status) => [status, [] as Spec[]])) as Record<
    SpecStatus,
    Spec[]
  >
  for (const spec of specs.value) {
    columns[spec.status]?.push(spec)
  }
  return columns
})

const inReviewActive = computed(() => filters.value.status === 'in-review')
const needsTasksActive = computed(() => Boolean(filters.value.needsTasks))

function appliedFilters(): SpecFilters {
  return {
    status: filters.value.status,
    q: filters.value.q,
    needsTasks: filters.value.needsTasks,
    includeArchived: archiveMode.value === 'include',
    archivedOnly: archiveMode.value === 'only',
  }
}

function load(page = 1): void {
  const next = appliedFilters()
  if (view.value === 'pipeline') void fetchPipeline(next)
  else void fetchSpecs(page, next)
}

function setView(next: SpecsViewMode): void {
  if (view.value === next) return
  void router.replace({ query: { ...route.query, view: next } })
}

function toggleInReview(): void {
  filters.value.status = inReviewActive.value ? '' : 'in-review'
}

function toggleNeedsTasks(): void {
  filters.value.needsTasks = !needsTasksActive.value
}

watch(searchQ, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (filters.value.q === value) return
    filters.value.q = value
  }, SEARCH_DEBOUNCE_MS)
})

watch(
  [filters, archiveMode, view],
  () => {
    if (suppressWatch) return
    load(1)
  },
  { deep: true },
)

onMounted(async () => {
  suppressWatch = true
  if (!route.query.view) {
    await router.replace({ query: { ...route.query, view: 'pipeline' } })
  }
  load(1)
  suppressWatch = false
})

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

function open(id: string): void {
  void router.push(`/specs/${id}`)
}

async function onExport(): Promise<void> {
  const blob = await exportCsv(appliedFilters())
  if (!blob) {
    toast.error(error.value || 'Could not export specs')
    return
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'specs.csv'
  link.click()
  URL.revokeObjectURL(url)
  toast.success('Export downloaded')
}
</script>

<template>
  <PageWrapper title="Specs" subtitle="Agreements before the work starts">
    <template #actions>
      <div class="flex rounded-md border border-line bg-elevated p-0.5">
        <button
          type="button"
          class="rounded px-3 py-1 text-body motion-color"
          :class="view === 'pipeline' ? 'bg-surface text-text' : 'text-muted'"
          @click="setView('pipeline')"
        >
          Pipeline
        </button>
        <button
          type="button"
          class="rounded px-3 py-1 text-body motion-color"
          :class="view === 'table' ? 'bg-surface text-text' : 'text-muted'"
          @click="setView('table')"
        >
          Table
        </button>
      </div>
      <Button variant="secondary" @click="onExport">Export CSV</Button>
      <Button v-if="user?.role === 'admin'" @click="router.push('/specs/new')">Create spec</Button>
    </template>

    <div class="mb-2 flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="sf-toolbar-control inline-flex items-center rounded-md border text-label motion-color"
        :class="
          inReviewActive
            ? 'border-primary bg-primary/15 text-primary'
            : 'border-line bg-elevated text-muted hover:border-primary/40 hover:text-text'
        "
        @click="toggleInReview"
      >
        In review
      </button>
      <button
        type="button"
        class="sf-toolbar-control inline-flex items-center rounded-md border text-label motion-color"
        :class="
          needsTasksActive
            ? 'border-primary bg-primary/15 text-primary'
            : 'border-line bg-elevated text-muted hover:border-primary/40 hover:text-text'
        "
        @click="toggleNeedsTasks"
      >
        Needs tasks
      </button>
    </div>

    <FilterBar>
      <div class="min-w-[12rem] flex-1">
        <Input
          id="spec-q"
          v-model="searchQ"
          label="Search"
          placeholder="Title, goal, approach…"
        />
      </div>
      <div class="w-44">
        <Select id="spec-filter-status" v-model="filters.status!" label="Status" :options="statusOptions" />
      </div>
      <div class="w-48">
        <Select id="spec-filter-archive" v-model="archiveMode" label="Archive" :options="archiveOptions" />
      </div>
    </FilterBar>

    <div v-if="error" class="mb-4">
      <p class="text-body text-danger">{{ error }}</p>
      <Button class="mt-2" variant="secondary" @click="load(currentPage)">Retry</Button>
    </div>
    <LoadingSkeleton v-if="isLoading" />
    <EmptyState
      v-else-if="total === 0"
      :title="hasFilters ? 'No specs match' : 'No specs yet'"
      :message="
        hasFilters
          ? 'Clear the filters or write a new spec.'
          : 'A spec is the agreement before the tasks.'
      "
    >
      <Button v-if="user?.role === 'admin' && !hasFilters" @click="router.push('/specs/new')">
        Create spec
      </Button>
    </EmptyState>

    <SpecPipeline v-else-if="view === 'pipeline'" :columns="pipelineColumns" @open="open" />

    <template v-else>
      <div class="sf-panel overflow-hidden">
        <table class="sf-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Coverage</th>
              <th>Created by</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="spec in specs"
              :key="spec.id"
              tabindex="0"
              class="cursor-pointer border-l-2"
              :class="specBorder[spec.status]"
              @click="open(spec.id)"
              @keydown.enter="open(spec.id)"
            >
              <td>
                {{ spec.title }}
                <span v-if="spec.archivedAt" class="sf-chip ml-2 bg-elevated text-muted">Archived</span>
              </td>
              <td class="text-muted">{{ specStatusLabel[spec.status] }}</td>
              <td>
                <SpecCoverageChip :task-count="spec.taskCount" :tasks-done="spec.tasksDone" />
              </td>
              <td>{{ spec.createdBy.name }}</td>
              <td class="font-mono text-label text-muted">{{ formatDate(spec.updatedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination :page="currentPage" :total="total" :limit="PAGE_LIMIT" @change="load" />
    </template>
  </PageWrapper>
</template>
