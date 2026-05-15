import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Attach auth token to every request
API.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const useStore = create(
  persist(
    (set, get) => ({
      // ─── Auth ─────────────────────────────────────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await API.post('/auth/login', { email, password });
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      register: async (username, email, password) => {
        const { data } = await API.post('/auth/register', { username, email, password });
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: async (updates) => {
        const { data } = await API.put('/auth/profile', updates);
        set({ user: data.user });
        return data;
      },

      // ─── Editor ───────────────────────────────────────────────────────────
      editorCode: `# Welcome to SYLESS!
# Code Like You Think

say -> "Hello, World!"

make name = "SYLESS"
say -> name

make nums = [5, 3, 8, 1, 9, 2]
sort nums ascending
say -> nums

loop 3 times {
    say -> "Learning is fun!"
}
`,
      pythonCode: '',
      editorTheme: 'syless-dark',
      fontSize: 14,
      isRunning: false,
      output: '',
      runError: null,
      executionTime: null,

      setEditorCode: (code) => set({ editorCode: code }),
      setPythonCode: (code) => set({ pythonCode: code }),
      setFontSize: (size) => set({ fontSize: size }),

      runCode: async (stdin = '') => {
        const { editorCode } = get();
        set({ isRunning: true, output: '', runError: null });
        try {
          const { data } = await API.post('/compile/run', { code: editorCode, stdin });
          set({
            isRunning: false,
            output: data.output || '',
            runError: data.error || null,
            pythonCode: data.pythonCode || '',
            executionTime: data.executionTime,
          });
          return data;
        } catch (err) {
          const error = err.response?.data?.error || 'Connection error — is the backend running?';
          set({ isRunning: false, runError: error });
          throw err;
        }
      },

      compileOnly: async () => {
        const { editorCode } = get();
        try {
          const { data } = await API.post('/compile', { code: editorCode });
          set({ pythonCode: data.pythonCode || '' });
          return data;
        } catch (err) {
          const error = err.response?.data?.error || 'Compilation failed';
          set({ runError: error });
          throw err;
        }
      },

      clearOutput: () => set({ output: '', runError: null }),

      // ─── AI Panel ─────────────────────────────────────────────────────────
      aiMessages: [],
      aiLoading: false,
      aiPanelOpen: true,

      sendAIMessage: async (message) => {
        const { editorCode, aiMessages } = get();
        const userMsg = { role: 'user', content: message };
        const updatedMessages = [...aiMessages, userMsg];
        set({ aiMessages: updatedMessages, aiLoading: true });

        try {
          const { data } = await API.post('/ai/chat', {
            messages: updatedMessages,
            context: editorCode,
          });
          const assistantMsg = { role: 'assistant', content: data.reply };
          set({
            aiMessages: [...updatedMessages, assistantMsg],
            aiLoading: false,
          });
        } catch (err) {
          set({ aiLoading: false });
          throw err;
        }
      },

      clearAIChat: () => set({ aiMessages: [] }),
      setAIPanelOpen: (open) => set({ aiPanelOpen: open }),

      explainCode: async () => {
        const { editorCode } = get();
        const { data } = await API.post('/ai/explain', { code: editorCode });
        return data.explanation;
      },

      debugCode: async (error) => {
        const { editorCode, pythonCode } = get();
        const { data } = await API.post('/ai/debug', {
          code: editorCode,
          error,
          pythonCode,
        });
        return data.debug;
      },

      // ─── DSA ──────────────────────────────────────────────────────────────
      problems: [],
      categories: [],
      currentProblem: null,

      fetchProblems: async (filters = {}) => {
        const { data } = await API.get('/dsa/problems', { params: filters });
        set({ problems: data.problems });
        return data;
      },

      fetchCategories: async () => {
        const { data } = await API.get('/dsa/categories');
        set({ categories: data.categories });
        return data;
      },

      fetchProblem: async (slug) => {
        const { data } = await API.get(`/dsa/problems/${slug}`);
        set({ currentProblem: data.problem });
        return data.problem;
      },

      submitProblem: async (problemSlug, code) => {
        const { data } = await API.post('/dsa/submit', { problemSlug, code });
        return data;
      },

      // ─── UI State ─────────────────────────────────────────────────────────
      sidebarCollapsed: false,
      activeTab: 'output',
      terminalVisible: true,
      settingsOpen: false,

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setTerminalVisible: (v) => set({ terminalVisible: v }),
      setSettingsOpen: (v) => set({ settingsOpen: v }),

      // ─── Snippets ─────────────────────────────────────────────────────────
      saveSnippet: async (title) => {
        const { editorCode } = get();
        const { data } = await API.post('/auth/snippets', { title, code: editorCode });
        return data;
      },
    }),
    {
      name: 'syless-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        editorCode: state.editorCode,
        fontSize: state.fontSize,
        sidebarCollapsed: state.sidebarCollapsed,
        aiPanelOpen: state.aiPanelOpen,
      }),
    }
  )
);

export { API };
export default useStore;
