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
  routineStyle: 'practical',
  selectedFoodIds: [
    'arroz_branco', 'feijao_carioca', 'frango_grelhado', 'ovo_mexido',
    'pao_frances', 'banana_prata', 'aveia_flocos', 'alface_crespa',
    'tomate_salada', 'azeite_oliva', 'leite_desnatado'
  ]
};

const DEFAULT_PROFILE = {
  name: 'Carlos Eduardo Silva',
  age: 32,
  gender: 'male',
  height: 178, // cm
  weight: 85.0, // kg atual
  initialWeight: 88.5,
  targetWeight: 78.0, // kg meta
  activityLevel: 1.55, // moderadamente ativo
  goal: 'cut_mod' // emagrecimento moderado (-500 kcal)
};

const DEFAULT_EXAMS = [
  { examId: 'glucose', value: 94, date: '2026-10-15', notes: 'Glicemia dentro da faixa ideal' },
  { examId: 'total_cholesterol', value: 205, date: '2026-10-15', notes: 'Limítrofe leve' },
  { examId: 'hdl', value: 44, date: '2026-10-15', notes: 'Bom, mas pode melhorar com exercícios aeróbicos' },
  { examId: 'ldl', value: 132, date: '2026-10-15', notes: 'Atenção ao consumo de gorduras saturadas' },
  { examId: 'triglycerides', value: 175, date: '2026-10-15', notes: 'Limítrofe. Recomenda-se reduzir carboidratos simples' },
  { examId: 'vitamin_d', value: 24, date: '2026-10-15', notes: 'Insuficiente. Necessidade de sol e reforço na dieta' },
  { examId: 'uric_acid', value: 5.6, date: '2026-10-15', notes: 'Excelente' }
];

const DEFAULT_WEIGHT_HISTORY = [
  { date: '2026-09-01', weight: 88.5 },
  { date: '2026-09-15', weight: 87.2 },
  { date: '2026-10-01', weight: 86.4 },
  { date: '2026-10-15', weight: 85.8 },
  { date: '2026-11-01', weight: 85.0 }
];

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
      // Se for o dia de hoje e não houver dados, inicializa com refeições de exemplo
      const todayStr = new Date().toISOString().split('T')[0];
      if (dateStr === todayStr) {
        all[dateStr] = this._generateDefaultTodayMeals();
        localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(all));
      } else {
        all[dateStr] = {
          breakfast: [],
          lunch: [],
          snack: [],
          dinner: [],
          supper: []
        };
      }
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

  _generateDefaultTodayMeals() {
    return {
      breakfast: [
        { id: 'pao_integral', name: 'Pão Integral 100%', quantity: 50, unit: 'g', kcal: 124, carbs: 20.7, protein: 6.5, fats: 1.7, fiber: 3.5 },
        { id: 'ovo_mexido', name: 'Ovo Mexido (com fio de azeite)', quantity: 100, unit: 'g', kcal: 168, carbs: 1.0, protein: 12.5, fats: 12.0, fiber: 0 }
      ],
      lunch: [
        { id: 'arroz_integral', name: 'Arroz Integral Cozido', quantity: 150, unit: 'g', kcal: 186, carbs: 38.7, protein: 3.9, fats: 1.5, fiber: 4.0 },
        { id: 'feijao_carioca', name: 'Feijão Carioca Cozido', quantity: 100, unit: 'g', kcal: 76, carbs: 13.6, protein: 4.8, fats: 0.5, fiber: 8.5 },
        { id: 'frango_grelhado', name: 'Peito de Frango Grelhado', quantity: 150, unit: 'g', kcal: 239, carbs: 0, protein: 48.0, fats: 3.8, fiber: 0 },
        { id: 'alface_crespa', name: 'Alface Crespa Fresca', quantity: 50, unit: 'g', kcal: 6, carbs: 0.9, protein: 0.7, fats: 0.1, fiber: 0.9 },
        { id: 'azeite_oliva', name: 'Azeite de Oliva Extra Virgem', quantity: 10, unit: 'g', kcal: 88, carbs: 0, protein: 0, fats: 10.0, fiber: 0 }
      ],
      snack: [
        { id: 'banana_prata', name: 'Banana Prata', quantity: 100, unit: 'g', kcal: 98, carbs: 26.0, protein: 1.3, fats: 0.1, fiber: 2.0 },
        { id: 'aveia_flocos', name: 'Aveia em Flocos', quantity: 30, unit: 'g', kcal: 118, carbs: 20.0, protein: 4.2, fats: 2.6, fiber: 2.7 }
      ],
      dinner: [],
      supper: []
    };
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
