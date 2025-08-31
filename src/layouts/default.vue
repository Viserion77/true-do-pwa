<template>
  <v-navigation-drawer
    v-model="drawer"
    class="pa-2"
    expand-on-hover
    :rail="!mdAndUp"
  >
    <div class="d-flex align-center mb-2 px-2">
      <v-img
        alt="TrueDo"
        class="mr-2"
        height="28"
        src="@/assets/logo-check.svg"
        width="28"
      />
      <div>
        <a
          class="text-subtitle-2 font-weight-medium text-decoration-none"
          href="http://true-do.com/"
          rel="noopener"
          target="_blank"
          >TrueDo</a
        >
        <div class="text-caption text-muted">Produtividade Inteligente</div>
      </div>
      <v-spacer />
      <v-btn
        class="d-none d-md-flex"
        icon="mdi-chevron-left"
        variant="text"
        @click="toggleRail"
      />
    </div>

    <v-divider class="mb-2" />

    <v-list density="comfortable" nav>
      <v-list-item
        :color="
          !$route.query.view && !$route.query.tag ? 'secondary' : undefined
        "
        prepend-icon="mdi-home-outline"
        :rounded="0"
        title="Meu Dia"
        to="/"
        :variant="!$route.query.view && !$route.query.tag ? 'flat' : 'plain'"
      >
        <template #append>
          <v-chip size="x-small">{{ todayCount }}</v-chip>
        </template>
      </v-list-item>
      <v-list-item
        disabled
        prepend-icon="mdi-calendar-blank-outline"
        :rounded="0"
        title="Calendário"
        variant="plain"
      />
      <v-list-item
        disabled
        prepend-icon="mdi-timer-outline"
        :rounded="0"
        title="Timer"
        variant="plain"
      />
      <v-list-item
        disabled
        prepend-icon="mdi-poll"
        :rounded="0"
        title="Relatórios"
        variant="plain"
      />
    </v-list>

    <v-list-subheader class="mt-4">FILTROS</v-list-subheader>
    <v-list density="comfortable" nav>
      <v-list-item
        :color="$route.query.view === 'today' ? 'secondary' : undefined"
        prepend-icon="mdi-filter-variant"
        :rounded="0"
        title="Hoje"
        :to="{ path: '/', query: { view: 'today', tag: $route.query.tag } }"
        :variant="$route.query.view === 'today' ? 'flat' : 'plain'"
      >
        <template #append
          ><v-chip size="x-small">{{ todayCount }}</v-chip></template
        >
      </v-list-item>
      <v-list-item
        :color="$route.query.view === 'overdue' ? 'secondary' : undefined"
        prepend-icon="mdi-label-outline"
        :rounded="0"
        title="Atrasadas"
        :to="{ path: '/', query: { view: 'overdue', tag: $route.query.tag } }"
        :variant="$route.query.view === 'overdue' ? 'flat' : 'plain'"
      >
        <template #append
          ><v-chip size="x-small">{{ overdueCount }}</v-chip></template
        >
      </v-list-item>
      <v-list-item
        :color="$route.query.view === 'upcoming' ? 'secondary' : undefined"
        prepend-icon="mdi-format-list-bulleted"
        :rounded="0"
        title="Próximas"
        :to="{ path: '/', query: { view: 'upcoming', tag: $route.query.tag } }"
        :variant="$route.query.view === 'upcoming' ? 'flat' : 'plain'"
      >
        <template #append
          ><v-chip size="x-small">{{ upcomingCount }}</v-chip></template
        >
      </v-list-item>
    </v-list>

    <div class="d-flex align-center justify-space-between mt-4 px-2 mb-1">
      <div class="text-caption text-medium-emphasis">LISTAS</div>
    </div>
    <v-list density="comfortable" nav>
      <v-list-item
        prepend-icon="mdi-plus"
        :rounded="0"
        title="Nova lista"
        variant="plain"
        @click="openTagDialog"
      />
      <v-divider class="my-1" />
      <v-list-item
        v-for="t in tagSummaries"
        :key="t.uuid"
        :color="$route.query.tag === t.uuid ? 'secondary' : undefined"
        :rounded="0"
        :title="t.label"
        :to="{ path: '/', query: { tag: t.uuid, view: $route.query.view } }"
        :variant="$route.query.tag === t.uuid ? 'flat' : 'plain'"
      >
        <template #prepend>
          <v-avatar class="mr-3" :color="t.color" size="8" />
        </template>
        <template #append>
          <div class="d-flex align-center ga-1">
            <v-chip size="x-small">{{ t.count }}</v-chip>
            <v-menu location="end">
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  class="mr-1"
                  icon="mdi-dots-vertical"
                  role="button"
                  tabindex="0"
                  @click.stop.prevent
                />
              </template>
              <v-list density="comfortable">
                <v-list-item
                  prepend-icon="mdi-pencil"
                  title="Editar"
                  @click.stop.prevent="openEditTagDialog(t)"
                />
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Excluir"
                  @click.stop.prevent="deleteTagAction(t)"
                />
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-list-item>
    </v-list>

    <v-dialog v-model="tagDialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1">{{
          editingTag ? 'Editar Lista' : 'Nova Lista'
        }}</v-card-title>
        <v-divider />
        <v-card-text>
          <v-form ref="tagForm">
            <v-text-field
              v-model="newTag.label"
              hide-details="auto"
              label="Nome"
              :rules="[(v) => !!v || 'Obrigatório']"
            />
            <div class="d-flex align-center">
              <v-text-field
                v-model="newTag.color"
                hide-details
                label="Cor"
                style="max-width: 140px"
                type="color"
              />
              <div class="ml-4 d-flex align-center">
                <v-avatar class="mr-2" :color="newTag.color" size="14" />
                <span class="text-caption">Prévia</span>
              </div>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="closeTagDialog">Cancelar</v-btn>
          <v-btn color="primary" @click="saveTagAction">{{
            editingTag ? 'Salvar' : 'Criar'
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>

  <v-main>
    <router-view />
  </v-main>

  <v-btn
    v-if="!drawer"
    :aria-label="'Abrir menu'"
    class="drawer-fab shadow-soft"
    color="primary"
    icon="mdi-menu"
    @click="drawer = true"
  />

  <PomodoroFooter />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
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
interface Tag {
  uuid: string
  label: string
  color: string
}

const { mdAndUp } = useDisplay()
const drawer = ref(true)

const tasks = ref<Task[]>([])
const tags = ref<Tag[]>([])

const tagDialog = ref(false)
const tagForm = ref()
const newTag = ref<{ label: string; color: string }>({
  label: '',
  color: '#3B82F6',
})
const editingTag = ref<Tag | null>(null)

onMounted(async () => {
  tasks.value = await backend.getTasks()
  tags.value = await backend.getTags()
})

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const today = new Date()
const todayCount = computed(
  () => tasks.value.filter((t) => isSameDay(new Date(t.dueDate), today)).length
)
const overdueCount = computed(
  () =>
    tasks.value.filter(
      (t) => new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length
)
const upcomingCount = computed(
  () => tasks.value.filter((t) => new Date(t.dueDate) > new Date()).length
)

const tagSummaries = computed(() =>
  tags.value.map((tag) => ({
    ...tag,
    count: tasks.value.filter((t) =>
      t.tags.some((tt) => tt.label === tag.label)
    ).length,
  }))
)

function toggleRail() {
  drawer.value = !drawer.value
}

function openTagDialog() {
  editingTag.value = null
  tagDialog.value = true
}
function closeTagDialog() {
  tagDialog.value = false
}

function openEditTagDialog(t: Tag) {
  editingTag.value = t
  newTag.value = { label: t.label, color: t.color }
  tagDialog.value = true
}

async function saveTagAction() {
  if (!newTag.value.label) return
  if (editingTag.value) {
    const updated = await backend.updateTag(editingTag.value.uuid, {
      label: newTag.value.label,
      color: newTag.value.color,
    })
    if (updated) {
      // cascade label change to tasks
      const affected = tasks.value.filter((task) =>
        task.tags.some((tt) => tt.id === updated.uuid)
      )
      for (const task of affected) {
        const nextTags = task.tags.map((tt) =>
          tt.id === updated.uuid ? { ...tt, label: updated.label } : tt
        )
        await backend.updateTask(task.uuid, { tags: nextTags as any })
      }
    }
  } else {
    await backend.createTag({
      label: newTag.value.label,
      color: newTag.value.color,
    })
  }
  tags.value = await backend.getTags()
  tasks.value = await backend.getTasks()
  newTag.value = { label: '', color: '#3B82F6' }
  editingTag.value = null
  tagDialog.value = false
}

async function deleteTagAction(t: Tag) {
  const ok = confirm('Excluir esta lista? As tarefas perderão essa etiqueta.')
  if (!ok) return
  await backend.deleteTag(t.uuid)
  // remove tag from tasks
  const affected = tasks.value.filter((task) =>
    task.tags.some((tt) => tt.id === t.uuid)
  )
  for (const task of affected) {
    const nextTags = task.tags.filter((tt) => tt.id !== t.uuid)
    await backend.updateTask(task.uuid, { tags: nextTags as any })
  }
  tags.value = await backend.getTags()
  tasks.value = await backend.getTasks()
}
</script>

<style scoped>
.drawer-fab {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 2000;
}
/* Remove default overlays/underlays that create gray backgrounds in drawer items */
:deep(.v-navigation-drawer .v-list-item__overlay),
:deep(.v-navigation-drawer .v-list-item__underlay) {
  background-color: transparent !important;
}
/* Make non-active items more visible */
:deep(
  .v-navigation-drawer
    .v-list
    .v-list-item.v-list-item--variant-plain
    .v-list-item-title
),
:deep(
  .v-navigation-drawer .v-list .v-list-item.v-list-item--variant-plain .v-icon
) {
  color: rgba(0, 0, 0, 0.87) !important;
  opacity: 1 !important;
}
</style>
