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

export class Backend {
  async getTasks (): Promise<Task[]> {
    await this.sleep(150)
    return tasksData as Task[]
  }

  async getTaskById (uuid: string): Promise<Task | null> {
    await this.sleep(150)
    const tasks = tasksData as Task[]
    return tasks.find(task => task.uuid === uuid) || null
  }

  async createTask (task: Omit<Task, 'uuid'>): Promise<Task> {
    await this.sleep(150)
    const newTask: Task = {
      uuid: `task-${Date.now()}`,
      ...task,
    }
    return newTask
  }

  async updateTask (uuid: string, updates: Partial<Task>): Promise<Task | null> {
    await this.sleep(150)
    const tasks = tasksData as Task[]
    const task = tasks.find(t => t.uuid === uuid)
    if (!task) {
      return null
    }
    return { ...task, ...updates }
  }

  async deleteTask (_uuid: string): Promise<boolean> {
    await this.sleep(150)
    return true
  }

  async getPomos (): Promise<Pomo[]> {
    await this.sleep(150)
    return pomoData as Pomo[]
  }

  async getPomoById (uuid: string): Promise<Pomo | null> {
    await this.sleep(150)
    const pomos = pomoData as Pomo[]
    return pomos.find(pomo => pomo.uuid === uuid) || null
  }

  async createPomo (pomo: Omit<Pomo, 'uuid'>): Promise<Pomo> {
    await this.sleep(150)
    const newPomo: Pomo = {
      uuid: `pomo-${Date.now()}`,
      ...pomo,
    }
    return newPomo
  }

  async updatePomo (uuid: string, updates: Partial<Pomo>): Promise<Pomo | null> {
    await this.sleep(150)
    const pomos = pomoData as Pomo[]
    const pomo = pomos.find(p => p.uuid === uuid)
    if (!pomo) {
      return null
    }
    return { ...pomo, ...updates }
  }

  async deletePomo (_uuid: string): Promise<boolean> {
    await this.sleep(150)
    return true
  }

  async getTags (): Promise<Tag[]> {
    await this.sleep(150)
    return tagsData as Tag[]
  }

  async getTagById (uuid: string): Promise<Tag | null> {
    await this.sleep(150)
    const tags = tagsData as Tag[]
    return tags.find(tag => tag.uuid === uuid) || null
  }

  async createTag (tag: Omit<Tag, 'uuid'>): Promise<Tag> {
    await this.sleep(150)
    const newTag: Tag = {
      uuid: `tag-${Date.now()}`,
      ...tag,
    }
    return newTag
  }

  async updateTag (uuid: string, updates: Partial<Tag>): Promise<Tag | null> {
    await this.sleep(150)
    const tags = tagsData as Tag[]
    const tag = tags.find(t => t.uuid === uuid)
    if (!tag) {
      return null
    }
    return { ...tag, ...updates }
  }

  async deleteTag (_uuid: string): Promise<boolean> {
    await this.sleep(150)
    return true
  }

  private sleep (ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const backend = new Backend()
