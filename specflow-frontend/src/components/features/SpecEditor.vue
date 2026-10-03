<script setup lang="ts">
import type { SpecForm, SpecStatus } from '@/types'
import { specStatuses, specStatusLabel } from '@/utils/status'
import Select from '@/components/ui/Select.vue'
import StringList from './StringList.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  modelValue: SpecForm
  errors: Record<string, string>
  submitting?: boolean
  submitLabel: string
}>()
const emit = defineEmits<{ 'update:modelValue': [SpecForm]; submit: []; cancel: [] }>()
const statusOptions = specStatuses.map((value) => ({ value, label: specStatusLabel[value] }))

function patch<K extends keyof SpecForm>(key: K, value: SpecForm[K]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <form class="relative flex max-w-3xl flex-col gap-5 pb-20" @submit.prevent="emit('submit')">
    <div class="sf-panel space-y-5 p-5">
      <Input
        id="spec-title"
        :model-value="modelValue.title"
        label="Title"
        :error="errors.title"
        @update:model-value="patch('title', $event)"
      />
      <Select
        id="spec-status"
        :model-value="modelValue.status"
        label="Status"
        :options="statusOptions"
        @update:model-value="patch('status', $event as SpecStatus)"
      />
      <Textarea
        id="spec-goal"
        :model-value="modelValue.businessGoal"
        label="Business goal"
        :max="1000"
        :error="errors.businessGoal"
        @update:model-value="patch('businessGoal', $event)"
      />
      <Textarea
        id="spec-approach"
        :model-value="modelValue.technicalApproach"
        label="Technical approach"
        :max="5000"
        :error="errors.technicalApproach"
        @update:model-value="patch('technicalApproach', $event)"
      />
      <Textarea
        id="spec-api"
        :model-value="modelValue.apiDesign"
        label="API design"
        :max="3000"
        @update:model-value="patch('apiDesign', $event)"
      />
      <StringList
        label="Edge cases"
        :model-value="modelValue.edgeCases"
        :error="errors.edgeCases"
        @update:model-value="patch('edgeCases', $event)"
      />
      <StringList
        label="Acceptance criteria"
        :model-value="modelValue.acceptanceCriteria"
        :error="errors.acceptanceCriteria"
        @update:model-value="patch('acceptanceCriteria', $event)"
      />
      <Textarea
        id="spec-risks"
        :model-value="modelValue.regressionRisks"
        label="Regression risks"
        :max="1000"
        @update:model-value="patch('regressionRisks', $event)"
      />
    </div>
    <div
      class="sticky bottom-0 z-10 -mx-1 flex justify-end gap-2 border-t border-line bg-background/95 px-1 py-3 backdrop-blur"
    >
      <Button variant="ghost" type="button" @click="emit('cancel')">Cancel</Button>
      <Button type="submit" :loading="submitting">{{ submitLabel }}</Button>
    </div>
  </form>
</template>
