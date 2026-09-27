import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import TasksView from '@/views/TasksView.vue'
import CreateTaskForm from '@/components/features/CreateTaskForm.vue'
import { routes } from '@/router'
import { useAuthStore } from '@/stores/auth'

vi.mock('@/composables/useApi', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  requestRefresh: vi.fn().mockRejectedValue(new Error('no session')),
  registerAuthHandlers: vi.fn(),
}))

vi.mock('@/composables/useTasks', async () => {
  const { ref } = await import('vue')
  const task = {
    id: 't1',
    title: 'Ship auth',
    description: '',
    status: 'in-progress' as const,
    priority: 'high' as const,
    assignedTo: { id: '2', name: 'Dev', email: 'dev@specflow.dev' },
    createdBy: { id: '1', name: 'Ada', email: 'ada@specflow.dev' },
    specId: null,
    tags: [],
    dueDate: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-02T00:00:00.000Z',
  }
  return {
    useTasks: () => ({
      tasks: ref([task]),
      total: ref(1),
      currentPage: ref(1),
      isLoading: ref(false),
      error: ref(''),
      filters: ref({ status: 'in-progress', priority: '' }),
      fetchTasks: vi.fn(),
      createTask: vi.fn(),
    }),
  }
})

async function mountTasks() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/tasks')
  const auth = useAuthStore()
  auth.user = { id: '1', name: 'Ada', email: 'ada@specflow.dev', role: 'admin' }
  return mount(TasksView, { global: { plugins: [pinia, router] } })
}

describe('views', () => {
  it('shows a field error on the login form', async () => {
    setActivePinia(createPinia())
    const router = createRouter({ history: createMemoryHistory(), routes })
    const wrapper = mount(LoginView, { global: { plugins: [createPinia(), router] } })
    await wrapper.get('#email').setValue('nope')
    await wrapper.get('#password').setValue('Password1')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('Enter a valid email')
  })

  it('renders the task table', async () => {
    const wrapper = await mountTasks()
    expect(wrapper.text()).toContain('Ship auth')
    expect(wrapper.text()).toContain('Create task')
  })

  it('validates the create task form', async () => {
    const wrapper = mount(CreateTaskForm)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('Title is required')
  })
})
