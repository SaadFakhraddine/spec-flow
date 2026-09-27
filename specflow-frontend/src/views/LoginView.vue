<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { fieldErrors, loginSchema, registerSchema } from '@/utils/validators'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'

const router = useRouter()
const { login, register, loading, error } = useAuth()
const mode = ref<'login' | 'register'>('login')
const form = reactive({ name: '', email: '', password: '' })
const errors = ref<Record<string, string>>({})

function clearField(field: 'name' | 'email' | 'password'): void {
  errors.value = { ...errors.value, [field]: '' }
  error.value = ''
}

async function onSubmit(): Promise<void> {
  const schema = mode.value === 'login' ? loginSchema : registerSchema
  errors.value = fieldErrors(schema, form)
  if (Object.values(errors.value).some(Boolean)) return
  const ok = mode.value === 'login'
    ? await login(form.email, form.password)
    : await register(form.name, form.email, form.password)
  if (ok) await router.push('/dashboard')
}
</script>

<template>
  <main class="min-h-screen bg-background px-8 py-16">
    <p class="font-mono text-body text-primary">SpecFlow</p>
    <h1 class="mt-6 text-title font-semibold">{{ mode === 'login' ? 'Sign in' : 'Create an account' }}</h1>
    <p class="mt-2 max-w-md text-body text-muted">
      Feature requests, technical specs, and the tasks that fall out of them.
    </p>
    <form class="mt-8 flex max-w-md flex-col gap-4" @submit.prevent="onSubmit">
      <Input v-if="mode === 'register'" id="name" v-model="form.name" label="Name" :error="errors.name" @update:model-value="clearField('name')" />
      <Input id="email" v-model="form.email" label="Email" type="email" :error="errors.email" @update:model-value="clearField('email')" />
      <Input id="password" v-model="form.password" label="Password" type="password" :error="errors.password" @update:model-value="clearField('password')" />
      <p v-if="error" class="text-body text-danger">{{ error }}</p>
      <Button type="submit" :loading="loading">{{ mode === 'login' ? 'Sign in' : 'Create account' }}</Button>
    </form>
    <button type="button" class="mt-6 text-body text-primary" @click="mode = mode === 'login' ? 'register' : 'login'">
      {{ mode === 'login' ? 'Create an account' : 'Already have an account? Sign in' }}
    </button>
  </main>
</template>
