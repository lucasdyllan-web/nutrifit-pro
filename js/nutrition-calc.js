/**
 * Módulo de Cálculos Nutricionais e Antropométricos
 * Fórmulas validadas pela ciência nutricional (Mifflin-St Jeor, OMS)
 */

const NutritionCalc = {
  /**
   * Calcula a Taxa Metabólica Basal (TMB) usando a equação de Mifflin-St Jeor
   * @param {number} weight Peso em kg
   * @param {number} height Altura em cm
   * @param {number} age Idade em anos
   * @param {string} gender 'male' ou 'female'
   * @returns {number} TMB em kcal
   */
  calculateBMR(weight, height, age, gender) {
    if (gender === 'male') {
      return Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
    } else {
      return Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
    }
  },

  /**
   * Calcula o Gasto Energético Total (GET / TDEE)
   * @param {number} bmr Taxa metabólica basal
   * @param {number} activityMultiplier Fator de atividade física (1.2 a 1.9)
   * @returns {number} GET em kcal
   */
  calculateTDEE(bmr, activityMultiplier) {
    return Math.round(bmr * Number(activityMultiplier));
  },

  /**
   * Calcula a Meta Calórica com base no objetivo
   * @param {number} tdee Gasto energético total
   * @param {string} goal Tipo de objetivo
   * @returns {{ targetCalories: number, deficit: number, label: string }}
   */
  calculateCalorieGoal(tdee, goal) {
    let deficit = 0;
    let label = 'Manutenção';

    switch (goal) {
      case 'cut_agg':
        deficit = -750;
        label = 'Perda de Gordura Acelerada';
        break;
      case 'cut_mod':
        deficit = -500;
        label = 'Emagrecimento Saudável';
        break;
      case 'cut_light':
        deficit = -300;
        label = 'Déficit Leve / Recomposição';
        break;
      case 'maintain':
        deficit = 0;
        label = 'Manutenção de Peso';
        break;
      case 'bulk_clean':
        deficit = 300;
        label = 'Ganho de Massa Limpo';
        break;
      case 'bulk_heavy':
        deficit = 500;
        label = 'Hipertrofia Acelerada';
        break;
      default:
        deficit = -500;
        label = 'Emagrecimento Moderado';
    }

    // Piso de segurança biológica (mínimo 1200 kcal para mulheres, 1500 para homens em geral)
    const targetCalories = Math.max(1200, Math.round(tdee + deficit));

    return {
      targetCalories,
      deficit,
      label
    };
  },

  /**
   * Calcula a meta de macronutrientes individualizada
   * @param {number} targetCalories Calorias diárias
   * @param {number} weight Peso em kg
   * @param {string} goal Objetivo
   * @returns {{ protein: number, carbs: number, fats: number, fiber: number }}
   */
  calculateMacroTargets(targetCalories, weight, goal) {
    let proteinPerKg = 2.0;
    let fatRatio = 0.25; // 25% das calorias em gordura boa

    if (goal.startsWith('cut')) {
      proteinPerKg = 2.0; // Preserva massa magra durante o corte
      fatRatio = 0.25;
    } else if (goal.startsWith('bulk')) {
      proteinPerKg = 1.8;
      fatRatio = 0.25;
    } else {
      proteinPerKg = 1.6;
      fatRatio = 0.28;
    }

    const proteinGrams = Math.round(weight * proteinPerKg);
    const proteinKcal = proteinGrams * 4;

    const fatKcal = targetCalories * fatRatio;
    const fatGrams = Math.round(fatKcal / 9);

    const remainingKcal = Math.max(0, targetCalories - (proteinKcal + fatKcal));
    const carbGrams = Math.round(remainingKcal / 4);

    // Fibras: ~14g a cada 1000 kcal ingeridas (mínimo 25g)
    const fiberGrams = Math.max(25, Math.round((targetCalories / 1000) * 14));

    return {
      protein: proteinGrams,
      carbs: carbGrams,
      fats: fatGrams,
      fiber: fiberGrams
    };
  },

  /**
   * Calcula o Índice de Massa Corporal (IMC) e classificação OMS
   * @param {number} weight Peso em kg
   * @param {number} heightCm Altura em centímetros
   * @returns {{ bmi: number, classification: string, colorClass: string, idealMinWeight: number, idealMaxWeight: number }}
   */
  calculateBMI(weight, heightCm) {
    const heightM = heightCm / 100;
    const bmi = Number((weight / (heightM * heightM)).toFixed(1));

    let classification = 'Peso Normal';
    let colorClass = 'text-emerald';

    if (bmi < 18.5) {
      classification = 'Abaixo do Peso';
      colorClass = 'text-amber';
    } else if (bmi <= 24.9) {
      classification = 'Peso Normal / Saudável';
      colorClass = 'text-emerald';
    } else if (bmi <= 29.9) {
      classification = 'Sobrepeso (Pré-Obesidade)';
      colorClass = 'text-amber';
    } else if (bmi <= 34.9) {
      classification = 'Obesidade Grau I';
      colorClass = 'text-red';
    } else if (bmi <= 39.9) {
      classification = 'Obesidade Grau II (Severa)';
      colorClass = 'text-red';
    } else {
      classification = 'Obesidade Grau III (Mórbida)';
      colorClass = 'text-red';
    }

    // Faixa ideal (IMC 18.5 a 24.9)
    const idealMinWeight = Number((18.5 * heightM * heightM).toFixed(1));
    const idealMaxWeight = Number((24.9 * heightM * heightM).toFixed(1));

    return {
      bmi,
      classification,
      colorClass,
      idealMinWeight,
      idealMaxWeight
    };
  },

  /**
   * Calcula meta de hidratação diária (35ml por kg)
   * @param {number} weight Peso em kg
   * @returns {number} Meta em ml
   */
  calculateWaterTarget(weight) {
    return Math.round(weight * 35);
  }
};
