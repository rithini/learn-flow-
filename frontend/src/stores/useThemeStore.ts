import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (val: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const savedTheme = localStorage.getItem('learnflow_theme');
  const initialDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (initialDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    isDarkMode: initialDark,
    toggleTheme: () => {
      set((state) => {
        const nextDark = !state.isDarkMode;
        if (nextDark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('learnflow_theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('learnflow_theme', 'light');
        }
        return { isDarkMode: nextDark };
      });
    },
    setDarkMode: (val: boolean) => {
      if (val) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('learnflow_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('learnflow_theme', 'light');
      }
      set({ isDarkMode: val });
    },
  };
});
