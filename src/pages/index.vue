<template>
  <v-container class="container-dashboard py-6">
    <!-- Header -->
    <v-row class="align-center justify-space-between mb-4" no-gutters>
      <v-col cols="12" md="7">
        <div>
          <h1 class="text-h4 mb-1">Meu Dia</h1>
          <div class="text-body-2 text-muted">{{ todayLong }}</div>
        </div>
      </v-col>
      <v-col class="text-md-right mt-3 mt-md-0" cols="12" md="5">
        <v-btn
          v-if="!showQuick"
          class="shadow-soft"
          color="primary"
          prepend-icon="mdi-plus"
          @click="openQuick"
        >
          Captura Rápida
        </v-btn>
        <v-text-field
          v-else
          ref="quickInput"
          v-model="quickTitle"
          hide-details
          placeholder="Captura rápida..."
          prepend-inner-icon="mdi-plus"
          @blur="onQuickBlur"
          @keydown.enter="createQuickTask"
        />
      </v-col>
    </v-row>

    <!-- KPIs -->
    <v-row class="mb-6" dense>
      <v-col cols="12" md="3" sm="6">
        <v-card class="shadow-soft card-hover" rounded="lg">
          <v-card-item>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-2 text-muted mb-1">
                  Pomodoros Hoje
                </div>
                <div class="text-h5">{{ workPomosToday }}</div>
                <div class="text-caption text-muted">{{ focusLabel }}</div>
              </div>
              <v-avatar color="primary" size="36"
                ><v-icon>mdi-timer-sand</v-icon></v-avatar
              >
            </div>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="shadow-soft card-hover" rounded="lg">
          <v-card-item>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-2 text-muted mb-1">
                  Tarefas Concluídas
                </div>
                <div class="text-h5">{{ completedToday }}</div>
                <div class="text-caption text-muted">
                  de {{ plannedToday }} planejadas
                </div>
              </div>
              <v-avatar color="secondary" size="36"
                ><v-icon>mdi-check</v-icon></v-avatar
              >
            </div>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="shadow-soft card-hover" rounded="lg">
          <v-card-item>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-2 text-muted mb-1">
                  Taxa de Conclusão
                </div>
                <div class="text-h5">{{ completionRate }}%</div>
              </div>
              <v-avatar color="primary" size="36" variant="tonal"
                ><v-icon>mdi-progress-check</v-icon></v-avatar
              >
            </div>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="shadow-soft card-hover" rounded="lg">
          <v-card-item>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-2 text-muted mb-1">
                  Ciclos Concluídos
                </div>
                <div class="text-h5">{{ cyclesToday }}</div>
              </div>
              <v-avatar color="accent" size="36"
                ><v-icon>mdi-sync</v-icon></v-avatar
              >
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Content -->
    <v-row align="start" dense>
      <!-- Left / Tasks -->
      <v-col cols="12" lg="9" md="8">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center ga-2">
            <h2 class="text-subtitle-1 mr-2">Tarefas de Hoje</h2>
            <v-chip
              v-if="selectedTagFilterLabel"
              closable
              color="primary"
              size="small"
              variant="tonal"
              @click:close="clearTagFilter"
              >{{ selectedTagFilterLabel }}</v-chip
            >
          </div>
          <div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              variant="flat"
              @click="openTaskDialog()"
              >Nova Tarefa</v-btn
            >
          </div>
        </div>

        <div class="d-flex ga-2 mb-3">
          <v-text-field
            v-model="search"
            clearable
            placeholder="Buscar tarefas..."
            prepend-inner-icon="mdi-magnify"
          />
          <v-select v-model="selectedFilter" :items="filters" />
          <v-select v-model="dateSort" :items="dateSortItems" />
        </div>

        <v-card class="shadow-soft" rounded="lg">
          <template v-if="filteredTasks.length === 0">
            <v-card-text class="text-center py-12">
              <div class="mb-4 text-h6">Nenhuma tarefa ainda</div>
              <div class="text-body-2 text-muted mb-6">
                Comece criando sua primeira tarefa
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="openTaskDialog"
                >Criar primeira tarefa</v-btn
              >
            </v-card-text>
          </template>
          <template v-else>
            <v-list base-color="primary" lines="two">
              <v-list-item
                v-for="t in filteredTasks"
                :key="t.uuid"
                class="task-item"
                @click="toggleExpand(t.uuid)"
              >
                <template #prepend>
                  <v-checkbox-btn
                    color="primary"
                    :model-value="t.status === 'completed'"
                    @click.stop
                    @update:model-value="(v: any) => toggleTaskComplete(t, v)"
                  />
                </template>
                <v-list-item-title class="font-weight-medium">{{
                  t.title
                }}</v-list-item-title>
                <v-list-item-subtitle>{{ t.description }}</v-list-item-subtitle>
                <template #append>
                  <div class="d-flex align-center ga-2">
                    <v-chip
                      v-for="tg in t.tags"
                      :key="tg.id"
                      size="small"
                      variant="flat"
                      >{{ tg.label }}</v-chip
                    >
                    <v-btn
                      color="primary"
                      size="small"
                      variant="text"
                      @click.stop
                      >Iniciar</v-btn
                    >
                  </div>
                </template>

                <v-expand-transition>
                  <div v-if="expandedTask === t.uuid" class="px-4 pb-4 w-100">
                    <v-divider class="mb-3" />
                    <div class="d-flex align-center ga-3 flex-wrap">
                      <v-btn
                        prepend-icon="mdi-pencil"
                        size="small"
                        variant="text"
                        @click.stop="openTaskDialog(t)"
                        >Editar</v-btn
                      >
                      <v-btn
                        :prepend-icon="
                          t.status === 'completed' ? 'mdi-undo' : 'mdi-check'
                        "
                        size="small"
                        variant="text"
                        @click.stop="
                          toggleTaskComplete(t, t.status !== 'completed')
                        "
                        >{{
                          t.status === 'completed' ? 'Desfazer' : 'Concluir'
                        }}</v-btn
                      >
                      <v-btn
                        color="error"
                        prepend-icon="mdi-delete"
                        size="small"
                        variant="text"
                        @click.stop="deleteTaskAction(t)"
                        >Excluir</v-btn
                      >
                    </div>
                  </div>
                </v-expand-transition>
              </v-list-item>
            </v-list>
          </template>
        </v-card>
      </v-col>

      <!-- Right / Side cards -->
      <v-col cols="12" lg="3" md="4">
        <v-card class="mb-4 shadow-soft" rounded="lg">
          <v-card-title class="text-subtitle-1">Tarefas Atrasadas</v-card-title>
          <v-divider />
          <v-card-text>
            <div v-if="overdue.length === 0" class="text-body-2 text-muted">
              Sem tarefas atrasadas
            </div>
            <v-list v-else density="comfortable">
              <v-list-item v-for="t in overdue" :key="t.uuid">
                <v-list-item-title>{{ t.title }}</v-list-item-title>
                <v-list-item-subtitle>{{
                  toDate(t.dueDate)
                }}</v-list-item-subtitle>
                <template #append>
                  <v-btn color="secondary" size="small" variant="flat"
                    >Iniciar</v-btn
                  >
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-card class="shadow-soft" rounded="lg">
          <v-card-title class="text-subtitle-1">Dica do Dia</v-card-title>
          <v-divider />
          <v-card-text>
            Use a técnica Pomodoro: 25 minutos de foco seguidos de 5 minutos de
            pausa. Após 4 ciclos, faça uma pausa longa de 15-30 minutos.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="taskDialog" max-width="560">
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1">{{
          editingTask ? 'Editar Tarefa' : 'Nova Tarefa'
        }}</v-card-title>
        <v-divider />
        <v-card-text>
          <v-form ref="taskForm">
            <v-text-field
              v-model="newTask.title"
              clearable
              hide-details="auto"
              label="Título da Tarefa"
              placeholder="Ex: Implementar funcionalidade de login"
              :rules="[(v) => !!v || 'Obrigatório']"
            />

            <v-textarea
              v-model="newTask.description"
              auto-grow
              hide-details
              label="Descrição (opcional)"
              placeholder="Descreva os detalhes da tarefa..."
              rows="3"
            />

            <v-row class="mt-2" dense>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="selectedTag"
                  clearable
                  hide-details
                  item-title="title"
                  item-value="value"
                  :items="tagsOptions"
                  label="Lista"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-avatar
                          class="mr-3"
                          :color="item.raw.color"
                          size="12"
                        />
                      </template>
                      {{ item.raw.title }}
                    </v-list-item>
                  </template>
                  <template #selection="{ item }">
                    <div class="d-flex align-center">
                      <v-avatar
                        class="mr-2"
                        :color="item.raw.color"
                        size="10"
                      />
                      <span>{{ item.raw.title }}</span>
                    </div>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="priority"
                  hide-details
                  :items="priorityItems"
                  label="Prioridade"
                />
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newTask.due"
                  hide-details
                  label="Data de Vencimento (opcional)"
                  prepend-inner-icon="mdi-calendar"
                  type="date"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="estimate"
                  hide-details
                  label="Estimativa (Pomodoros)"
                  min="1"
                  prepend-inner-icon="mdi-timer-outline"
                  type="number"
                />
              </v-col>
            </v-row>

            <v-combobox
              v-model="tagsInput"
              chips
              hide-details
              :items="tagTitles"
              label="Tags"
              multiple
              placeholder="Adicionar tag..."
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="closeTaskDialog">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="editingTask ? updateTaskAction() : createTaskAction()"
            >{{ editingTask ? 'Salvar' : 'Criar Tarefa' }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { backend } from '@/mock/backend'

interface TaskTag {
  id: string
  label: string
}
interface Task {
  uuid: string
  title: string
  description: string
  dueDate: string
  tags: TaskTag[]
  status: 'todo' | 'in-progress' | 'completed' | 'pause-break'
}
interface Pause {
  startedAt: string
  endedAt: string
}
interface Pomo {
  uuid: string
  startAt: string
  endAt: string
  pauses: Pause[]
  cicle: number
  type: 'work' | 'short-break' | 'long-break'
}
interface Tag {
  uuid: string
  label: string
  color: string
}

const tasks = ref<Task[]>([])
const pomos = ref<Pomo[]>([])
const quickTitle = ref('')
const showQuick = ref(false)
const quickInput = ref()
const tagsAll = ref<Tag[]>([])
const selectedTag = ref<string | null>(null)
const tagsOptions = computed(() =>
  tagsAll.value.map((t) => ({ value: t.uuid, title: t.label, color: t.color }))
)
const priorityItems = ['Baixa', 'Média', 'Alta']
const priority = ref('Média')
const estimate = ref(1)
const tagsInput = ref<string[]>([])
const tagTitles = computed(() => tagsAll.value.map((t) => t.label))

onMounted(async () => {
  tasks.value = await backend.getTasks()
  pomos.value = await backend.getPomos()
  tagsAll.value = await backend.getTags()
})

const today = new Date()
const todayLong = computed(() =>
  today.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
)

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function minutesBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 60_000))
}

function toDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

const tasksToday = computed(() =>
  tasks.value.filter((t) => isSameDay(new Date(t.dueDate), today))
)
const plannedToday = computed(() => tasksToday.value.length)
const completedToday = computed(
  () => tasksToday.value.filter((t) => t.status === 'completed').length
)
const completionRate = computed(() =>
  plannedToday.value === 0
    ? 0
    : Math.round((completedToday.value / plannedToday.value) * 100)
)

const pomosToday = computed(() =>
  pomos.value.filter((p) => isSameDay(new Date(p.startAt), today))
)
const workPomosToday = computed(
  () => pomosToday.value.filter((p) => p.type === 'work').length
)
const focusMinutes = computed(() =>
  pomosToday.value
    .filter((p) => p.type === 'work')
    .reduce((sum, p) => {
      const total = minutesBetween(new Date(p.startAt), new Date(p.endAt))
      const pauses = p.pauses.reduce(
        (acc, s) =>
          acc + minutesBetween(new Date(s.startedAt), new Date(s.endedAt)),
        0
      )
      return sum + Math.max(0, total - pauses)
    }, 0)
)
const focusLabel = computed(() => {
  const h = Math.floor(focusMinutes.value / 60)
  const m = focusMinutes.value % 60
  if (h > 0) return `${h}h ${m}m de foco`
  return `${m}m de foco`
})
const cyclesToday = computed(() =>
  Math.max(0, ...pomosToday.value.map((p) => p.cicle))
)

const overdue = computed(() =>
  tasks.value
    .filter((t) => new Date(t.dueDate) < new Date() && t.status !== 'completed')
    .slice(0, 5)
)

// Filters
const search = ref('')
const selectedFilter = ref('Todas')
const dateSort = ref('Data de vencimento')
const filters = [
  'Todas',
  'Abertas',
  'Concluídas',
  'Atrasadas',
  'Alta prioridade',
]
const dateSortItems = ['Data de vencimento', 'Título']

const route = useRoute()
const router = useRouter()
const selectedTagFilter = ref<string | null>(null)
const selectedView = ref<'today' | 'overdue' | 'upcoming' | null>(null)
const selectedTagFilterLabel = computed(() => {
  if (!selectedTagFilter.value) return ''
  const all = tagsAll.value || []
  const t = all.find((x) => x.uuid === selectedTagFilter.value)
  return t?.label || ''
})

watch(
  () => route.query.tag,
  (tg) => {
    selectedTagFilter.value = typeof tg === 'string' ? tg : null
  },
  { immediate: true }
)
watch(
  () => route.query.view,
  (v) => {
    selectedView.value =
      v === 'today' || v === 'overdue' || v === 'upcoming' ? v : null
  },
  { immediate: true }
)

function clearTagFilter() {
  router.replace({ query: { ...route.query, tag: undefined } })
}

const baseTasks = computed(() => {
  switch (selectedView.value) {
    case 'overdue': {
      return tasks.value.filter(
        (t) => new Date(t.dueDate) < new Date() && t.status !== 'completed'
      )
    }
    case 'upcoming': {
      return tasks.value.filter((t) => new Date(t.dueDate) > new Date())
    }
    case 'today':
    default: {
      return tasksToday.value
    }
  }
})

const filteredTasks = computed(() => {
  let data = baseTasks.value.slice()

  if (selectedTagFilter.value) {
    data = data.filter((t) =>
      t.tags.some((tt) => tt.id === selectedTagFilter.value)
    )
  }

  switch (selectedFilter.value) {
    case 'Abertas': {
      data = data.filter((t) => t.status !== 'completed')
      break
    }
    case 'Concluídas': {
      data = data.filter((t) => t.status === 'completed')
      break
    }
    case 'Atrasadas': {
      data = data.filter(
        (t) => new Date(t.dueDate) < new Date() && t.status !== 'completed'
      )
      break
    }
    case 'Alta prioridade': {
      data = data.filter((t) =>
        t.tags.some((tg) => /(high|importante|prioridade)/i.test(tg.label))
      )
      break
    }
  }

  if (search.value) {
    const q = search.value.toLowerCase()
    data = data.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    )
  }

  if (dateSort.value === 'Título') {
    data.sort((a, b) => a.title.localeCompare(b.title))
  } else {
    data.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
  }

  return data
})

const taskDialog = ref(false)
const taskForm = ref()
const newTask = ref({ title: '', description: '', due: defaultLocalDateTime() })
const editingTask = ref<Task | null>(null)
const expandedTask = ref<string | null>(null)

function defaultLocalDateTime() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
function toLocalInput(iso: string) {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

async function openTaskDialog(t?: Task) {
  tagsAll.value = await backend.getTags()
  if (t) {
    editingTask.value = t
    newTask.value = {
      title: t.title,
      description: t.description,
      due: toLocalInput(t.dueDate),
    }
    selectedTag.value = t.tags[0]?.id || null
  } else {
    editingTask.value = null
    newTask.value = { title: '', description: '', due: defaultLocalDateTime() }
    selectedTag.value = selectedTagFilter.value || null
  }
  taskDialog.value = true
}
function closeTaskDialog() {
  taskDialog.value = false
}

async function createTaskAction() {
  if (!newTask.value.title) return
  const iso = new Date(newTask.value.due).toISOString()
  const tagArr: TaskTag[] = selectedTag.value
    ? (() => {
        const t = tagsAll.value.find((x) => x.uuid === selectedTag.value)!
        return [{ id: t.uuid, label: t.label }]
      })()
    : []
  await backend.createTask({
    title: newTask.value.title,
    description: newTask.value.description,
    dueDate: iso,
    appointments: [],
    tags: tagArr,
    status: 'todo',
  })
  tasks.value = await backend.getTasks()
  taskDialog.value = false
  newTask.value = { title: '', description: '', due: defaultLocalDateTime() }
  selectedTag.value = null
  editingTask.value = null
}

async function updateTaskAction() {
  if (!editingTask.value) return
  if (!newTask.value.title) return
  const iso = new Date(newTask.value.due).toISOString()
  const tagArr: TaskTag[] = selectedTag.value
    ? (() => {
        const t = tagsAll.value.find((x) => x.uuid === selectedTag.value)!
        return [{ id: t.uuid, label: t.label }]
      })()
    : []
  const updated = await backend.updateTask(editingTask.value.uuid, {
    title: newTask.value.title,
    description: newTask.value.description,
    dueDate: iso,
    tags: tagArr,
  })
  if (updated) {
    const idx = tasks.value.findIndex((x) => x.uuid === editingTask.value?.uuid)
    if (idx !== -1) tasks.value[idx] = updated
  }
  taskDialog.value = false
  newTask.value = { title: '', description: '', due: defaultLocalDateTime() }
  selectedTag.value = null
  editingTask.value = null
}

function toggleExpand(id: string) {
  expandedTask.value = expandedTask.value === id ? null : id
}

async function toggleTaskComplete(t: Task, value: boolean) {
  const nextStatus: Task['status'] = value ? 'completed' : 'todo'
  const updated = await backend.updateTask(t.uuid, { status: nextStatus })
  if (updated) {
    const idx = tasks.value.findIndex((x) => x.uuid === t.uuid)
    if (idx !== -1) tasks.value[idx] = updated
  }
}

async function deleteTaskAction(t: Task) {
  const ok = confirm('Excluir esta tarefa?')
  if (!ok) return
  await backend.deleteTask(t.uuid)
  tasks.value = tasks.value.filter((x) => x.uuid !== t.uuid)
  if (expandedTask.value === t.uuid) expandedTask.value = null
}

function openQuick() {
  showQuick.value = true
  nextTick(() => quickInput.value?.focus?.())
}
function onQuickBlur() {
  if (!quickTitle.value) showQuick.value = false
}

async function createQuickTask() {
  if (!quickTitle.value.trim()) return
  const tagArr: TaskTag[] = selectedTagFilter.value
    ? (() => {
        const t = tagsAll.value.find((x) => x.uuid === selectedTagFilter.value)
        return t ? [{ id: t.uuid, label: t.label }] : []
      })()
    : []
  await backend.createTask({
    title: quickTitle.value.trim(),
    description: '',
    dueDate: new Date().toISOString(),
    appointments: [],
    tags: tagArr,
    status: 'todo',
  })
  tasks.value = await backend.getTasks()
  quickTitle.value = ''
  showQuick.value = false
}
</script>

<style scoped>
.task-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.task-item:last-child {
  border-bottom: 0;
}
.text-md-right {
  text-align: right;
}
@media (max-width: 960px) {
  .text-md-right {
    text-align: left;
  }
}
</style>
