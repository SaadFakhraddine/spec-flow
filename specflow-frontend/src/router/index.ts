import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { decideRedirect, guardInput } from './guard'
import CreateSpecView from '@/views/CreateSpecView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import MyWorkView from '@/views/MyWorkView.vue'
import SettingsView from '@/views/SettingsView.vue'
import SpecDetailView from '@/views/SpecDetailView.vue'
import SpecsView from '@/views/SpecsView.vue'
import TaskDetailView from '@/views/TaskDetailView.vue'
import TasksView from '@/views/TasksView.vue'

export const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { public: true, blank: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },
  { path: '/my-work', name: 'my-work', component: MyWorkView },
  { path: '/tasks', name: 'tasks', component: TasksView },
  { path: '/tasks/:id', name: 'task-detail', component: TaskDetailView },
  { path: '/specs', name: 'specs', component: SpecsView },
  { path: '/specs/new', name: 'spec-new', component: CreateSpecView, meta: { admin: true } },
  { path: '/specs/:id', name: 'spec-detail', component: SpecDetailView },
  { path: '/settings', redirect: '/settings/appearance' },
  { path: '/settings/:section', name: 'settings', component: SettingsView },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView, meta: { public: true, blank: true } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) await auth.bootstrap()
  return decideRedirect(guardInput(to), { isAuthenticated: auth.isAuthenticated, role: auth.user?.role })
})
