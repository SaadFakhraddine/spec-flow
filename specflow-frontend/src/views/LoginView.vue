<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { landingPath } from '@/utils/landing'
import { fieldErrors, loginSchema, registerSchema } from '@/utils/validators'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'

const router = useRouter()
const { login, register, loading, error, user } = useAuth()
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
  if (ok) await router.push(landingPath(user.value?.preferences?.defaults?.landingPage))
}
</script>

<template>
  <main class="relative flex min-h-screen items-center justify-center px-6 py-12">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div class="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-warning/5 blur-3xl" />
    </div>
    <div class="relative w-full max-w-md animate-sf-fade sf-panel p-8">
      <p class="font-mono text-section font-semibold text-primary">SpecFlow</p>
      <h1 class="mt-4 text-title font-semibold">
        {{ mode === 'login' ? 'Sign in' : 'Create an account' }}
      </h1>
      <p class="mt-2 text-body text-muted">
        Specs, tasks, and the path from request to done.
      </p>
      <form class="mt-8 flex flex-col gap-4" @submit.prevent="onSubmit">
        <Input
          v-if="mode === 'register'"
          id="name"
          v-model="form.name"
          label="Name"
          :error="errors.name"
          @update:model-value="clearField('name')"
        />
        <Input
          id="email"
          v-model="form.email"
          label="Email"
          type="email"
          :error="errors.email"
          @update:model-value="clearField('email')"
        />
        <Input
          id="password"
          v-model="form.password"
          label="Password"
          type="password"
          :error="errors.password"
          @update:model-value="clearField('password')"
        />
        <p v-if="error" class="text-body text-danger">{{ error }}</p>
        <Button type="submit" :loading="loading">
          {{ mode === 'login' ? 'Sign in' : 'Create account' }}
        </Button>
      </form>
      <button
        type="button"
        class="mt-6 text-body text-primary motion-color hover:brightness-110"
        @click="mode = mode === 'login' ? 'register' : 'login'"
      >
        {{ mode === 'login' ? 'Create an account' : 'Already have an account? Sign in' }}
      </button>
    </div>
  </main>
</template>
