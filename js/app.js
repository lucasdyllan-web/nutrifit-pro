/**
 * Aplicação Principal - NutriFit Pro
 * Controlador de Interface, Reatividade e Integração de Módulos
 */

const app = {
  currentDate: new Date().toISOString().split('T')[0],
  profile: null,
  diary: null,
  exams: [],
  water: 0,
  realityPrefs: null,
  lastGeneratedRealityDiet: null,
  chartInstance: null,
  selectedFoodObj: null,
  targetMealKey: 'lunch',

  init() {
    this.loadState();
    this.setupDatePickers();
    this.setupTabs();
    this.renderAll();

    // Se o perfil for novo/zerado, abre automaticamente o assistente de onboarding
    if (!this.profile || !this.profile.isConfigured || !this.profile.weight) {
      setTimeout(() => this.openOnboardingModal(), 350);
    }

    // Redimensionamento do gráfico responsivo
    window.addEventListener('resize', () => {
      if (document.getElementById('tab-projections').classList.contains('active')) {
        this.renderProjectionsChart();
      }
    });
  },

  loadState() {
    this.profile = Storage.getProfile();
    this.diary = Storage.getDiary(this.currentDate);
    this.exams = Storage.getExams();
    this.water = Storage.getWater(this.currentDate);
    this.realityPrefs = Storage.getRealityPrefs();
  },

  setupDatePickers() {
    const input = document.getElementById('selectedDateInput');
    const examDateInput = document.getElementById('examDateInput');
    if (input) {
      input.value = this.currentDate;
      input.addEventListener('change', (e) => {
        this.setDate(e.target.value);
      });
    }
    if (examDateInput) {
      examDateInput.value = this.currentDate;
    }

    document.getElementById('btnPrevDay')?.addEventListener('click', () => this.shiftDay(-1));
    document.getElementById('btnNextDay')?.addEventListener('click', () => this.shiftDay(1));
    document.getElementById('btnGoToday')?.addEventListener('click', () => this.setDate(new Date().toISOString().split('T')[0]));
  },

  shiftDay(delta) {
    const d = new Date(this.currentDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    this.setDate(d.toISOString().split('T')[0]);
  },

  setDate(newDateStr) {
    this.currentDate = newDateStr;
    const input = document.getElementById('selectedDateInput');
    if (input) input.value = this.currentDate;

    this.diary = Storage.getDiary(this.currentDate);
    this.water = Storage.getWater(this.currentDate);
    this.renderAll();
  },

  setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = tab.getAttribute('data-tab');
        this.switchTab(targetId);
      });
    });

    // Vincula explicitamente os botões da barra inferior mobile (touch e click rápidos)
    const mobButtons = document.querySelectorAll('.mobile-nav-btn');
    mobButtons.forEach(btn => {
      const tabId = btn.getAttribute('data-mobtab');
      if (!tabId) return;

      let touchHandled = false;

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchHandled = true;
        this.switchTab(tabId);
        setTimeout(() => { touchHandled = false; }, 350);
      }, { passive: false });

      btn.addEventListener('click', (e) => {
        if (touchHandled) return;
        this.switchTab(tabId);
      });
    });

    // Fechar modais ao clicar no fundo escuro (backdrop)
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.add('hidden');
        }
      });
    });
  },

  switchTab(tabId) {
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mobtab') === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(p => {
      p.classList.toggle('active', p.id === tabId);
    });

    if (tabId === 'tab-projections') {
      setTimeout(() => this.renderProjectionsChart(), 50);
    }
  },

  renderAll() {
    this.renderHeader();
    this.renderDashboard();
    this.renderDiary();
    this.renderProfileAndExams();
    this.renderProjections();
    this.renderRealityTab();
    this.renderMealPlan();
  },

  // ==========================================
  // CABEÇALHO & RESUMO RÁPIDO
  // ==========================================
  renderHeader() {
    const summaryContainer = document.getElementById('headerUserSummary');
    if (!summaryContainer) return;

    if (!this.profile || !this.profile.isConfigured || !this.profile.weight) {
      summaryContainer.innerHTML = `
        <div class="user-quick-pill" onclick="app.openOnboardingModal()" style="cursor: pointer;" title="Clique para começar">
          <span class="dot-active" style="background: #f59e0b;"></span>
          <span>👋 Novo Perfil &bull; <strong>Começar Configuração</strong></span>
        </div>
      `;
    } else {
      const diff = Number((this.profile.weight - this.profile.targetWeight).toFixed(1));
      const diffSign = diff > 0 ? `-${diff} kg para a meta` : diff < 0 ? `+${Math.abs(diff)} kg para a meta` : 'Meta alcançada!';
      const firstName = (this.profile.name || 'Você').trim().split(' ')[0] || 'Você';

      summaryContainer.innerHTML = `
        <div class="user-quick-pill">
          <span class="dot-active"></span>
          <span><strong>${firstName}</strong> (${this.profile.weight} kg)</span>
        </div>
        <div class="user-quick-pill">
          <span>🎯 Meta: <strong>${this.profile.targetWeight} kg</strong> <span class="text-xs text-muted">(${diffSign})</span></span>
        </div>
      `;
    }

    // Atualiza label da data
    const dateDisplayLabel = document.getElementById('dateDisplayLabel');
    if (dateDisplayLabel) {
      const today = new Date().toISOString().split('T')[0];
      if (this.currentDate === today) {
        dateDisplayLabel.textContent = 'Hoje';
      } else {
        const d = new Date(this.currentDate + 'T00:00:00');
        dateDisplayLabel.textContent = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
      }
    }
  },

  // ==========================================
  // DASHBOARD
  // ==========================================
  renderDashboard() {
    const zeroBanner = document.getElementById('dashboardWelcomeZeroBanner');
    const alertBanner = document.getElementById('dashboardHealthAlertBanner');

    // Se o perfil não estiver configurado / zerado
    if (!this.profile || !this.profile.isConfigured || !this.profile.weight) {
      if (zeroBanner) zeroBanner.classList.remove('hidden');
      if (alertBanner) alertBanner.classList.add('hidden');

      document.getElementById('goalTypeBadge').textContent = 'Aguardando Perfil';
      document.getElementById('calGoalVal').textContent = '0 kcal';
      document.getElementById('calConsumedVal').textContent = '0 kcal';
      document.getElementById('calTdeeVal').textContent = '0 kcal';
      document.getElementById('calDeficitVal').textContent = '0 kcal';

      document.getElementById('calRemainingVal').textContent = '0';
      document.getElementById('calRemainingLabel').textContent = 'kcal meta';

      this._updateMacroBar('carb', 0, 0);
      this._updateMacroBar('prot', 0, 0);
      this._updateMacroBar('fat', 0, 0);
      this._updateMacroBar('fiber', 0, 0);

      document.getElementById('waterGoalBadge').textContent = '0 ml meta';
      document.getElementById('waterCurrentVal').textContent = '0';
      document.getElementById('waterTargetLabel').textContent = 'de 0 ml';

      document.getElementById('dashCurrentWeight').textContent = '-- kg';
      document.getElementById('dashWeightDiff').textContent = 'Meta: -- kg';
      document.getElementById('dashHeight').textContent = '-- cm';
      document.getElementById('dashBmi').textContent = '--';
      const bmiStatusEl = document.getElementById('dashBmiStatus');
      bmiStatusEl.textContent = 'Não configurado';
      bmiStatusEl.className = 'bio-box-sub text-muted';

      document.getElementById('dashExamsCount').textContent = '0 cadastrados';
      document.getElementById('dashExamsStatus').textContent = 'Aguardando dados';

      document.getElementById('previewForecastHighlight').textContent = 'Aguardando seus dados';
      document.getElementById('previewForecastDetails').textContent = 'Preencha suas informações para calcular sua projeção.';

      this.renderMealsDashboardSummary();
      return;
    }

    if (zeroBanner) zeroBanner.classList.add('hidden');

    // 1. Cálculos de metas do perfil
    const bmr = NutritionCalc.calculateBMR(this.profile.weight, this.profile.height, this.profile.age, this.profile.gender);
    const tdee = NutritionCalc.calculateTDEE(bmr, this.profile.activityLevel);
    const { targetCalories, deficit, label: goalLabel } = NutritionCalc.calculateCalorieGoal(tdee, this.profile.goal);
    const macroTargets = NutritionCalc.calculateMacroTargets(targetCalories, this.profile.weight, this.profile.goal);
    const waterTarget = NutritionCalc.calculateWaterTarget(this.profile.weight);

    // 2. Soma dos alimentos consumidos no dia
    let consumedKcal = 0;
    let consumedCarb = 0;
    let consumedProt = 0;
    let consumedFat = 0;
    let consumedFiber = 0;

    Object.values(this.diary).forEach(mealFoods => {
      mealFoods.forEach(food => {
        consumedKcal += food.kcal || 0;
        consumedCarb += food.carbs || 0;
        consumedProt += food.protein || 0;
        consumedFat += food.fats || 0;
        consumedFiber += food.fiber || 0;
      });
    });

    consumedCarb = Number(consumedCarb.toFixed(1));
    consumedProt = Number(consumedProt.toFixed(1));
    consumedFat = Number(consumedFat.toFixed(1));
    consumedFiber = Number(consumedFiber.toFixed(1));

    const remainingKcal = targetCalories - consumedKcal;

    // Atualiza elementos de calorias
    document.getElementById('goalTypeBadge').textContent = goalLabel;
    document.getElementById('calGoalVal').textContent = `${targetCalories} kcal`;
    document.getElementById('calConsumedVal').textContent = `${consumedKcal} kcal`;
    document.getElementById('calTdeeVal').textContent = `${tdee} kcal`;
    document.getElementById('calDeficitVal').textContent = deficit <= 0 ? `${deficit} kcal` : `+${deficit} kcal`;

    const remainingEl = document.getElementById('calRemainingVal');
    const remainingLabelEl = document.getElementById('calRemainingLabel');
    if (remainingKcal >= 0) {
      remainingEl.textContent = remainingKcal;
      remainingEl.style.color = '#0f172a';
      remainingLabelEl.textContent = 'kcal restantes';
    } else {
      remainingEl.textContent = `+${Math.abs(remainingKcal)}`;
      remainingEl.style.color = '#ef4444';
      remainingLabelEl.textContent = 'kcal acima da meta';
    }

    // Progresso do círculo e barra
    const caloriePct = Math.min(100, Math.round((consumedKcal / targetCalories) * 100));
    const circle = document.getElementById('calorieProgressCircle');
    if (circle) {
      const circleColor = consumedKcal > targetCalories ? '#ef4444' : '#10b981';
      circle.style.background = `conic-gradient(${circleColor} ${caloriePct}%, #e2e8f0 ${caloriePct}% 100%)`;
    }
    const progressBar = document.getElementById('calorieProgressBar');
    if (progressBar) {
      progressBar.style.width = `${caloriePct}%`;
      progressBar.style.background = consumedKcal > targetCalories ? '#ef4444' : 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
    }

    // 3. Atualiza macronutrientes
    this._updateMacroBar('carb', consumedCarb, macroTargets.carbs);
    this._updateMacroBar('prot', consumedProt, macroTargets.protein);
    this._updateMacroBar('fat', consumedFat, macroTargets.fats);
    this._updateMacroBar('fiber', consumedFiber, macroTargets.fiber);

    // 4. Hidratação
    document.getElementById('waterGoalBadge').textContent = `${waterTarget.toLocaleString('pt-BR')} ml meta`;
    document.getElementById('waterCurrentVal').textContent = this.water.toLocaleString('pt-BR');
    document.getElementById('waterTargetLabel').textContent = `de ${waterTarget.toLocaleString('pt-BR')} ml recomendados`;
    const waterPct = Math.min(100, Math.round((this.water / waterTarget) * 100));
    const wave = document.getElementById('waterWaveFill');
    if (wave) wave.style.height = `${waterPct}%`;

    // 5. Perfil e IMC
    const bmiInfo = NutritionCalc.calculateBMI(this.profile.weight, this.profile.height);
    document.getElementById('dashCurrentWeight').textContent = `${this.profile.weight} kg`;
    document.getElementById('dashWeightDiff').textContent = `Meta: ${this.profile.targetWeight} kg`;
    document.getElementById('dashHeight').textContent = `${this.profile.height} cm`;
    document.getElementById('dashBmi').textContent = bmiInfo.bmi;
    const bmiStatusEl = document.getElementById('dashBmiStatus');
    bmiStatusEl.textContent = bmiInfo.classification;
    bmiStatusEl.className = `bio-box-sub ${bmiInfo.colorClass}`;

    // 6. Exames no dashboard
    const examsAnalysis = ExamsAnalyzer.analyzeAllExams(this.exams);
    document.getElementById('dashExamsCount').textContent = `${examsAnalysis.totalCount} analisados`;
    document.getElementById('dashExamsStatus').textContent = examsAnalysis.overallStatus;

    // Alerta no topo se houver alterações clínicas
    const alertBanner = document.getElementById('dashboardHealthAlertBanner');
    if (examsAnalysis.alertCount > 0 || examsAnalysis.warningCount > 0) {
      alertBanner.classList.remove('hidden');
      const criticalText = examsAnalysis.alertCount > 0 ? `${examsAnalysis.alertCount} exame(s) com atenção crítica` : `${examsAnalysis.warningCount} marcador(es) limítrofe(s)`;
      alertBanner.innerHTML = `
        <div class="health-alert-content">
          <span style="font-size: 1.5rem;">🩺</span>
          <div>
            <strong>Ajustes Clínicos Identificados nos Seus Exames: ${criticalText}</strong>
            <p>Seu cardápio e projeções consideram seus biomarcadores (ex: colesterol, triglicerídeos e vitaminas). Acesse a aba <em>Perfil & Exames</em> para ver as diretrizes.</p>
          </div>
        </div>
        <button class="btn btn-sm btn-outline" onclick="app.switchTab('tab-profile-exams')">Ver Detalhes</button>
      `;
    } else {
      alertBanner.classList.add('hidden');
    }

    // 7. Preview da Projeção no Card
    const proj = ProjectionEngine.generateProjection({
      currentWeight: this.profile.weight,
      height: this.profile.height,
      age: this.profile.age,
      gender: this.profile.gender,
      activityLevel: this.profile.activityLevel,
      dailyCalorieIntake: targetCalories,
      targetWeight: this.profile.targetWeight
    });

    if (proj.targetReachedDate) {
      document.getElementById('previewForecastHighlight').textContent = `Meta estimada para ${proj.targetReachedDate}`;
      document.getElementById('previewForecastDetails').textContent = `Previsão de ${proj.milestones.day30.formattedDelta} em 30 dias se mantido o déficit de ${Math.abs(deficit)} kcal.`;
    } else {
      document.getElementById('previewForecastHighlight').textContent = `Projeção calculada para 90 dias`;
      document.getElementById('previewForecastDetails').textContent = `Evolução constante: ${proj.milestones.day30.formattedDelta} em 30 dias.`;
    }

    // 8. Resumo das refeições no dashboard
    this.renderMealsDashboardSummary();
  },

  _updateMacroBar(prefix, consumed, target) {
    const valEl = document.getElementById(`${prefix}Val`);
    const barEl = document.getElementById(`${prefix}Bar`);
    const pctEl = document.getElementById(`${prefix}Pct`);
    if (!valEl || !barEl || !pctEl) return;

    valEl.textContent = `${consumed}g / ${target}g`;
    const pct = target > 0 ? Math.round((consumed / target) * 100) : 0;
    pctEl.textContent = `${pct}%`;
    barEl.style.width = `${Math.min(100, pct)}%`;
  },

  renderMealsDashboardSummary() {
    const container = document.getElementById('mealsDashboardSummary');
    if (!container) return;

    const mealLabels = {
      breakfast: 'Café da Manhã',
      lunch: 'Almoço',
      snack: 'Lanche',
      dinner: 'Jantar',
      supper: 'Ceia'
    };

    container.innerHTML = Object.entries(mealLabels).map(([key, label]) => {
      const foods = this.diary[key] || [];
      const mealKcal = foods.reduce((acc, f) => acc + (f.kcal || 0), 0);
      const itemsPreview = foods.length > 0 
        ? foods.map(f => `${f.name} (${f.quantity}${f.unit || 'g'})`).join(', ')
        : 'Nenhum alimento registrado ainda.';

      return `
        <div class="meal-summary-card">
          <div>
            <div class="meal-summary-header">
              <span class="meal-name">${label}</span>
              <span class="meal-cals">${mealKcal} kcal</span>
            </div>
            <p class="meal-items-preview">${itemsPreview}</p>
          </div>
          <button class="btn btn-outline btn-xs" onclick="app.openAddFoodModal('${key}')">+ Adicionar</button>
        </div>
      `;
    }).join('');
  },

  // ==========================================
  // DIÁRIO ALIMENTAR DETALHADO
  // ==========================================
  renderDiary() {
    const container = document.getElementById('mealsDiaryList');
    if (!container) return;

    const mealConfig = [
      { key: 'breakfast', name: 'Café da Manhã', icon: '☕' },
      { key: 'lunch', name: 'Almoço', icon: '🍲' },
      { key: 'snack', name: 'Lanche da Tarde', icon: '🍎' },
      { key: 'dinner', name: 'Jantar', icon: '🥗' },
      { key: 'supper', name: 'Ceia / Pré-Sono', icon: '🌙' }
    ];

    container.innerHTML = mealConfig.map(meal => {
      const foods = this.diary[meal.key] || [];
      const totalKcal = foods.reduce((acc, f) => acc + (f.kcal || 0), 0);
      const totalCarbs = Number(foods.reduce((acc, f) => acc + (f.carbs || 0), 0).toFixed(1));
      const totalProt = Number(foods.reduce((acc, f) => acc + (f.protein || 0), 0).toFixed(1));
      const totalFat = Number(foods.reduce((acc, f) => acc + (f.fats || 0), 0).toFixed(1));

      const foodRows = foods.length === 0 
        ? `<div style="padding: 1.25rem; text-align: center; color: #94a3b8; font-size: 0.85rem;">Nenhum alimento registrado nesta refeição.</div>`
        : foods.map((f, index) => `
            <div class="food-entry-item">
              <div class="food-info">
                <span class="food-title">${f.name}</span>
                <span class="food-qty-label">${f.quantity} ${f.unit || 'g'} &bull; <strong style="color: #059669;">${f.kcal} kcal</strong></span>
              </div>
              <div class="food-macros-badge">
                <span class="macro-mini">C: <strong>${f.carbs}g</strong></span>
                <span class="macro-mini">P: <strong>${f.protein}g</strong></span>
                <span class="macro-mini">G: <strong>${f.fats}g</strong></span>
                <button class="btn-food-delete" onclick="app.removeFood('${meal.key}', ${index})" title="Remover">&times;</button>
              </div>
            </div>
          `).join('');

      return `
        <div class="diary-meal-block">
          <div class="diary-meal-header">
            <div class="meal-header-left">
              <span style="font-size: 1.25rem;">${meal.icon}</span>
              <div>
                <strong style="font-size: 0.95rem;">${meal.name}</strong>
                <div class="meal-header-macros">
                  <span>${totalKcal} kcal</span>
                  <span>C: ${totalCarbs}g</span>
                  <span>P: ${totalProt}g</span>
                  <span>G: ${totalFat}g</span>
                </div>
              </div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="app.openAddFoodModal('${meal.key}')">
              + Adicionar Alimento
            </button>
          </div>
          <div class="diary-food-list">
            ${foodRows}
          </div>
        </div>
      `;
    }).join('');
  },

  // ==========================================
  // PERFIL & EXAMES LABORATORIAIS
  // ==========================================
  renderProfileAndExams() {
    // 1. Preenche inputs do formulário de perfil
    if (this.profile && this.profile.isConfigured && this.profile.weight) {
      document.getElementById('profName').value = this.profile.name || '';
      document.getElementById('profAge').value = this.profile.age || '';
      document.getElementById('profGender').value = this.profile.gender || 'male';
      document.getElementById('profHeight').value = this.profile.height || '';
      document.getElementById('profWeight').value = this.profile.weight || '';
      document.getElementById('profTargetWeight').value = this.profile.targetWeight || '';
      document.getElementById('profActivity').value = this.profile.activityLevel || '1.55';
      document.getElementById('profGoal').value = this.profile.goal || 'cut_mod';

      // Métricas calculadas
      const bmr = NutritionCalc.calculateBMR(this.profile.weight, this.profile.height, this.profile.age, this.profile.gender);
      const tdee = NutritionCalc.calculateTDEE(bmr, this.profile.activityLevel);
      const bmiInfo = NutritionCalc.calculateBMI(this.profile.weight, this.profile.height);

      document.getElementById('calcBmrVal').textContent = `${bmr} kcal`;
      document.getElementById('calcTdeeVal').textContent = `${tdee} kcal`;
      document.getElementById('calcBmiClassVal').textContent = `${bmiInfo.bmi} (${bmiInfo.classification})`;
      document.getElementById('calcIdealWeightRange').textContent = `Faixa de peso saudável recomendada: ${bmiInfo.idealMinWeight} kg a ${bmiInfo.idealMaxWeight} kg`;
    } else {
      document.getElementById('profName').value = '';
      document.getElementById('profAge').value = '';
      document.getElementById('profGender').value = 'male';
      document.getElementById('profHeight').value = '';
      document.getElementById('profWeight').value = '';
      document.getElementById('profTargetWeight').value = '';
      document.getElementById('calcBmrVal').textContent = '-- kcal';
      document.getElementById('calcTdeeVal').textContent = '-- kcal';
      document.getElementById('calcBmiClassVal').textContent = '--';
      document.getElementById('calcIdealWeightRange').textContent = 'Informe sua altura e peso para calcular';
    }

    // 2. Renderiza lista de exames laboratoriais
    const container = document.getElementById('examsContainer');
    if (!container) return;

    const analysis = ExamsAnalyzer.analyzeAllExams(this.exams);

    if (analysis.results.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: #94a3b8;">
          Nenhum exame cadastrado ainda. Clique em "Adicionar / Atualizar Exame" para monitorar sua saúde.
        </div>
      `;
    } else {
      container.innerHTML = analysis.results.map(e => `
        <div class="exam-card status-${e.status}">
          <div>
            <div class="exam-card-header">
              <span class="exam-title">${e.name}</span>
              <button class="btn-food-delete" onclick="app.deleteExam('${e.examId}')" title="Excluir exame">&times;</button>
            </div>
            <div class="exam-value-box">
              <span class="exam-value">${e.value}</span>
              <span class="exam-unit">${e.unit}</span>
            </div>
            <div class="exam-ref-range">${e.refText}</div>
          </div>
          <div>
            <span class="exam-status-tag ${e.tagClass}">${e.label}</span>
            <div class="text-xs text-muted mt-2">Coleta: ${e.date || 'Recente'}</div>
          </div>
        </div>
      `).join('');
    }

    // 3. Renderiza Diretrizes Nutricionais Clínicas (Recomendações automáticas dos exames)
    const recContainer = document.getElementById('clinicalDietRecommendations');
    if (recContainer) {
      if (analysis.recommendations.length === 0) {
        recContainer.innerHTML = `
          <div style="color: #059669; font-size: 0.88rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>✅</span>
            <strong>Todos os exames cadastrados estão dentro dos padrões ideais! Mantenha uma dieta equilibrada.</strong>
          </div>
        `;
      } else {
        recContainer.innerHTML = analysis.recommendations.map(r => `
          <div class="recommendation-item">
            <div class="rec-badge-icon">${r.status === 'alert' ? '🚨' : '⚠️'}</div>
            <div class="rec-content">
              <strong>Conduta para ${r.examName}:</strong>
              <p>${r.advice}</p>
            </div>
          </div>
        `).join('');
      }
    }
  },

  handleProfileSave(e) {
    e.preventDefault();
    const oldWeight = this.profile.weight;
    const newWeight = parseFloat(document.getElementById('profWeight').value);

    this.profile = {
      name: document.getElementById('profName').value,
      age: parseInt(document.getElementById('profAge').value, 10),
      gender: document.getElementById('profGender').value,
      height: parseFloat(document.getElementById('profHeight').value),
      weight: newWeight,
      initialWeight: this.profile.initialWeight || newWeight,
      targetWeight: parseFloat(document.getElementById('profTargetWeight').value),
      activityLevel: parseFloat(document.getElementById('profActivity').value),
      goal: document.getElementById('profGoal').value
    };

    // Registra no histórico de peso se mudou
    if (oldWeight !== newWeight) {
      Storage.addWeightRecord(this.currentDate, newWeight);
    }

    Storage.saveProfile(this.profile);
    this.renderAll();
    alert('Perfil antropométrico e metas salvos com sucesso!');
  },

  // ==========================================
  // PROJEÇÃO FUTURA DOS PRÓXIMOS DIAS
  // ==========================================
  renderProjections() {
    if (!this.profile || !this.profile.isConfigured || !this.profile.weight) {
      const banner = document.getElementById('forecastMilestoneBanner');
      if (banner) {
        banner.innerHTML = `
          <div class="forecast-main-headline">
            <h3>Projeção Preditiva de Peso</h3>
            <p>Preencha suas informações de peso, altura e meta no seu perfil para gerarmos sua curva de evolução dos próximos 90 dias.</p>
          </div>
          <button class="btn btn-outline" style="color: white; border-color: white;" onclick="app.openOnboardingModal()">Preencher Meus Dados</button>
        `;
      }
      const cardsGrid = document.getElementById('projectionCardsGrid');
      if (cardsGrid) cardsGrid.innerHTML = '';
      return;
    }

    const bmr = NutritionCalc.calculateBMR(this.profile.weight, this.profile.height, this.profile.age, this.profile.gender);
    const tdee = NutritionCalc.calculateTDEE(bmr, this.profile.activityLevel);
    const { targetCalories } = NutritionCalc.calculateCalorieGoal(tdee, this.profile.goal);

    const extraDeficit = parseInt(document.getElementById('simDeficitSlider')?.value || 0, 10);
    const extraExercise = parseInt(document.getElementById('simExerciseMins')?.value || 0, 10);

    const proj = ProjectionEngine.generateProjection({
      currentWeight: this.profile.weight,
      height: this.profile.height,
      age: this.profile.age,
      gender: this.profile.gender,
      activityLevel: this.profile.activityLevel,
      dailyCalorieIntake: targetCalories,
      targetWeight: this.profile.targetWeight,
      simulationExtraDeficit: extraDeficit,
      simulationExerciseMins: extraExercise
    });

    // 1. Banner Principal de Meta
    const banner = document.getElementById('forecastMilestoneBanner');
    if (banner) {
      const daysCountText = proj.daysToTarget !== null ? `${proj.daysToTarget} dias` : 'Ajustar plano';
      const targetDateText = proj.targetReachedDate ? `Data estimada: <strong>${proj.targetReachedDate}</strong>` : 'Manter consistência calórica';

      banner.innerHTML = `
        <div class="forecast-main-headline">
          <h3>Previsão para Atingir ${this.profile.targetWeight} kg</h3>
          <p>${targetDateText} &bull; Ritmo de evolução projetado: <strong>${Math.abs(proj.weeklyRate)} kg por semana</strong>.</p>
        </div>
        <div class="forecast-target-countdown">
          <div class="countdown-number">${daysCountText}</div>
          <div class="countdown-label">Tempo Previsto</div>
        </div>
      `;
    }

    // 2. Cards de Marcos Futuros (+7d, +14d, +30d, +60d, +90d)
    const cardsGrid = document.getElementById('projectionCardsGrid');
    if (cardsGrid) {
      const ms = proj.milestones;
      const periods = [
        { label: 'Em 7 Dias', data: ms.day7 },
        { label: 'Em 14 Dias', data: ms.day14 },
        { label: 'Em 30 Dias (1 Mês)', data: ms.day30 },
        { label: 'Em 60 Dias (2 Meses)', data: ms.day60 },
        { label: 'Em 90 Dias (3 Meses)', data: ms.day90 }
      ];

      cardsGrid.innerHTML = periods.map(p => `
        <div class="proj-period-card">
          <span class="proj-card-time">${p.label}</span>
          <span class="proj-card-weight">${p.data.weight} kg</span>
          <span class="proj-card-delta">${p.data.formattedDelta}</span>
          <span class="proj-card-date">${p.data.date}</span>
        </div>
      `).join('');
    }

    // 3. Atualiza simulador interativo
    this.renderSimulatorOutput(proj, extraDeficit, extraExercise);

    // 4. Renderiza gráfico
    this.renderProjectionsChart(proj);
  },

  renderSimulatorOutput(proj, extraDeficit, extraExercise) {
    const resBox = document.getElementById('simulationResults');
    if (!resBox) return;

    const extraBurnKcal = Math.round(extraDeficit + (extraExercise * 6.5));

    resBox.innerHTML = `
      <div class="sim-result-item">
        <span>Gasto / Déficit Extra Total:</span>
        <strong>${extraBurnKcal >= 0 ? `+${extraBurnKcal}` : extraBurnKcal} kcal/dia</strong>
      </div>
      <div class="sim-result-item">
        <span>Impacto em 30 Dias:</span>
        <strong style="color: #059669;">${proj.milestones.day30.weight} kg (${proj.milestones.day30.formattedDelta})</strong>
      </div>
      <div class="sim-result-item">
        <span>Previsão da Meta:</span>
        <strong>${proj.targetReachedDate || 'Contínuo'}</strong>
      </div>
      <p class="text-xs text-muted mt-2">Dica: Reduções graduais preservam mais massa muscular magra e mantêm a taxa metabólica ativa.</p>
    `;
  },

  updateSimulation() {
    const deficitSlider = document.getElementById('simDeficitSlider');
    const exerciseSlider = document.getElementById('simExerciseMins');
    const deficitVal = parseInt(deficitSlider.value, 10);
    const exerciseVal = parseInt(exerciseSlider.value, 10);

    document.getElementById('simDeficitDisplay').textContent = deficitVal >= 0 ? `+${deficitVal} kcal/dia` : `${deficitVal} kcal/dia`;
    document.getElementById('simExerciseDisplay').textContent = `${exerciseVal} min/dia`;

    this.renderProjections();
  },

  refreshProjections() {
    this.renderProjections();
  },

  renderProjectionsChart(projectionData = null) {
    if (!projectionData) {
      const bmr = NutritionCalc.calculateBMR(this.profile.weight, this.profile.height, this.profile.age, this.profile.gender);
      const tdee = NutritionCalc.calculateTDEE(bmr, this.profile.activityLevel);
      const { targetCalories } = NutritionCalc.calculateCalorieGoal(tdee, this.profile.goal);
      projectionData = ProjectionEngine.generateProjection({
        currentWeight: this.profile.weight,
        height: this.profile.height,
        age: this.profile.age,
        gender: this.profile.gender,
        activityLevel: this.profile.activityLevel,
        dailyCalorieIntake: targetCalories,
        targetWeight: this.profile.targetWeight
      });
    }

    const historyPoints = Storage.getWeightHistory();
    const canvas = document.getElementById('weightProjectionChart');
    const fallbackBox = document.getElementById('chartFallbackMessage');

    // Se Chart.js estiver disponível na janela
    if (typeof Chart !== 'undefined' && canvas) {
      fallbackBox.classList.add('hidden');
      canvas.style.display = 'block';

      // Prepara labels e dados
      const historyLabels = historyPoints.map(h => {
        const d = new Date(h.date + 'T00:00:00');
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      });
      const historyWeights = historyPoints.map(h => h.weight);

      // Amostra de pontos da projeção futura (a cada 3 dias para ficar nítido)
      const sampledProj = projectionData.dailyPoints.filter((_, idx) => idx % 3 === 0 || idx === projectionData.dailyPoints.length - 1);
      const projLabels = sampledProj.map(p => p.displayDate);
      const projWeights = sampledProj.map(p => p.weight);

      const allLabels = [...historyLabels, ...projLabels];

      // Array com histórico + nulos para projeção
      const histDataPadded = [...historyWeights, ...Array(projWeights.length).fill(null)];
      // Array com nulos no histórico + projeção (conecta no último ponto do histórico)
      const lastHistWeight = historyWeights[historyWeights.length - 1] || this.profile.weight;
      const projDataPadded = [...Array(historyWeights.length - 1).fill(null), lastHistWeight, ...projWeights];

      // Linha constante da meta
      const goalLineData = Array(allLabels.length).fill(this.profile.targetWeight);

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const ctx = canvas.getContext('2d');
      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: allLabels,
          datasets: [
            {
              label: 'Histórico Real',
              data: histDataPadded,
              borderColor: '#4f46e5',
              backgroundColor: '#4f46e5',
              borderWidth: 3,
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.2
            },
            {
              label: 'Projeção Futura',
              data: projDataPadded,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 3,
              borderDash: [5, 5],
              fill: true,
              pointRadius: 2,
              pointHoverRadius: 5,
              tension: 0.25
            },
            {
              label: 'Meta',
              data: goalLineData,
              borderColor: '#f59e0b',
              borderWidth: 2,
              borderDash: [8, 4],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `Peso: ${context.parsed.y} kg`
              }
            }
          },
          scales: {
            y: {
              grid: { color: '#f1f5f9' },
              ticks: {
                callback: (v) => `${v} kg`
              }
            },
            x: {
              grid: { display: false },
              ticks: { maxTicksLimit: 12 }
            }
          }
        }
      });
    } else {
      // Fallback Nativo com SVG puro de alta qualidade (100% offline)
      if (canvas) canvas.style.display = 'none';
      fallbackBox.classList.remove('hidden');
      ProjectionEngine.renderNativeSvgChart(
        'nativeSvgChartContainer',
        projectionData.dailyPoints,
        this.profile.weight,
        this.profile.targetWeight,
        historyPoints
      );
    }
  },

  // ==========================================
  // MINHA REALIDADE ALIMENTAR & CARDÁPIO SOB MEDIDA
  // ==========================================
  renderRealityTab() {
    if (!this.realityPrefs) {
      this.realityPrefs = Storage.getRealityPrefs();
    }

    // Atualiza controles de refeição e estilo
    const mealCountSelect = document.getElementById('realityMealCount');
    const styleSelect = document.getElementById('realityStyle');
    if (mealCountSelect) mealCountSelect.value = String(this.realityPrefs.mealCount || 4);
    if (styleSelect) styleSelect.value = this.realityPrefs.routineStyle || 'balanced';

    // Atualiza contador
    const countText = document.getElementById('realitySelectedCountText');
    if (countText) {
      countText.textContent = `${this.realityPrefs.selectedFoodIds.length} alimentos selecionados para a sua realidade.`;
    }

    // Agrupa o banco de alimentos em categorias intuitivas para a seleção
    const container = document.getElementById('realityCategoriesContainer');
    if (!container) return;

    const categoriesMap = [
      {
        title: '🍚 Carboidratos & Cereais do Dia a Dia',
        cats: ['Cereais', 'Leguminosas', 'Tubérculos', 'Pães', 'Massas']
      },
      {
        title: '🥩 Proteínas (Carnes, Peixes, Ovos & Suplementos)',
        cats: ['Carnes & Aves', 'Carnes Bovinas', 'Peixes & Frutos do Mar', 'Ovos', 'Suplementos']
      },
      {
        title: '🥛 Laticínios & Queijos',
        cats: ['Laticínios']
      },
      {
        title: '🍎 Frutas Acessíveis & Sobremesas Naturais',
        cats: ['Frutas']
      },
      {
        title: '🥬 Vegetais, Folhas & Saladas',
        cats: ['Vegetais']
      },
      {
        title: '🥑 Gorduras Boas, Sementes & Castanhas',
        cats: ['Gorduras & Óleos', 'Oleaginosas', 'Sementes']
      }
    ];

    container.innerHTML = categoriesMap.map(group => {
      const foodsInGroup = FOODS_DATABASE.filter(f => group.cats.includes(f.category));
      const chipsHtml = foodsInGroup.map(food => {
        const isSelected = this.realityPrefs.selectedFoodIds.includes(food.id);
        return `
          <button type="button" class="food-chip ${isSelected ? 'selected' : ''}" onclick="app.toggleRealityFood('${food.id}')">
            <span class="chip-check">${isSelected ? '✓' : ''}</span>
            <span>${food.name}</span>
          </button>
        `;
      }).join('');

      return `
        <div class="reality-category-card">
          <div class="reality-cat-header">
            <span class="reality-cat-title">${group.title}</span>
            <span class="text-xs text-muted">${foodsInGroup.filter(f => this.realityPrefs.selectedFoodIds.includes(f.id)).length}/${foodsInGroup.length}</span>
          </div>
          <div class="food-chip-group">
            ${chipsHtml}
          </div>
        </div>
      `;
    }).join('');

    // Gera e exibe o cardápio da realidade automaticamente
    this.generateAndShowRealityDiet(false);
  },

  toggleRealityFood(foodId) {
    if (!this.realityPrefs.selectedFoodIds) this.realityPrefs.selectedFoodIds = [];
    const idx = this.realityPrefs.selectedFoodIds.indexOf(foodId);
    if (idx >= 0) {
      this.realityPrefs.selectedFoodIds.splice(idx, 1);
    } else {
      this.realityPrefs.selectedFoodIds.push(foodId);
    }

    Storage.saveRealityPrefs(this.realityPrefs);
    this.renderRealityTab();
  },

  setRealityPreset(preset) {
    if (preset === 'brazilian') {
      this.realityPrefs.selectedFoodIds = [
        'arroz_branco', 'feijao_carioca', 'frango_grelhado', 'ovo_mexido',
        'pao_frances', 'banana_prata', 'aveia_flocos', 'alface_crespa',
        'tomate_salada', 'azeite_oliva', 'leite_desnatado'
      ];
    } else if (preset === 'budget') {
      this.realityPrefs.selectedFoodIds = [
        'arroz_branco', 'feijao_carioca', 'ovo_cozido', 'ovo_mexido',
        'frango_desfiado', 'banana_prata', 'batata_inglesa', 'aveia_flocos',
        'alface_crespa', 'cenoura_crua'
      ];
    } else if (preset === 'fitness') {
      this.realityPrefs.selectedFoodIds = [
        'arroz_integral', 'feijao_preto', 'frango_grelhado', 'patinho_grelhado',
        'ovo_cozido', 'clara_ovo', 'whey_protein', 'batata_doce', 'aveia_flocos',
        'banana_prata', 'queijo_cottage', 'azeite_oliva', 'pasta_amendoim', 'brocolis_cozido'
      ];
    } else if (preset === 'all') {
      this.realityPrefs.selectedFoodIds = FOODS_DATABASE.map(f => f.id);
    } else if (preset === 'none') {
      this.realityPrefs.selectedFoodIds = [];
    }

    Storage.saveRealityPrefs(this.realityPrefs);
    this.renderRealityTab();
  },

  onRealitySettingsChange() {
    const mealCount = parseInt(document.getElementById('realityMealCount').value, 10);
    const style = document.getElementById('realityStyle').value;

    this.realityPrefs.mealCount = mealCount;
    this.realityPrefs.routineStyle = style;

    Storage.saveRealityPrefs(this.realityPrefs);
    this.generateAndShowRealityDiet(false);
  },

  generateAndShowRealityDiet(showFeedback = true) {
    if (!this.profile || !this.profile.isConfigured || !this.profile.weight) {
      const banner = document.getElementById('realityPrecisionBanner');
      if (banner) {
        banner.innerHTML = `
          <div style="padding: 1.25rem; color: #065f46; font-size: 0.9rem; text-align: center; width: 100%;">
            👋 <strong>Configuração necessária:</strong> Preencha suas informações de peso e altura para que possamos balancear as porções exatas das suas comidas!
            <div class="mt-3">
              <button class="btn btn-primary btn-sm" onclick="app.openOnboardingModal()">Preencher Meus Dados</button>
            </div>
          </div>
        `;
      }
      return;
    }

    const bmr = NutritionCalc.calculateBMR(this.profile.weight, this.profile.height, this.profile.age, this.profile.gender);
    const tdee = NutritionCalc.calculateTDEE(bmr, this.profile.activityLevel);
    const { targetCalories } = NutritionCalc.calculateCalorieGoal(tdee, this.profile.goal);
    const macroTargets = NutritionCalc.calculateMacroTargets(targetCalories, this.profile.weight, this.profile.goal);

    const generated = DietBuilder.buildDiet({
      targetCalories,
      macroTargets,
      selectedFoodIds: this.realityPrefs.selectedFoodIds || [],
      mealCount: this.realityPrefs.mealCount || 4,
      routineStyle: this.realityPrefs.routineStyle || 'balanced',
      exams: this.exams
    });

    this.lastGeneratedRealityDiet = generated;

    // Atualiza banner de precisão
    const banner = document.getElementById('realityPrecisionBanner');
    if (banner) {
      banner.innerHTML = `
        <div class="reality-stat-pill">
          <span class="label">Meta do Seu Perfil:</span>
          <span class="value">${targetCalories} kcal</span>
        </div>
        <div class="reality-stat-pill">
          <span class="label">Total com Suas Comidas:</span>
          <span class="value" style="color: #059669;">${generated.totalCalories} kcal</span>
        </div>
        <div class="reality-stat-pill">
          <span class="label">Precisão Nutricional:</span>
          <span class="value" style="color: #4f46e5;">${generated.accuracy}%</span>
        </div>
        <div class="reality-stat-pill">
          <span class="label">Carboidratos:</span>
          <span class="value">${generated.totalCarbs}g <span class="text-xs text-muted">/ ${generated.targetCarbs}g</span></span>
        </div>
        <div class="reality-stat-pill">
          <span class="label">Proteínas:</span>
          <span class="value">${generated.totalProtein}g <span class="text-xs text-muted">/ ${generated.targetProtein}g</span></span>
        </div>
        <div class="reality-stat-pill">
          <span class="label">Gorduras:</span>
          <span class="value">${generated.totalFats}g <span class="text-xs text-muted">/ ${generated.targetFats}g</span></span>
        </div>
      `;
    }

    // Atualiza grid de refeições geradas
    const grid = document.getElementById('realityMealsGrid');
    if (grid) {
      grid.innerHTML = generated.meals.map(meal => {
        const itemsHtml = meal.items.map(item => `
          <div class="reality-item-row">
            <div>
              <span class="reality-item-name">${item.name}</span>
              <div class="reality-item-cals">C: ${item.carbs}g &bull; P: ${item.protein}g &bull; G: ${item.fats}g</div>
            </div>
            <div style="text-align: right;">
              <span class="reality-item-portion">${item.quantity} ${item.unit || 'g'}</span>
              <div class="reality-item-cals" style="font-weight: 700; color: #0f172a;">${item.kcal} kcal</div>
            </div>
          </div>
        `).join('');

        return `
          <div class="reality-meal-card">
            <div>
              <div class="reality-meal-header">
                <h4>🍽️ ${meal.name}</h4>
                <span class="badge badge-meta">${meal.totalKcal} kcal</span>
              </div>
              <div class="reality-meal-items-list">
                ${itemsHtml}
              </div>
            </div>
            <div class="reality-meal-footer-macros">
              <span>Carb: <strong>${meal.totalCarbs}g</strong></span>
              <span>Prot: <strong>${meal.totalProtein}g</strong></span>
              <span>Gord: <strong>${meal.totalFats}g</strong></span>
              <span>Fibras: <strong>${meal.totalFiber}g</strong></span>
            </div>
          </div>
        `;
      }).join('');
    }

    if (showFeedback) {
      const section = document.getElementById('generatedRealityDietSection');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  },

  applyRealityDietToDiary() {
    if (!this.lastGeneratedRealityDiet || !this.lastGeneratedRealityDiet.meals) {
      alert('Monte o cardápio primeiro clicando em "Montar Cardápio com Minhas Comidas".');
      return;
    }

    if (confirm('Deseja transferir automaticamente todas essas refeições e porções para o seu Diário Alimentar de Hoje? (Os alimentos do dia serão atualizados).')) {
      const newMealsDiary = {
        breakfast: [],
        lunch: [],
        snack: [],
        dinner: [],
        supper: []
      };

      this.lastGeneratedRealityDiet.meals.forEach(m => {
        let diaryKey = 'lunch';
        if (m.id === 'breakfast') diaryKey = 'breakfast';
        else if (m.id === 'lunch') diaryKey = 'lunch';
        else if (m.id === 'snack' || m.id === 'morning_snack') diaryKey = 'snack';
        else if (m.id === 'dinner') diaryKey = 'dinner';

        if (newMealsDiary[diaryKey]) {
          newMealsDiary[diaryKey].push(...m.items);
        }
      });

      Storage.saveDiary(this.currentDate, newMealsDiary);
      this.diary = Storage.getDiary(this.currentDate);

      this.renderAll();
      alert('🎉 Sucesso! Seu cardápio personalizado foi lançado no Diário Alimentar de hoje. Você já pode acompanhar suas calorias e macros consumidos!');
    }
  },

  // ==========================================
  // CARDÁPIO SUGERIDO INTELIGENTE
  // ==========================================
  renderMealPlan() {
    const container = document.getElementById('suggestedMealPlanContainer');
    if (!container) return;

    if (!this.profile || !this.profile.isConfigured || !this.profile.weight) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; color: #94a3b8; background: white; border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
          <span style="font-size: 2rem;">🥗</span>
          <h4 style="margin: 0.5rem 0; color: #1e293b;">Aguardando Configuração do Perfil</h4>
          <p style="font-size: 0.85rem;">O cardápio inteligente será gerado assim que você informar seu peso, altura e objetivo.</p>
          <button class="btn btn-primary btn-sm mt-3" onclick="app.openOnboardingModal()">Preencher Meus Dados</button>
        </div>
      `;
      return;
    }

    const bmr = NutritionCalc.calculateBMR(this.profile.weight, this.profile.height, this.profile.age, this.profile.gender);
    const tdee = NutritionCalc.calculateTDEE(bmr, this.profile.activityLevel);
    const { targetCalories } = NutritionCalc.calculateCalorieGoal(tdee, this.profile.goal);

    // Ajusta proporção de calorias por refeição
    const breakfastKcal = Math.round(targetCalories * 0.25);
    const lunchKcal = Math.round(targetCalories * 0.35);
    const snackKcal = Math.round(targetCalories * 0.15);
    const dinnerKcal = Math.round(targetCalories * 0.25);

    // Análise de exames para personalização dos itens do cardápio
    const analysis = ExamsAnalyzer.analyzeAllExams(this.exams);
    const hasHighTriglycerides = this.exams.some(e => e.examId === 'triglycerides' && e.value >= 150);
    const hasHighLdl = this.exams.some(e => e.examId === 'ldl' && e.value >= 130);
    const hasLowVitD = this.exams.some(e => e.examId === 'vitamin_d' && e.value < 30);

    const mealPlans = [
      {
        name: 'Café da Manhã',
        targetKcal: breakfastKcal,
        items: [
          hasHighLdl ? 'Aveia em flocos (40g) com canela e maçã picada (Reduz LDL)' : 'Pão integral 100% (2 fatias)',
          'Ovos mexidos com fio de azeite (2 unidades) ou Queijo Cottage (60g)',
          'Café preto sem açúcar ou Chá Verde antioxidante'
        ],
        tip: hasHighTriglycerides ? 'Evite sucos de fruta coados; prefira a fruta inteira com bagaço.' : 'Proteína pela manhã aumenta a saciedade ao longo de todo o dia.'
      },
      {
        name: 'Almoço Balanceado',
        targetKcal: lunchKcal,
        items: [
          'Arroz integral (130g) + Feijão carioca (1 concha média)',
          hasLowVitD ? 'Filé de Salmão ou Tilápia grelhada (160g) - Fonte de Vitamina D e Ômega 3' : 'Peito de frango grelhado ou Patinho moído magro (150g)',
          'Prato farto de salada: alface crespa, tomate, cenoura ralada e brócolis no vapor',
          'Azeite de oliva extra virgem cru (1 colher de sobremesa - 10ml)'
        ],
        tip: 'Tempere a salada com limão espremido: a vitamina C otimiza a absorção do ferro dos vegetais.'
      },
      {
        name: 'Lanche da Tarde',
        targetKcal: snackKcal,
        items: [
          'Iogurte natural desnatado (1 pote 170g)',
          'Banana prata ou 1 xícara de morangos frescos',
          'Sementes de chia ou linhaça dourada (1 colher de sopa - 15g)'
        ],
        tip: 'As fibras da semente e do iogurte estabilizam a glicemia e evitam compulsão no jantar.'
      },
      {
        name: 'Jantar Leve & Reparador',
        targetKcal: dinnerKcal,
        items: [
          'Batata-doce ou Mandioca cozida (120g)',
          'Peito de frango desfiado ou Omelete de 2 ovos com espinafre',
          'Legumes assados ou salada verde com azeite de oliva'
        ],
        tip: 'Jantar com boa densidade de nutrientes e menor teor de gorduras pesadas melhora a qualidade do sono profundo.'
      }
    ];

    container.innerHTML = mealPlans.map(m => `
      <div class="mealplan-card">
        <div class="mealplan-card-header">
          <h4>🍽️ ${m.name}</h4>
          <span class="badge badge-meta">~${m.targetKcal} kcal</span>
        </div>
        <ul class="mealplan-item-list">
          ${m.items.map(item => `
            <li class="mealplan-item">
              <span>&bull; ${item}</span>
            </li>
          `).join('')}
        </ul>
        <div class="mealplan-tip">
          💡 <strong>Dica Nutricional:</strong> ${m.tip}
        </div>
      </div>
    `).join('');
  },

  // ==========================================
  // MODAL DE ALIMENTOS
  // ==========================================
  openAddFoodModal(mealKey = 'lunch') {
    this.targetMealKey = mealKey;
    const select = document.getElementById('foodMealSelect');
    if (select) select.value = mealKey;

    this.switchFoodSubtab('search');
    this.searchFoods('');
    this.selectedFoodObj = null;
    document.getElementById('selectedFoodDetails').classList.add('hidden');

    document.getElementById('addFoodModal').classList.remove('hidden');
  },

  closeModal(modalId) {
    document.getElementById(modalId)?.classList.add('hidden');
  },

  switchFoodSubtab(subtab) {
    const searchTab = document.getElementById('subtabSearchFood');
    const customTab = document.getElementById('subtabCustomFood');
    const btnSearch = document.getElementById('btnTabSearchFood');
    const btnCustom = document.getElementById('btnTabCustomFood');

    if (subtab === 'search') {
      searchTab.classList.remove('hidden');
      customTab.classList.add('hidden');
      btnSearch.classList.add('active');
      btnCustom.classList.remove('active');
    } else {
      searchTab.classList.add('hidden');
      customTab.classList.remove('hidden');
      btnSearch.classList.remove('active');
      btnCustom.classList.add('active');
    }
  },

  searchFoods(query) {
    const resultsContainer = document.getElementById('foodSearchResults');
    if (!resultsContainer) return;

    const term = query.toLowerCase().trim();
    const filtered = FOODS_DATABASE.filter(f => 
      f.name.toLowerCase().includes(term) || f.category.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `<div style="padding: 1rem; text-align: center; color: #94a3b8; font-size: 0.82rem;">Nenhum alimento encontrado. Use a aba "Alimento Personalizado".</div>`;
      return;
    }

    resultsContainer.innerHTML = filtered.map(f => `
      <div class="food-search-item" onclick="app.selectFood('${f.id}')">
        <div>
          <strong style="font-size: 0.86rem; color: #1e293b;">${f.name}</strong>
          <div class="text-xs text-muted">${f.category} &bull; ${f.kcal} kcal / 100${f.unit || 'g'}</div>
        </div>
        <span class="text-xs font-semibold text-primary">Selecionar &rarr;</span>
      </div>
    `).join('');
  },

  selectFood(foodId) {
    const food = FOODS_DATABASE.find(f => f.id === foodId);
    if (!food) return;

    this.selectedFoodObj = food;

    document.getElementById('selFoodName').textContent = food.name;
    document.getElementById('selFoodCategory').textContent = food.category;
    document.getElementById('selFoodUnit').textContent = food.unit === 'ml' ? 'ml' : 'gramas';

    const qtyInput = document.getElementById('foodPortionQty');
    qtyInput.value = food.defaultPortion || 100;

    this.recalcSelectedFoodPortion();
    document.getElementById('selectedFoodDetails').classList.remove('hidden');
  },

  recalcSelectedFoodPortion() {
    if (!this.selectedFoodObj) return;

    const qty = parseFloat(document.getElementById('foodPortionQty').value) || 0;
    const calculated = calculateFoodPortion(this.selectedFoodObj, qty);

    const preview = document.getElementById('selFoodMacrosPreview');
    preview.innerHTML = `
      <div><strong>${calculated.kcal}</strong> kcal</div>
      <div>Carb: <strong>${calculated.carbs}g</strong></div>
      <div>Prot: <strong>${calculated.protein}g</strong></div>
      <div>Gord: <strong>${calculated.fats}g</strong></div>
    `;
  },

  confirmAddFood() {
    const mealKey = document.getElementById('foodMealSelect').value;
    const isCustom = !document.getElementById('subtabCustomFood').classList.contains('hidden');

    let foodEntry = null;

    if (isCustom) {
      const name = document.getElementById('custFoodName').value.trim();
      const kcal = parseInt(document.getElementById('custFoodKcal').value, 10);
      const carbs = parseFloat(document.getElementById('custFoodCarb').value) || 0;
      const protein = parseFloat(document.getElementById('custFoodProt').value) || 0;
      const fats = parseFloat(document.getElementById('custFoodFat').value) || 0;

      if (!name || isNaN(kcal)) {
        alert('Por favor informe o nome do alimento e as calorias.');
        return;
      }

      foodEntry = {
        id: 'cust_' + Date.now(),
        name,
        quantity: 1,
        unit: 'porção',
        kcal,
        carbs,
        protein,
        fats,
        fiber: 0
      };
    } else {
      if (!this.selectedFoodObj) {
        alert('Selecione um alimento da lista.');
        return;
      }
      const qty = parseFloat(document.getElementById('foodPortionQty').value) || 100;
      foodEntry = calculateFoodPortion(this.selectedFoodObj, qty);
    }

    Storage.addFoodEntry(this.currentDate, mealKey, foodEntry);
    this.diary = Storage.getDiary(this.currentDate);

    this.closeModal('addFoodModal');
    this.renderAll();
  },

  removeFood(mealKey, index) {
    Storage.removeFoodEntry(this.currentDate, mealKey, index);
    this.diary = Storage.getDiary(this.currentDate);
    this.renderAll();
  },

  // ==========================================
  // MODAL DE EXAMES
  // ==========================================
  openAddExamModal() {
    const select = document.getElementById('examTypeSelect');
    if (select) this.onExamTypeChange(select.value);
    document.getElementById('addExamModal').classList.remove('hidden');
  },

  onExamTypeChange(examId) {
    const meta = EXAMS_CATALOG[examId];
    const hint = document.getElementById('examReferenceHint');
    if (meta && hint) {
      hint.innerHTML = `<strong>Valores de Referência Clínicos:</strong><br>${meta.refText}`;
    }
  },

  handleExamSubmit(e) {
    e.preventDefault();
    const examId = document.getElementById('examTypeSelect').value;
    const value = parseFloat(document.getElementById('examValueInput').value);
    const date = document.getElementById('examDateInput').value;
    const notes = document.getElementById('examNotesInput').value.trim();

    if (isNaN(value)) {
      alert('Informe um valor numérico válido.');
      return;
    }

    Storage.upsertExam({ examId, value, date, notes });
    this.exams = Storage.getExams();

    this.closeModal('addExamModal');
    this.renderAll();
    alert('Exame laboratorial registrado com sucesso!');
  },

  deleteExam(examId) {
    if (confirm('Deseja excluir o registro deste exame?')) {
      Storage.deleteExam(examId);
      this.exams = Storage.getExams();
      this.renderAll();
    }
  },

  // ==========================================
  // HIDRATAÇÃO
  // ==========================================
  addWater(delta) {
    this.water = Math.max(0, this.water + delta);
    Storage.setWater(this.currentDate, this.water);
    this.renderDashboard();
  },

  resetWater() {
    this.water = 0;
    Storage.setWater(this.currentDate, 0);
    this.renderDashboard();
  },

  // ==========================================
  // BACKUP & RESET
  // ==========================================
  exportData() {
    const dataStr = Storage.exportBackup();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrifit_backup_${this.currentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const ok = Storage.importBackup(e.target.result);
      if (ok) {
        alert('Backup restaurado com sucesso!');
        location.reload();
      } else {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  },

  // ==========================================
  // ONBOARDING & NOVO USUÁRIO ZERADO
  // ==========================================
  openOnboardingModal() {
    const modal = document.getElementById('onboardingModal');
    if (!modal) return;

    // Popula chips de alimentos populares para a etapa 2
    const chipsContainer = document.getElementById('onboardingFoodChips');
    if (chipsContainer) {
      const popularFoodIds = [
        'arroz_branco', 'feijao_carioca', 'frango_grelhado', 'ovo_mexido',
        'pao_frances', 'pao_integral', 'banana_prata', 'aveia_flocos',
        'batata_doce', 'alface_crespa', 'tomate_salada', 'azeite_oliva',
        'leite_desnatado', 'iogurte_natural_desn', 'queijo_minas_frescal'
      ];

      const currentSelected = this.realityPrefs?.selectedFoodIds || [];

      chipsContainer.innerHTML = popularFoodIds.map(fId => {
        const food = FOODS_DATABASE.find(f => f.id === fId);
        if (!food) return '';
        const isSelected = currentSelected.includes(food.id);
        return `
          <button type="button" class="food-chip ${isSelected ? 'selected' : ''}" onclick="app.toggleOnboardingFood('${food.id}', this)">
            <span class="chip-check">${isSelected ? '✓' : ''}</span>
            <span>${food.name}</span>
          </button>
        `;
      }).join('');
    }

    // Se já tiver dados no perfil, preenche inputs
    if (this.profile && this.profile.isConfigured) {
      document.getElementById('onbName').value = this.profile.name || '';
      document.getElementById('onbAge').value = this.profile.age || '';
      document.getElementById('onbGender').value = this.profile.gender || 'male';
      document.getElementById('onbHeight').value = this.profile.height || '';
      document.getElementById('onbWeight').value = this.profile.weight || '';
      document.getElementById('onbTargetWeight').value = this.profile.targetWeight || '';
      document.getElementById('onbActivity').value = this.profile.activityLevel || '1.55';
      document.getElementById('onbGoal').value = this.profile.goal || 'cut_mod';
    }

    modal.classList.remove('hidden');
  },

  toggleOnboardingFood(foodId, buttonEl) {
    if (!this.realityPrefs) this.realityPrefs = Storage.getRealityPrefs();
    if (!this.realityPrefs.selectedFoodIds) this.realityPrefs.selectedFoodIds = [];

    const idx = this.realityPrefs.selectedFoodIds.indexOf(foodId);
    if (idx >= 0) {
      this.realityPrefs.selectedFoodIds.splice(idx, 1);
      buttonEl.classList.remove('selected');
      buttonEl.querySelector('.chip-check').textContent = '';
    } else {
      this.realityPrefs.selectedFoodIds.push(foodId);
      buttonEl.classList.add('selected');
      buttonEl.querySelector('.chip-check').textContent = '✓';
    }
  },

  setOnboardingPreset(preset) {
    let ids = [];
    if (preset === 'brazilian') {
      ids = ['arroz_branco', 'feijao_carioca', 'frango_grelhado', 'ovo_mexido', 'pao_frances', 'banana_prata', 'aveia_flocos', 'alface_crespa', 'tomate_salada', 'azeite_oliva'];
    } else if (preset === 'budget') {
      ids = ['arroz_branco', 'feijao_carioca', 'ovo_mexido', 'frango_desfiado', 'banana_prata', 'batata_inglesa', 'aveia_flocos', 'alface_crespa'];
    } else if (preset === 'fitness') {
      ids = ['arroz_integral', 'feijao_preto', 'frango_grelhado', 'ovo_cozido', 'whey_protein', 'batata_doce', 'aveia_flocos', 'banana_prata', 'azeite_oliva'];
    }

    if (!this.realityPrefs) this.realityPrefs = Storage.getRealityPrefs();
    this.realityPrefs.selectedFoodIds = ids;

    // Atualiza visual dos botões no onboarding
    const container = document.getElementById('onboardingFoodChips');
    if (container) {
      container.querySelectorAll('.food-chip').forEach(btn => {
        const onClickAttr = btn.getAttribute('onclick') || '';
        const match = onClickAttr.match(/'([^']+)'/);
        if (match && match[1]) {
          const fId = match[1];
          const isSelected = ids.includes(fId);
          btn.classList.toggle('selected', isSelected);
          btn.querySelector('.chip-check').textContent = isSelected ? '✓' : '';
        }
      });
    }
  },

  handleOnboardingSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('onbName').value.trim();
    const age = parseInt(document.getElementById('onbAge').value, 10);
    const gender = document.getElementById('onbGender').value;
    const height = parseFloat(document.getElementById('onbHeight').value);
    const weight = parseFloat(document.getElementById('onbWeight').value);
    const targetWeight = parseFloat(document.getElementById('onbTargetWeight').value);
    const activityLevel = parseFloat(document.getElementById('onbActivity').value);
    const goal = document.getElementById('onbGoal').value;

    if (!name || isNaN(weight) || isNaN(height) || isNaN(targetWeight)) {
      alert('Por favor preencha todos os campos obrigatórios de nome, peso, altura e meta.');
      return;
    }

    // Se nenhuma comida foi selecionada no onboarding, define os básicos
    if (!this.realityPrefs || !this.realityPrefs.selectedFoodIds || this.realityPrefs.selectedFoodIds.length === 0) {
      if (!this.realityPrefs) this.realityPrefs = Storage.getRealityPrefs();
      this.realityPrefs.selectedFoodIds = ['arroz_branco', 'feijao_carioca', 'frango_grelhado', 'ovo_mexido', 'pao_frances', 'banana_prata', 'aveia_flocos', 'alface_crespa', 'tomate_salada', 'azeite_oliva'];
    }

    this.profile = {
      name,
      age,
      gender,
      height,
      weight,
      initialWeight: weight,
      targetWeight,
      activityLevel,
      goal,
      isConfigured: true
    };

    Storage.saveProfile(this.profile);
    Storage.addWeightRecord(this.currentDate, weight);
    Storage.saveRealityPrefs(this.realityPrefs);

    // Salva exames opcionais preenchidos
    const glucoseVal = parseFloat(document.getElementById('onbGlucose').value);
    const trigVal = parseFloat(document.getElementById('onbTriglycerides').value);
    const ldlVal = parseFloat(document.getElementById('onbLdl').value);
    const vitDVal = parseFloat(document.getElementById('onbVitD').value);

    if (!isNaN(glucoseVal)) Storage.upsertExam({ examId: 'glucose', value: glucoseVal, date: this.currentDate, notes: 'Informado no cadastro' });
    if (!isNaN(trigVal)) Storage.upsertExam({ examId: 'triglycerides', value: trigVal, date: this.currentDate, notes: 'Informado no cadastro' });
    if (!isNaN(ldlVal)) Storage.upsertExam({ examId: 'ldl', value: ldlVal, date: this.currentDate, notes: 'Informado no cadastro' });
    if (!isNaN(vitDVal)) Storage.upsertExam({ examId: 'vitamin_d', value: vitDVal, date: this.currentDate, notes: 'Informado no cadastro' });

    this.exams = Storage.getExams();

    this.closeModal('onboardingModal');
    this.renderAll();

    alert(`🎉 Bem-vindo(a), ${name.split(' ')[0]}!\nSeu plano nutricional, gasto energético, projeção para os próximos 90 dias e cardápios foram calculados com sucesso com base nas suas medidas e na sua realidade alimentar!`);
  },

  resetToNewUser() {
    if (confirm('Tem certeza de que deseja zerar todos os dados e começar como um novo usuário do zero?')) {
      Storage.resetDemo();
    }
  },

  resetDemoData() {
    if (confirm('Tem certeza de que deseja restaurar os dados e começar como um novo usuário zerado?')) {
      Storage.resetDemo();
    }
  }
};

// Inicialização automática ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// ==========================================
// BLOQUEIO DE ZOOM E ARRASTOS NATIVOS (APP-LIKE FEEL)
// ==========================================
// 1. Bloqueia gesto de pinça (pinch-to-zoom com 2 dedos)
document.addEventListener('touchstart', (e) => {
  if (e.touches && e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// 2. Bloqueia eventos de gestos do Safari/WebKit
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

// 3. Bloqueio de zoom por duplo toque tratado nativamente via CSS touch-action: manipulation
// (evita bloquear eventos sintéticos de clique nos botões mobile)

// 4. Bloqueia arrasto de imagens e elementos nativos
document.addEventListener('dragstart', (e) => {
  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
  }
});
