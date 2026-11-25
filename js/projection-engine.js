/**
 * Módulo de Projeção Preditiva de Peso e Evolução Metabólica
 * Baseado no modelo cinético de balanço de energia de Wishnofsky
 * com compensação de adaptação metabólica progressiva
 */

const ProjectionEngine = {
  KCAL_PER_KG_FAT: 7700, // 1 kg de tecido adiposo equivale a aproximadamente 7.700 kcal

  /**
   * Gera a projeção diária detalhada para os próximos N dias (padrão: 90 dias)
   * @param {Object} params Parâmetros do perfil
   * @returns {Object} Dados da projeção e marcos
   */
  generateProjection(params) {
    const {
      currentWeight,
      height,
      age,
      gender,
      activityLevel,
      dailyCalorieIntake, // calorias diárias que a pessoa consome
      targetWeight,
      simulationExtraDeficit = 0, // ajuste do simulador (kcal)
      simulationExerciseMins = 0  // minutos extras de exercício
    } = params;

    // Queima calórica do exercício extra (média ~6.5 kcal por minuto de cardio moderado)
    const exerciseBurnExtra = simulationExerciseMins * 6.5;

    // Calorias líquidas diárias no cenário simulado
    const effectiveIntake = dailyCalorieIntake - simulationExtraDeficit;

    const daysCount = 90;
    const dailyPoints = [];
    let simulatedWeight = currentWeight;
    let daysToTarget = null;
    let targetReachedDate = null;

    const startDate = new Date();

    for (let day = 0; day <= daysCount; day++) {
      const pointDate = new Date(startDate);
      pointDate.setDate(startDate.getDate() + day);

      const dateStr = pointDate.toISOString().split('T')[0];
      const displayDate = pointDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      // Recalcula BMR adaptativo para o peso projetado naquele dia
      const dynamicBmr = NutritionCalc.calculateBMR(simulatedWeight, height, age, gender);
      const dynamicTdee = NutritionCalc.calculateTDEE(dynamicBmr, activityLevel) + exerciseBurnExtra;

      // Balanço calórico do dia
      const dailyBalance = effectiveIntake - dynamicTdee; // Negativo = déficit (perda), Positivo = superávit (ganho)

      // Variação de peso estimada no dia (kg)
      const weightDeltaKg = dailyBalance / this.KCAL_PER_KG_FAT;

      dailyPoints.push({
        day,
        date: dateStr,
        displayDate,
        weight: Number(simulatedWeight.toFixed(2)),
        bmr: dynamicBmr,
        tdee: Math.round(dynamicTdee),
        dailyBalance: Math.round(dailyBalance)
      });

      // Checa se atingiu o peso alvo
      if (daysToTarget === null) {
        if (targetWeight <= currentWeight) {
          // Objetivo de emagrecimento
          if (simulatedWeight <= targetWeight) {
            daysToTarget = day;
            targetReachedDate = pointDate;
          }
        } else {
          // Objetivo de ganho de massa
          if (simulatedWeight >= targetWeight) {
            daysToTarget = day;
            targetReachedDate = pointDate;
          }
        }
      }

      // Atualiza peso para o próximo dia
      simulatedWeight += weightDeltaKg;
    }

    // Se não atingiu em 90 dias, faz extrapolação linear aproximada para informar a data
    if (daysToTarget === null) {
      const finalDayBalance = dailyPoints[dailyPoints.length - 1].dailyBalance;
      if ((targetWeight < currentWeight && finalDayBalance < 0) || (targetWeight > currentWeight && finalDayBalance > 0)) {
        const remainingKg = Math.abs(simulatedWeight - targetWeight);
        const dailyLossKg = Math.abs(finalDayBalance) / this.KCAL_PER_KG_FAT;
        const extraDays = Math.round(remainingKg / dailyLossKg);
        daysToTarget = 90 + extraDays;
        const projectedTarget = new Date(startDate);
        projectedTarget.setDate(startDate.getDate() + daysToTarget);
        targetReachedDate = projectedTarget;
      }
    }

    // Marcos de peso em 7, 14, 30, 60 e 90 dias
    const milestones = {
      day7: this._extractMilestone(dailyPoints, 7, currentWeight),
      day14: this._extractMilestone(dailyPoints, 14, currentWeight),
      day30: this._extractMilestone(dailyPoints, 30, currentWeight),
      day60: this._extractMilestone(dailyPoints, 60, currentWeight),
      day90: this._extractMilestone(dailyPoints, 90, currentWeight)
    };

    // Ritmo semanal de perda / ganho
    const weeklyRate = Number((milestones.day7.deltaKg).toFixed(2));

    return {
      dailyPoints,
      milestones,
      daysToTarget,
      targetReachedDate: targetReachedDate ? targetReachedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : null,
      weeklyRate,
      currentWeight,
      targetWeight
    };
  },

  _extractMilestone(dailyPoints, targetDay, initialWeight) {
    const point = dailyPoints[targetDay] || dailyPoints[dailyPoints.length - 1];
    const deltaKg = Number((point.weight - initialWeight).toFixed(2));
    return {
      day: targetDay,
      date: point.displayDate,
      weight: point.weight,
      deltaKg,
      formattedDelta: deltaKg >= 0 ? `+${deltaKg} kg` : `${deltaKg} kg`
    };
  },

  /**
   * Renderizador de Gráfico SVG Nativo de Alta Definição (Garante funcionamento 100% offline sem Chart.js)
   */
  renderNativeSvgChart(containerId, dailyPoints, currentWeight, targetWeight, historyPoints = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = 860;
    const height = 300;
    const padding = { top: 30, right: 30, bottom: 45, left: 55 };

    // Determina limites do eixo Y
    const allWeights = dailyPoints.map(p => p.weight).concat(historyPoints.map(p => p.weight), targetWeight);
    const minWeight = Math.floor(Math.min(...allWeights) - 1.5);
    const maxWeight = Math.ceil(Math.max(...allWeights) + 1.5);

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const getY = (w) => padding.top + chartH - ((w - minWeight) / (maxWeight - minWeight)) * chartH;
    const getX = (index, total) => padding.left + (index / (total - 1)) * chartW;

    // Gera linha do target
    const targetY = getY(targetWeight);

    // Amostra de pontos para o gráfico (a cada 3 dias para suavidade)
    const sampledPoints = dailyPoints.filter((_, idx) => idx % 3 === 0 || idx === dailyPoints.length - 1);
    const projPathPoints = sampledPoints.map((p, idx) => `${getX(idx, sampledPoints.length)},${getY(p.weight)}`).join(' L ');
    const projAreaPoints = `${getX(0, sampledPoints.length)},${padding.top + chartH} L ${projPathPoints} L ${getX(sampledPoints.length - 1, sampledPoints.length)},${padding.top + chartH} Z`;

    // Linhas de grade Y
    let gridLines = '';
    const step = (maxWeight - minWeight) > 10 ? 2 : 1;
    for (let w = minWeight; w <= maxWeight; w += step) {
      const y = getY(w);
      gridLines += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3" />
        <text x="${padding.left - 10}" y="${y + 4}" font-size="11" fill="#94a3b8" text-anchor="end">${w} kg</text>
      `;
    }

    // Rótulos X (Início, 30d, 60d, 90d)
    const xLabels = [
      { text: 'Hoje', x: getX(0, sampledPoints.length) },
      { text: '+30 dias', x: padding.left + (chartW * 0.33) },
      { text: '+60 dias', x: padding.left + (chartW * 0.66) },
      { text: '+90 dias', x: padding.left + chartW }
    ];

    const xLabelsSvg = xLabels.map(l => `
      <text x="${l.x}" y="${height - 12}" font-size="11" fill="#64748b" font-weight="600" text-anchor="middle">${l.text}</text>
    `).join('');

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; max-height: 320px; font-family: inherit;">
        <defs>
          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Grade de fundo -->
        ${gridLines}

        <!-- Linha da Meta -->
        <line x1="${padding.left}" y1="${targetY}" x2="${width - padding.right}" y2="${targetY}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,4" />
        <text x="${width - padding.right}" y="${targetY - 6}" font-size="11" fill="#d97706" font-weight="700" text-anchor="end">Meta: ${targetWeight} kg</text>

        <!-- Área de Preenchimento -->
        <path d="M ${projAreaPoints}" fill="url(#projGrad)" />

        <!-- Curva Projetada -->
        <path d="M ${projPathPoints}" fill="none" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" />

        <!-- Ponto Atual -->
        <circle cx="${getX(0, sampledPoints.length)}" cy="${getY(currentWeight)}" r="5" fill="#4f46e5" stroke="white" stroke-width="2" />

        <!-- Rótulos X -->
        ${xLabelsSvg}
      </svg>
    `;

    container.innerHTML = svg;
  }
};
