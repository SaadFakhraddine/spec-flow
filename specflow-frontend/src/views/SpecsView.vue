<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSpecs } from '@/composables/useSpecs'
import { PAGE_LIMIT } from '@/types'
import { formatDate } from '@/utils/format'
import { specBorder, specStatusLabel } from '@/utils/status'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import Pagination from '@/components/ui/Pagination.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'

const router = useRouter()
const { user } = useAuth()
const { specs, total, currentPage, isLoading, error, fetchSpecs } = useSpecs()

function load(page = 1): void {
  void fetchSpecs(page)
}

onMounted(() => load(1))

function open(id: string): void {
  void router.push(`/specs/${id}`)
}
</script>

<template>
  <PageWrapper title="Specs">
    <template #actions>
      <Button v-if="user?.role === 'admin'" @click="router.push('/specs/new')">Create spec</Button>
    </template>
    <div v-if="error" class="mb-4">
      <p class="text-body text-danger">{{ error }}</p>
      <Button class="mt-2" variant="secondary" @click="load(currentPage)">Retry</Button>
    </div>
    <LoadingSkeleton v-if="isLoading" />
    <EmptyState v-else-if="total === 0" title="No specs yet" message="A spec is the agreement before the tasks. Admins can write the first one.">
      <Button v-if="user?.role === 'admin'" @click="router.push('/specs/new')">Create spec</Button>
    </EmptyState>
    <table v-else class="w-full border-collapse text-left">
      <thead>
        <tr class="text-label text-muted">
          <th class="px-3 py-2 font-normal">Title</th>
          <th class="px-3 py-2 font-normal">Status</th>
          <th class="px-3 py-2 font-normal">Task count</th>
          <th class="px-3 py-2 font-normal">Created by</th>
          <th class="px-3 py-2 font-normal">Created date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="spec in specs" :key="spec.id" tabindex="0" class="cursor-pointer border-b border-l-2 border-line motion-color hover:bg-surface" :class="specBorder[spec.status]" @click="open(spec.id)" @keydown.enter="open(spec.id)">
          <td class="px-3 py-3 text-body">{{ spec.title }}</td>
          <td class="px-3 py-3 text-body text-muted">{{ specStatusLabel[spec.status] }}</td>
          <td class="px-3 py-3 font-mono text-label">{{ spec.taskCount }}</td>
          <td class="px-3 py-3 text-body">{{ spec.createdBy.name }}</td>
          <td class="px-3 py-3 font-mono text-label text-muted">{{ formatDate(spec.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
    <Pagination :page="currentPage" :total="total" :limit="PAGE_LIMIT" @change="load" />
  </PageWrapper>
</template>
