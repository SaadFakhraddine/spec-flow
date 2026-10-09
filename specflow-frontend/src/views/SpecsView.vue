<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSpecs } from '@/composables/useSpecs'
import { useToast } from '@/composables/useToast'
import type { SpecFilters } from '@/types'
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

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { user } = useAuth()
const { specs, total, currentPage, isLoading, error, fetchSpecs, exportCsv } = useSpecs()

const filters = ref<SpecFilters>({
  status: typeof route.query.status === 'string' ? route.query.status : '',
  q: '',
  includeArchived: false,
  archivedOnly: false,
})

const statusOptions = [
  { value: '', label: 'All statuses' },
  ...specStatuses.map((value) => ({ value, label: specStatusLabel[value] })),
]
const archiveOptions = [
  { value: 'active', label: 'Active' },
  { value: 'include', label: 'Include archived' },
  { value: 'only', label: 'Archived only' },
]
const archiveMode = ref('active')
const hasFilters = computed(() =>
  Boolean(filters.value.status || filters.value.q || archiveMode.value !== 'active'),
)

function syncArchiveMode(): void {
  filters.value.includeArchived = archiveMode.value === 'include'
  filters.value.archivedOnly = archiveMode.value === 'only'
}

function load(page = 1): void {
  syncArchiveMode()
  void fetchSpecs(page, filters.value)
}

onMounted(() => load(1))
watch(filters, () => load(1), { deep: true })
watch(archiveMode, () => load(1))

function open(id: string): void {
  void router.push(`/specs/${id}`)
}

async function onExport(): Promise<void> {
  syncArchiveMode()
  const blob = await exportCsv(filters.value)
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
      <Button variant="secondary" @click="onExport">Export CSV</Button>
      <Button v-if="user?.role === 'admin'" @click="router.push('/specs/new')">Create spec</Button>
    </template>
    <FilterBar>
      <div class="min-w-[12rem] flex-1">
        <Input
          id="spec-q"
          v-model="filters.q!"
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
      :message="hasFilters ? 'Clear the filters or write a new spec.' : 'A spec is the agreement before the tasks.'"
    >
      <Button v-if="user?.role === 'admin' && !hasFilters" @click="router.push('/specs/new')">Create spec</Button>
    </EmptyState>
    <div v-else class="sf-panel overflow-hidden">
      <table class="sf-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Task count</th>
            <th>Created by</th>
            <th>Created date</th>
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
            <td class="font-mono text-label">{{ spec.taskCount }}</td>
            <td>{{ spec.createdBy.name }}</td>
            <td class="font-mono text-label text-muted">{{ formatDate(spec.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :page="currentPage" :total="total" :limit="PAGE_LIMIT" @change="load" />
  </PageWrapper>
</template>
