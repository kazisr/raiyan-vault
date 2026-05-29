import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}

interface ToastStore {
  toasts: ToastItem[]
  add: (toast: Omit<ToastItem, 'id'>) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: ({ message, variant, duration }) => {
    const id = Math.random().toString(36).slice(2, 9)
    set((s) => ({ toasts: [...s.toasts, { id, message, variant, duration }] }))
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

function show(message: string, variant: ToastVariant, duration = 4000) {
  useToastStore.getState().add({ message, variant, duration })
}

export const toast = {
  success: (message: string, duration?: number) => show(message, 'success', duration),
  error:   (message: string, duration?: number) => show(message, 'error',   duration),
  info:    (message: string, duration?: number) => show(message, 'info',    duration),
  warning: (message: string, duration?: number) => show(message, 'warning', duration),
}
