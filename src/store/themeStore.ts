import { create } from 'zustand'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

/**
 * Global light/dark theme switch. This is the one piece of app state that
 * intentionally reaches outside React (toggling a class on `<html>`) because
 * Tailwind's `dark:` variant is driven by the presence of a `.dark` class on
 * the document root, not by a prop threaded through the component tree.
 *
 * Kept in-memory only, consistent with the rest of the app: a hard refresh
 * resets to the default theme rather than persisting to localStorage.
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',

  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyThemeClass(next)
    set({ theme: next })
  },
}))

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

// Apply the default theme to <html> once, at module load, so the very first
// paint already matches `theme` above instead of flashing light-then-dark.
applyThemeClass(useThemeStore.getState().theme)
