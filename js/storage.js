/**
 * Módulo de Persistência Local (LocalStorage)
 * Com suporte a dados iniciais de demonstração, importação e exportação
 */

const STORAGE_KEYS = {
  PROFILE: 'nutrifit_profile_v1',
  DIARY: 'nutrifit_diary_v1',
  EXAMS: 'nutrifit_exams_v1',
  WATER: 'nutrifit_water_v1',
  HISTORY: 'nutrifit_weight_history_v1',
  REALITY: 'nutrifit_reality_prefs_v1'
};

const DEFAULT_REALITY_PREFS = {
  mealCount: 4,
  routineStyle: 'balanced',
  selectedFoodIds: []
};

const DEFAULT_PROFILE = {
  name: '',
  age: null,
  gender: 'male',
  height: null,
  weight: null,
  initialWeight: null,
  targetWeight: null,
  activityLevel: 1.55,
  goal: 'cut_mod',
  isConfigured: false
};

const DEFAULT_EXAMS = [];

const DEFAULT_WEIGHT_HISTORY = [];

const Storage = {
  // --- PERFIL ---
  getProfile() {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) {
      this.saveProfile(DEFAULT_PROFILE);
      return { ...DEFAULT_PROFILE };
    }
    try {
      return JSON.parse(data);
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  },

  saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  // --- DIÁRIO ALIMENTAR ---
  getDiary(dateStr) {
    const raw = localStorage.getItem(STORAGE_KEYS.DIARY);
    const all = raw ? JSON.parse(raw) : {};

    if (!all[dateStr]) {
      all[dateStr] = {
        breakfast: [],
        lunch: [],
        snack: [],
        dinner: [],
        supper: []
      };
      localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(all));
    }
    return all[dateStr];
  },

  saveDiary(dateStr, mealsData) {
    const raw = localStorage.getItem(STORAGE_KEYS.DIARY);
    const all = raw ? JSON.parse(raw) : {};
    all[dateStr] = mealsData;
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(all));
  },

  addFoodEntry(dateStr, mealKey, foodEntry) {
    const meals = this.getDiary(dateStr);
    if (!meals[mealKey]) meals[mealKey] = [];
    meals[mealKey].push(foodEntry);
    this.saveDiary(dateStr, meals);
  },

  removeFoodEntry(dateStr, mealKey, index) {
    const meals = this.getDiary(dateStr);
    if (meals[mealKey] && meals[mealKey][index]) {
      meals[mealKey].splice(index, 1);
      this.saveDiary(dateStr, meals);
    }
  },

  // --- EXAMES ---
  getExams() {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!raw) {
      this.saveExams(DEFAULT_EXAMS);
      return [...DEFAULT_EXAMS];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_EXAMS];
    }
  },

  saveExams(exams) {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  },

  upsertExam(examData) {
    const list = this.getExams();
    const existingIndex = list.findIndex(e => e.examId === examData.examId);
    if (existingIndex >= 0) {
      list[existingIndex] = examData;
    } else {
      list.push(examData);
    }
    this.saveExams(list);
  },

  deleteExam(examId) {
    const list = this.getExams().filter(e => e.examId !== examId);
    this.saveExams(list);
  },

  // --- HIDRATAÇÃO ---
  getWater(dateStr) {
    const raw = localStorage.getItem(STORAGE_KEYS.WATER);
    const all = raw ? JSON.parse(raw) : {};
    return all[dateStr] || 0;
  },

  setWater(dateStr, amount) {
    const raw = localStorage.getItem(STORAGE_KEYS.WATER);
    const all = raw ? JSON.parse(raw) : {};
    all[dateStr] = Math.max(0, amount);
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(all));
  },

  // --- HISTÓRICO DE PESO ---
  getWeightHistory() {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(DEFAULT_WEIGHT_HISTORY));
      return [...DEFAULT_WEIGHT_HISTORY];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_WEIGHT_HISTORY];
    }
  },

  addWeightRecord(dateStr, weight) {
    const history = this.getWeightHistory();
    const idx = history.findIndex(h => h.date === dateStr);
    if (idx >= 0) {
      history[idx].weight = weight;
    } else {
      history.push({ date: dateStr, weight });
      history.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  // --- PREFERÊNCIAS DA REALIDADE ALIMENTAR ---
  getRealityPrefs() {
    const raw = localStorage.getItem(STORAGE_KEYS.REALITY);
    if (!raw) {
      this.saveRealityPrefs(DEFAULT_REALITY_PREFS);
      return { ...DEFAULT_REALITY_PREFS };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { ...DEFAULT_REALITY_PREFS };
    }
  },

  saveRealityPrefs(prefs) {
    localStorage.setItem(STORAGE_KEYS.REALITY, JSON.stringify(prefs));
  },

  // --- EXPORTAR / IMPORTAR / RESET ---
  exportBackup() {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      exams: this.getExams(),
      diary: JSON.parse(localStorage.getItem(STORAGE_KEYS.DIARY) || '{}'),
      water: JSON.parse(localStorage.getItem(STORAGE_KEYS.WATER) || '{}'),
      weightHistory: this.getWeightHistory(),
      realityPrefs: this.getRealityPrefs()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
      if (data.exams) localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(data.exams));
      if (data.diary) localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(data.diary));
      if (data.water) localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(data.water));
      if (data.weightHistory) localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.weightHistory));
      if (data.realityPrefs) localStorage.setItem(STORAGE_KEYS.REALITY, JSON.stringify(data.realityPrefs));
      return true;
    } catch (e) {
      console.error('Falha ao importar backup:', e);
      return false;
    }
  },

  resetDemo() {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.DIARY);
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.WATER);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.REALITY);
    location.reload();
  }
};
