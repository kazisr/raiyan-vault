export const CHILD_NAME = 'Kazi Ahmed Raiyan'
export const CHILD_DOB = '2026-05-17'
export const CHILD_NICKNAME = 'Raiyan'

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

export const EVENT_TYPES = [
  { value: 'milestone', label: 'Milestone', emoji: '⭐' },
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'health', label: 'Health', emoji: '💊' },
  { value: 'custom', label: 'Custom', emoji: '📝' },
] as const

export const EVENT_MOODS = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'excited', label: 'Excited', emoji: '🤩' },
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'sick', label: 'Sick', emoji: '🤒' },
  { value: 'surprised', label: 'Surprised', emoji: '😲' },
] as const

export const VACCINE_SCHEDULE = [
  { name: 'BCG', dose: '1st', ageMonths: 0 },
  { name: 'Hepatitis B', dose: '1st', ageMonths: 0 },
  { name: 'OPV', dose: '1st', ageMonths: 1.5 },
  { name: 'Pentavalent', dose: '1st', ageMonths: 1.5 },
  { name: 'IPV', dose: '1st', ageMonths: 1.5 },
  { name: 'PCV', dose: '1st', ageMonths: 1.5 },
  { name: 'OPV', dose: '2nd', ageMonths: 3.5 },
  { name: 'Pentavalent', dose: '2nd', ageMonths: 3.5 },
  { name: 'PCV', dose: '2nd', ageMonths: 3.5 },
  { name: 'OPV', dose: '3rd', ageMonths: 5 },
  { name: 'Pentavalent', dose: '3rd', ageMonths: 5 },
  { name: 'MR', dose: '1st', ageMonths: 9 },
  { name: 'JE', dose: '1st', ageMonths: 9 },
  { name: 'MR', dose: '2nd', ageMonths: 15 },
  { name: 'PCV', dose: 'Booster', ageMonths: 12 },
] as const
