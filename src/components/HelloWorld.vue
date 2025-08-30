<template>
  <v-container class="fill-height" max-width="900">
    <div>
      <v-img class="mb-4" height="150" src="@/assets/logo.png" />

      <div class="mb-8 text-center">
        <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>
        <h1 class="text-h2 font-weight-bold">Vuetify</h1>
      </div>

      <v-row>
        <v-col cols="12">
          <v-card
            class="py-4"
            color="surface-variant"
            image="https://cdn.vuetifyjs.com/docs/images/one/create/feature.png"
            prepend-icon="mdi-rocket-launch-outline"
            rounded="lg"
            variant="tonal"
          >
            <template #image>
              <v-img position="top right" />
            </template>

            <template #title>
              <h2 class="text-h5 font-weight-bold">Get started</h2>
            </template>

            <template #subtitle>
              <div class="text-subtitle-1">
                Change this page by updating
                <v-kbd>{{ `<HelloWorld />` }}</v-kbd> in
                <v-kbd>components/HelloWorld.vue</v-kbd>.
              </div>
            </template>
          </v-card>
        </v-col>

        <v-col v-for="link in links" :key="link.href" cols="6">
          <v-card
            append-icon="mdi-open-in-new"
            class="py-4"
            color="surface-variant"
            :href="link.href"
            :prepend-icon="link.icon"
            rel="noopener noreferrer"
            rounded="lg"
            :subtitle="link.subtitle"
            target="_blank"
            :title="link.title"
            variant="tonal"
          />
        </v-col>
      </v-row>

      <v-row class="mt-8">
        <v-col cols="12">
          <h2 class="text-h4 mb-4">Mock Data</h2>
        </v-col>

        <v-col cols="12">
          <v-card class="mb-4" color="primary" title="Tasks" variant="tonal">
            <v-card-text>
              <div
                v-for="task in tasks"
                :key="task.uuid"
                class="mb-4 pa-3 border rounded"
              >
                <div><strong>UUID:</strong> {{ task.uuid }}</div>
                <div><strong>Title:</strong> {{ task.title }}</div>
                <div><strong>Description:</strong> {{ task.description }}</div>
                <div>
                  <strong>Due Date:</strong>
                  {{ new Date(task.dueDate).toLocaleString() }}
                </div>
                <div>
                  <strong>Status:</strong>
                  <v-chip :color="getStatusColor(task.status)" size="small">{{
                    task.status
                  }}</v-chip>
                </div>
                <div>
                  <strong>Tags:</strong>
                  <v-chip
                    v-for="tag in task.tags"
                    :key="tag.id"
                    class="mr-1"
                    size="small"
                  >{{ tag.label }}</v-chip>
                </div>
                <div v-if="task.appointments.length > 0">
                  <strong>Appointments:</strong>
                  <div
                    v-for="apt in task.appointments"
                    :key="apt.pomoId"
                    class="ml-4"
                  >
                    • {{ new Date(apt.startedAt).toLocaleString() }} -
                    {{ new Date(apt.endedAt).toLocaleString() }} ({{
                      apt.pomoId
                    }})
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card class="mb-4" color="secondary" title="Pomos" variant="tonal">
            <v-card-text>
              <div
                v-for="pomo in pomos"
                :key="pomo.uuid"
                class="mb-4 pa-3 border rounded"
              >
                <div><strong>UUID:</strong> {{ pomo.uuid }}</div>
                <div>
                  <strong>Type:</strong>
                  <v-chip :color="getPomoTypeColor(pomo.type)" size="small">{{
                    pomo.type
                  }}</v-chip>
                </div>
                <div><strong>Cicle:</strong> {{ pomo.cicle }}</div>
                <div>
                  <strong>Start:</strong>
                  {{ new Date(pomo.startAt).toLocaleString() }}
                </div>
                <div>
                  <strong>End:</strong>
                  {{ new Date(pomo.endAt).toLocaleString() }}
                </div>
                <div v-if="pomo.pauses.length > 0">
                  <strong>Pauses:</strong>
                  <div
                    v-for="pause in pomo.pauses"
                    :key="pause.startedAt"
                    class="ml-4"
                  >
                    • {{ new Date(pause.startedAt).toLocaleString() }} -
                    {{ new Date(pause.endedAt).toLocaleString() }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card color="success" title="Tags" variant="tonal">
            <v-card-text>
              <div
                v-for="tag in tags"
                :key="tag.uuid"
                class="mb-4 pa-3 border rounded"
              >
                <div><strong>UUID:</strong> {{ tag.uuid }}</div>
                <div><strong>Label:</strong> {{ tag.label }}</div>
                <div>
                  <strong>Color:</strong>
                  <v-chip :color="tag.color" size="small">{{
                    tag.color
                  }}</v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { backend } from '@/mock/backend'

  const tasks = ref([])
  const pomos = ref([])
  const tags = ref([])

  onMounted(async () => {
    tasks.value = await backend.getTasks()
    pomos.value = await backend.getPomos()
    tags.value = await backend.getTags()
  })

  function getStatusColor (status: string) {
    switch (status) {
      case 'todo': {
        return 'grey'
      }
      case 'in-progress': {
        return 'orange'
      }
      case 'completed': {
        return 'green'
      }
      case 'pause-break': {
        return 'blue'
      }
      default: {
        return 'grey'
      }
    }
  }

  function getPomoTypeColor (type: string) {
    switch (type) {
      case 'work': {
        return 'red'
      }
      case 'short-break': {
        return 'orange'
      }
      case 'long-break': {
        return 'purple'
      }
      default: {
        return 'grey'
      }
    }
  }

  const links = [
    {
      href: 'https://vuetifyjs.com/',
      icon: 'mdi-text-box-outline',
      subtitle: 'Learn about all things Vuetify in our documentation.',
      title: 'Documentation',
    },
    {
      href: 'https://vuetifyjs.com/introduction/why-vuetify/#feature-guides',
      icon: 'mdi-star-circle-outline',
      subtitle: 'Explore available framework Features.',
      title: 'Features',
    },
    {
      href: 'https://vuetifyjs.com/components/all',
      icon: 'mdi-widgets-outline',
      subtitle: 'Discover components in the API Explorer.',
      title: 'Components',
    },
    {
      href: 'https://discord.vuetifyjs.com',
      icon: 'mdi-account-group-outline',
      subtitle: 'Connect with Vuetify developers.',
      title: 'Community',
    },
  ]
</script>
