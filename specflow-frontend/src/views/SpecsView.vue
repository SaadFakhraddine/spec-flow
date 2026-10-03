<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSpecs } from '@/composables/useSpecs'
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

const router = useRouter()
const { user } = useAuth()
const { specs, total, currentPage, isLoading, error, fetchSpecs } = useSpecs()
const filters = ref<SpecFilters>({ status: '', q: '' })

const statusOptions = [
  { value: '', label: 'All statuses' },
  ...specStatuses.map((value) => ({ value, label: specStatusLabel[value] })),
]
const hasFilters = computed(() => Boolean(filters.value.status || filters.value.q))

function load(page = 1): void {
  void fetchSpecs(page, filters.value)
}

onMounted(() => load(1))
watch(filters, () => load(1), { deep: true })

function open(id: string): void {
  void router.push(`/specs/${id}`)
}
</script>

<template>
  <PageWrapper title="Specs" subtitle="Agreements before the work starts">
    <template #actions>
      <Button v-if="user?.role === 'admin'" @click="router.push('/specs/new')">Create spec</Button>
    </template>
    <FilterBar>
      <div class="min-w-[12rem] flex-1">
        <Input id="spec-q" v-model="filters.q!" label="Search" placeholder="Title contains…" />
      </div>
      <div class="w-44">
        <Select id="spec-filter-status" v-model="filters.status!" label="Status" :options="statusOptions" />
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
            <td>{{ spec.title }}</td>
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
