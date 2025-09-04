<template>
  <div>
    <!-- Expanded bar -->
    <v-sheet
      v-if="expanded"
      class="pomobar shadow-soft"
      :color="barColor"
      elevation="2"
      rounded="lg"
    >
      <div class="d-flex align-center px-4 py-3">
        <v-chip
          class="mr-4"
          :color="pillColor"
          size="small"
          variant="elevated"
          >{{ pillText }}</v-chip
        >
        <div class="timer-mono text-h5 mr-6" :class="textColor">
          {{ timeText }}
        </div>
        <v-progress-linear
          bg-color="surface"
          class="flex-1 mr-6"
          :color="pillColor"
          height="6"
          :model-value="progress"
          rounded
        />

        <!-- Actions aligned to right like prototype -->
        <div class="d-flex align-center ga-2 ml-auto">
          <v-btn
            :color="pillColor"
            icon="mdi-plus"
            variant="text"
            @click="addMinute(1)"
          />
          <v-btn
            :color="pillColor"
            icon="mdi-minus"
            variant="text"
            @click="addMinute(-1)"
          />
          <v-btn
            :color="pillColor"
            icon="mdi-skip-next"
            variant="text"
            @click="skipSegment"
          />
          <v-btn
            :color="pillColor"
            icon="mdi-stop"
            variant="text"
            @click="stop"
          />
          <v-btn
            :color="pillColor"
            :prepend-icon="running ? 'mdi-pause' : 'mdi-play'"
            @click="toggleRun"
            >{{ running ? 'Pausar' : 'Iniciar' }}</v-btn
          >
        </div>
        <v-spacer />
        <v-btn
          append-icon="mdi-chevron-down"
          variant="text"
          @click="expanded = false"
          >Minimizar</v-btn
        >
      </div>
    </v-sheet>

    <!-- Minimized bar -->
    <v-sheet v-else class="pomobar-min shadow-soft" elevation="2" rounded="lg">
      <div class="d-flex align-center px-4 py-2">
        <v-chip
          class="mr-3"
          :color="pillColor"
          size="x-small"
          variant="elevated"
          >{{ pillShort }}</v-chip
        >
        <div class="timer-mono text-subtitle-1 mr-3" :class="textColor">
          {{ timeText }}
        </div>
        <v-progress-linear
          bg-color="surface"
          class="flex-1 mr-4"
          :color="pillColor"
          height="4"
          :model-value="progress"
          rounded
        />
        <v-btn
          :color="pillColor"
          :icon="running ? 'mdi-pause' : 'mdi-play'"
          variant="text"
          @click="toggleRun"
        />
        <v-btn
          :color="pillColor"
          icon="mdi-skip-next"
          variant="text"
          @click="skipSegment"
        />
        <v-btn
          append-icon="mdi-chevron-right"
          variant="text"
          @click="expanded = true"
          >Expandir</v-btn
        >
      </div>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { backend } from '@/mock/backend'

// Durations (seconds)
const DUR = { work: 25 * 60, short: 5 * 60, long: 15 * 60 }

const expanded = ref(true)
const running = ref(false)
const mode = ref<'work' | 'short' | 'long'>('work')
const cycle = ref(1)
const remaining = ref(DUR.work)
let ticker: number | null = null

// Audio for end sound
let audioCtx: AudioContext | null = null
function ensureAudio() {
  try {
    if (!audioCtx)
      audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume()
  } catch {}
}
function playEndSound() {
  ensureAudio()
  if (!audioCtx) return
  const ctx = audioCtx
  const now = ctx.currentTime
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.connect(ctx.destination)
  const pattern = mode.value === 'work' ? [880, 988, 1046] : [523, 440, 349]
  const toneDur = 0.16
  const gap = 0.05
  for (const [i, f] of pattern.entries()) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(f, now + i * (toneDur + gap))
    osc.connect(gain)
    gain.gain.exponentialRampToValueAtTime(
      0.6,
      now + i * (toneDur + gap) + 0.02
    )
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + (i + 1) * (toneDur + gap) - gap
    )
    osc.start(now + i * (toneDur + gap))
    osc.stop(now + i * (toneDur + gap) + toneDur)
  }
}

// Notification support
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function showNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    const title = mode.value === 'work'
      ? '🍅 Pomodoro Concluído!'
      : '⏰ Pausa Finalizada!'

    const message = mode.value === 'work'
      ? `Foco de 25 minutos concluído! Hora da pausa.`
      : `Pausa finalizada! Hora de voltar ao trabalho.`

    new Notification(title, {
      body: message,
      icon: '/favicon.svg',
      requireInteraction: true,
      tag: 'pomodoro-timer'
    })
  }
}

// Segment tracking for persistence
const segmentStart = ref<Date | null>(null)
const pauseStart = ref<Date | null>(null)
const pauses = ref<{ startedAt: string; endedAt: string }[]>([])

const STORAGE_KEY = 'td_timer_state'

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      expanded: expanded.value,
      running: running.value,
      mode: mode.value,
      cycle: cycle.value,
      remaining: remaining.value,
    })
  )
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const s = JSON.parse(raw)
    expanded.value = !!s.expanded
    running.value = !!s.running
    mode.value = s.mode || 'work'
    cycle.value = s.cycle || 1
    remaining.value = typeof s.remaining === 'number' ? s.remaining : DUR.work
  } catch {}
}

onMounted(() => {
  load()
  if (running.value) start()
  requestNotificationPermission()
})

onBeforeUnmount(() => stopTicker())

watch([expanded, running, mode, cycle, remaining], save, { deep: true })

function ensureSegmentStart() {
  if (!segmentStart.value) segmentStart.value = new Date()
}

function start() {
  stopTicker()
  ensureSegmentStart()
  ensureAudio()
  if (pauseStart.value) {
    // closing a pause window
    pauses.value.push({
      startedAt: pauseStart.value.toISOString(),
      endedAt: new Date().toISOString(),
    })
    pauseStart.value = null
  }
  running.value = true
  ticker = window.setInterval(() => {
    remaining.value = Math.max(0, remaining.value - 1)
    if (remaining.value === 0) {
      completeSegment()
    }
  }, 1000)
}
function stopTicker() {
  if (ticker) {
    clearInterval(ticker)
    ticker = null
  }
}
function pause() {
  if (!pauseStart.value) pauseStart.value = new Date()
  running.value = false
  stopTicker()
}
function toggleRun() {
  running.value ? pause() : start()
}

async function persistCurrentSegment() {
  if (!segmentStart.value) return
  const end = new Date()
  const type =
    mode.value === 'work'
      ? 'work'
      : mode.value === 'short'
        ? 'short-break'
        : 'long-break'
  await backend.createPomo({
    startAt: segmentStart.value.toISOString(),
    endAt: end.toISOString(),
    pauses: pauses.value.slice(),
    cicle: cycle.value,
    type,
  })
}

async function completeSegment() {
  pause()
  playEndSound()
  showNotification()
  await persistCurrentSegment()
  // prepare next segment
  segmentStart.value = null
  pauses.value = []
  pauseStart.value = null

  if (mode.value === 'work') {
    cycle.value = (cycle.value % 4) + 1
    mode.value = cycle.value === 1 ? 'long' : 'short'
    remaining.value = mode.value === 'long' ? DUR.long : DUR.short
  } else {
    mode.value = 'work'
    remaining.value = DUR.work
  }
}

function stop() {
  pause()
  // reset current segment but do not change mode
  segmentStart.value = null
  pauses.value = []
  pauseStart.value = null
  remaining.value =
    mode.value === 'work'
      ? DUR.work
      : mode.value === 'short'
        ? DUR.short
        : DUR.long
}

async function skipSegment() {
  await completeSegment()
}

function addMinute(delta: number) {
  remaining.value = Math.max(0, remaining.value + delta * 60)
}

const duration = computed(() =>
  mode.value === 'work'
    ? DUR.work
    : mode.value === 'short'
      ? DUR.short
      : DUR.long
)
const progress = computed(() =>
  Math.round((1 - remaining.value / duration.value) * 100)
)
const timeText = computed(() => {
  const m = Math.floor(remaining.value / 60)
    .toString()
    .padStart(2, '0')
  const s = Math.floor(remaining.value % 60)
    .toString()
    .padStart(2, '0')
  return `${m}:${s}`
})

const pillText = computed(() =>
  mode.value === 'work'
    ? `Foco • Ciclo ${cycle.value}/4`
    : mode.value === 'short'
      ? 'Pausa Curta'
      : 'Pausa Longa'
)
const pillShort = computed(() =>
  mode.value === 'work'
    ? 'Foco'
    : mode.value === 'short'
      ? 'Pausa Curta'
      : 'Pausa Longa'
)
const pillColor = computed(() =>
  mode.value === 'work' ? 'primary' : 'secondary'
)
const barColor = computed(() => 'surface')
const textColor = computed(() =>
  mode.value === 'work' ? 'text-primary' : 'text-secondary'
)
</script>

<style scoped>
.pomobar {
  position: fixed;
  left: 8px;
  right: 8px;
  bottom: 8px;
  background: #fff;
  z-index: 2001;
}
.pomobar-min {
  position: fixed;
  left: 8px;
  right: 8px;
  bottom: 8px;
  background: #fff;
  z-index: 2001;
}
.text-primary {
  color: #2d7d32;
}
.text-secondary {
  color: #df6813;
}
</style>
