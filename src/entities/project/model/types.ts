export interface BitrixProject {
  id: number
  name: string
}

export function normalizeProjectName(projectName: string): string {
  return projectName.trim().replace(/\s+/g, ' ').toLowerCase()
}
