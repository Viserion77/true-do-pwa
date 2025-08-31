import pomoData from './data/pomo.json'
import tagsData from './data/tags.json'
import tasksData from './data/tasks.json'

interface Appointment {
  startedAt: string
  endedAt: string
  pomoId: string
}

interface TaskTag {
  id: string
  label: string
}

type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'pause-break'

interface Task {
  uuid: string
  title: string
  description: string
  dueDate: string
  appointments: Appointment[]
  tags: TaskTag[]
  status: TaskStatus
}

interface Pause {
  startedAt: string
  endedAt: string
}

type PomoType = 'work' | 'short-break' | 'long-break'

interface Pomo {
  uuid: string
  startAt: string
  endAt: string
  pauses: Pause[]
  cicle: number
  type: PomoType
}

interface Tag {
  uuid: string
  label: string
  color: string
}

const STORAGE_KEYS = {
  tasks: 'td_tasks',
  pomos: 'td_pomos',
  tags: 'td_tags',
}

function readLS<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeLS<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(key, JSON.stringify(value))
}

export class Backend {
  async getTasks(): Promise<Task[]> {
    await this.sleep(120)
    const ls = readLS<Task[]>(STORAGE_KEYS.tasks)
    if (ls && Array.isArray(ls)) {
      return ls
    }
    const fallback = tasksData as Task[]
    writeLS(STORAGE_KEYS.tasks, fallback)
    return fallback
  }

  async getTaskById(uuid: string): Promise<Task | null> {
    await this.sleep(80)
    const tasks = await this.getTasks()
    return tasks.find((t) => t.uuid === uuid) || null
  }

  async createTask(task: Omit<Task, 'uuid'>): Promise<Task> {
    await this.sleep(80)
    const tasks = await this.getTasks()
    const newTask: Task = { uuid: `task-${Date.now()}`, ...task }
    const next = [newTask, ...tasks]
    writeLS(STORAGE_KEYS.tasks, next)
    return newTask
  }

  async updateTask(uuid: string, updates: Partial<Task>): Promise<Task | null> {
    await this.sleep(80)
    const tasks = await this.getTasks()
    const idx = tasks.findIndex((t) => t.uuid === uuid)
    if (idx === -1) {
      return null
    }
    const updated: Task = { ...tasks[idx], ...updates }
    const next = tasks.slice()
    next[idx] = updated
    writeLS(STORAGE_KEYS.tasks, next)
    return updated
  }

  async deleteTask(uuid: string): Promise<boolean> {
    await this.sleep(80)
    const tasks = await this.getTasks()
    const next = tasks.filter((t) => t.uuid !== uuid)
    writeLS(STORAGE_KEYS.tasks, next)
    return true
  }

  async getPomos(): Promise<Pomo[]> {
    await this.sleep(120)
    const ls = readLS<Pomo[]>(STORAGE_KEYS.pomos)
    if (ls && Array.isArray(ls)) {
      return ls
    }
    const fallback = pomoData as Pomo[]
    writeLS(STORAGE_KEYS.pomos, fallback)
    return fallback
  }

  async getPomoById(uuid: string): Promise<Pomo | null> {
    await this.sleep(80)
    const pomos = await this.getPomos()
    return pomos.find((p) => p.uuid === uuid) || null
  }

  async createPomo(pomo: Omit<Pomo, 'uuid'>): Promise<Pomo> {
    await this.sleep(80)
    const pomos = await this.getPomos()
    const newPomo: Pomo = { uuid: `pomo-${Date.now()}`, ...pomo }
    writeLS(STORAGE_KEYS.pomos, [newPomo, ...pomos])
    return newPomo
  }

  async updatePomo(uuid: string, updates: Partial<Pomo>): Promise<Pomo | null> {
    await this.sleep(80)
    const pomos = await this.getPomos()
    const idx = pomos.findIndex((p) => p.uuid === uuid)
    if (idx === -1) {
      return null
    }
    const updated: Pomo = { ...pomos[idx], ...updates }
    const next = pomos.slice()
    next[idx] = updated
    writeLS(STORAGE_KEYS.pomos, next)
    return updated
  }

  async deletePomo(uuid: string): Promise<boolean> {
    await this.sleep(80)
    const pomos = await this.getPomos()
    writeLS(
      STORAGE_KEYS.pomos,
      pomos.filter((p) => p.uuid !== uuid)
    )
    return true
  }

  async getTags(): Promise<Tag[]> {
    await this.sleep(120)
    const ls = readLS<Tag[]>(STORAGE_KEYS.tags)
    if (ls && Array.isArray(ls)) {
      return ls
    }
    const fallback = tagsData as Tag[]
    writeLS(STORAGE_KEYS.tags, fallback)
    return fallback
  }

  async getTagById(uuid: string): Promise<Tag | null> {
    await this.sleep(80)
    const tags = await this.getTags()
    return tags.find((t) => t.uuid === uuid) || null
  }

  async createTag(tag: Omit<Tag, 'uuid'>): Promise<Tag> {
    await this.sleep(80)
    const tags = await this.getTags()
    const newTag: Tag = { uuid: `tag-${Date.now()}`, ...tag }
    writeLS(STORAGE_KEYS.tags, [newTag, ...tags])
    return newTag
  }

  async updateTag(uuid: string, updates: Partial<Tag>): Promise<Tag | null> {
    await this.sleep(80)
    const tags = await this.getTags()
    const idx = tags.findIndex((t) => t.uuid === uuid)
    if (idx === -1) {
      return null
    }
    const updated: Tag = { ...tags[idx], ...updates }
    const next = tags.slice()
    next[idx] = updated
    writeLS(STORAGE_KEYS.tags, next)
    return updated
  }

  async deleteTag(uuid: string): Promise<boolean> {
    await this.sleep(80)
    const tags = await this.getTags()
    writeLS(
      STORAGE_KEYS.tags,
      tags.filter((t) => t.uuid !== uuid)
    )
    return true
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const backend = new Backend()
