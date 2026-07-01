export interface PersonalData {
  name: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  location: string
  highlights: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  area: string
  startDate: string
  endDate: string
  gpa: string
}

export interface SkillGroup {
  label: string
  details: string
}

export type CVTheme = 'classic' | 'engineeringresumes' | 'sb2nov' | 'moderncv'
export type OutputFormat = 'pdf' | 'png'

export interface TemplateSelection {
  theme: CVTheme
  format: OutputFormat
}

export interface CVData {
  personal: PersonalData
  summary: string
  experience: Experience[]
  education: Education[]
  skills: SkillGroup[]
  template: TemplateSelection
}

export const initialCVData: CVData = {
  personal: {
    name: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  template: {
    theme: 'classic',
    format: 'pdf',
  },
}
