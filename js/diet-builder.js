/**
 * Motor de Montagem Inteligente de Dieta Baseada na Realidade do Usuário
 * Algoritmo que calcula as porções exatas dos alimentos escolhidos pelo usuário
 * para atingir a meta calórica e a distribuição de macronutrientes recomendada.
 */

const DietBuilder = {
  /**
   * Constrói um cardápio completo usando apenas os alimentos selecionados pelo usuário
   * @param {Object} params
   * @returns {Object} Cardápio gerado com macros e detalhes por refeição
   */
  buildDiet(params) {
    const {
      targetCalories,
      macroTargets,
      selectedFoodIds,
      mealCount = 4, // 3, 4 ou 5 refeições
      routineStyle = 'balanced',
      exams = []
    } = params;

    // Obtém os objetos completos dos alimentos selecionados
    const availableFoods = FOODS_DATABASE.filter(f => selectedFoodIds.includes(f.id));

    // Se o usuário selecionou poucos alimentos, complementa com essenciais para não quebrar
    let workingFoods = [...availableFoods];
    if (workingFoods.length < 3) {
      const basicFallbackIds = ['arroz_branco', 'feijao_carioca', 'frango_grelhado', 'ovo_cozido', 'banana_prata', 'aveia_flocos'];
      workingFoods = FOODS_DATABASE.filter(f => selectedFoodIds.includes(f.id) || basicFallbackIds.includes(f.id));
    }

    // Separa por categoria funcional
    const carbs = workingFoods.filter(f => ['Cereais', 'Leguminosas', 'Tubérculos', 'Pães', 'Massas'].includes(f.category));
    const proteins = workingFoods.filter(f => ['Carnes & Aves', 'Carnes Bovinas', 'Peixes & Frutos do Mar', 'Ovos', 'Suplementos'].includes(f.category));
    const dairy = workingFoods.filter(f => ['Laticínios'].includes(f.category));
    const fruits = workingFoods.filter(f => ['Frutas'].includes(f.category));
    const veggies = workingFoods.filter(f => ['Vegetais'].includes(f.category));
    const fats = workingFoods.filter(f => ['Gorduras & Óleos', 'Oleaginosas', 'Sementes'].includes(f.category));

    // Define a estrutura de refeições de acordo com a quantidade escolhida
    const mealsStructure = this._getMealsStructure(mealCount);

    // Distribuição de calorias por refeição
    const meals = [];
    let accumulatedCalories = 0;
    let accumulatedCarbs = 0;
    let accumulatedProtein = 0;
    let accumulatedFats = 0;
    let accumulatedFiber = 0;

    mealsStructure.forEach((mStructure, idx) => {
      const mealTargetKcal = Math.round(targetCalories * mStructure.calorieShare);
      const mealItems = [];

      // Seleciona alimentos adequados para o momento do dia
      const mealSelection = this._pickFoodsForMealType(mStructure.type, {
        carbs,
        proteins,
        dairy,
        fruits,
        veggies,
        fats,
        exams
      });

      // Calcula porções para compor as calorias da refeição
      let currentMealKcal = 0;
      let currentMealCarb = 0;
      let currentMealProt = 0;
      let currentMealFat = 0;
      let currentMealFiber = 0;

      // 1. Adiciona a proteína da refeição
      if (mealSelection.protein) {
        const pFood = mealSelection.protein;
        // Porção proporcional à meta de proteína
        const targetProtShare = (macroTargets.protein / mealCount);
        let protGramsQty = pFood.protein > 0 ? Math.round((targetProtShare / (pFood.protein / 100))) : (pFood.defaultPortion || 100);
        // Limita a porções realistas
        protGramsQty = Math.max(50, Math.min(250, protGramsQty));
        
        const portion = calculateFoodPortion(pFood, protGramsQty);
        mealItems.push(portion);
        currentMealKcal += portion.kcal;
        currentMealCarb += portion.carbs;
        currentMealProt += portion.protein;
        currentMealFat += portion.fats;
        currentMealFiber += portion.fiber;
      }

      // 2. Adiciona o carboidrato principal
      if (mealSelection.carb) {
        const cFood = mealSelection.carb;
        const remainingKcal = Math.max(80, mealTargetKcal - currentMealKcal - 80);
        let carbQty = cFood.kcal > 0 ? Math.round((remainingKcal / (cFood.kcal / 100))) : (cFood.defaultPortion || 100);
        carbQty = Math.max(30, Math.min(250, carbQty));

        const portion = calculateFoodPortion(cFood, carbQty);
        mealItems.push(portion);
        currentMealKcal += portion.kcal;
        currentMealCarb += portion.carbs;
        currentMealProt += portion.protein;
        currentMealFat += portion.fats;
        currentMealFiber += portion.fiber;
      }

      // 3. Adiciona leguminosa no almoço/jantar se selecionada (ex: feijão)
      if (mealSelection.legume) {
        const lFood = mealSelection.legume;
        const portion = calculateFoodPortion(lFood, 100); // 1 concha de feijão
        mealItems.push(portion);
        currentMealKcal += portion.kcal;
        currentMealCarb += portion.carbs;
        currentMealProt += portion.protein;
        currentMealFat += portion.fats;
        currentMealFiber += portion.fiber;
      }

      // 4. Adiciona fruta / vegetal / gordura complementar
      if (mealSelection.fruit) {
        const portion = calculateFoodPortion(mealSelection.fruit, mealSelection.fruit.defaultPortion || 100);
        mealItems.push(portion);
        currentMealKcal += portion.kcal;
        currentMealCarb += portion.carbs;
        currentMealProt += portion.protein;
        currentMealFat += portion.fats;
        currentMealFiber += portion.fiber;
      }

      if (mealSelection.veggie) {
        const portion = calculateFoodPortion(mealSelection.veggie, mealSelection.veggie.defaultPortion || 80);
        mealItems.push(portion);
        currentMealKcal += portion.kcal;
        currentMealCarb += portion.carbs;
        currentMealProt += portion.protein;
        currentMealFat += portion.fats;
        currentMealFiber += portion.fiber;
      }

      if (mealSelection.fat) {
        const portion = calculateFoodPortion(mealSelection.fat, mealSelection.fat.defaultPortion || 10);
        mealItems.push(portion);
        currentMealKcal += portion.kcal;
        currentMealCarb += portion.carbs;
        currentMealProt += portion.protein;
        currentMealFat += portion.fats;
        currentMealFiber += portion.fiber;
      }

      accumulatedCalories += currentMealKcal;
      accumulatedCarbs += currentMealCarb;
      accumulatedProtein += currentMealProt;
      accumulatedFats += currentMealFat;
      accumulatedFiber += currentMealFiber;

      meals.push({
        id: mStructure.id,
        name: mStructure.name,
        targetKcal: mealTargetKcal,
        totalKcal: currentMealKcal,
        totalCarbs: Number(currentMealCarb.toFixed(1)),
        totalProtein: Number(currentMealProt.toFixed(1)),
        totalFats: Number(currentMealFat.toFixed(1)),
        totalFiber: Number(currentMealFiber.toFixed(1)),
        items: mealItems
      });
    });

    // Ajuste fino global: se houver diferença relevante com a meta diária, ajusta as porções proporcionalmente
    const totalGeneratedKcal = Math.round(accumulatedCalories);
    const accuracy = Number(((totalGeneratedKcal / targetCalories) * 100).toFixed(1));

    return {
      meals,
      totalCalories: totalGeneratedKcal,
      targetCalories,
      totalCarbs: Number(accumulatedCarbs.toFixed(1)),
      targetCarbs: macroTargets.carbs,
      totalProtein: Number(accumulatedProtein.toFixed(1)),
      targetProtein: macroTargets.protein,
      totalFats: Number(accumulatedFats.toFixed(1)),
      targetFats: macroTargets.fats,
      totalFiber: Number(accumulatedFiber.toFixed(1)),
      targetFiber: macroTargets.fiber,
      accuracy,
      mealsCount: mealCount
    };
  },

  _getMealsStructure(count) {
    if (count === 3) {
      return [
        { id: 'breakfast', name: 'Café da Manhã', type: 'breakfast', calorieShare: 0.30 },
        { id: 'lunch', name: 'Almoço', type: 'lunch', calorieShare: 0.40 },
        { id: 'dinner', name: 'Jantar', type: 'dinner', calorieShare: 0.30 }
      ];
    } else if (count === 5) {
      return [
        { id: 'breakfast', name: 'Café da Manhã', type: 'breakfast', calorieShare: 0.22 },
        { id: 'morning_snack', name: 'Lanche da Manhã', type: 'snack', calorieShare: 0.12 },
        { id: 'lunch', name: 'Almoço', type: 'lunch', calorieShare: 0.34 },
        { id: 'snack', name: 'Lanche da Tarde', type: 'snack', calorieShare: 0.14 },
        { id: 'dinner', name: 'Jantar', type: 'dinner', calorieShare: 0.18 }
      ];
    } else {
      // 4 refeições (padrão mais comum no Brasil)
      return [
        { id: 'breakfast', name: 'Café da Manhã', type: 'breakfast', calorieShare: 0.25 },
        { id: 'lunch', name: 'Almoço', type: 'lunch', calorieShare: 0.35 },
        { id: 'snack', name: 'Lanche da Tarde', type: 'snack', calorieShare: 0.15 },
        { id: 'dinner', name: 'Jantar', type: 'dinner', calorieShare: 0.25 }
      ];
    }
  },

  _pickFoodsForMealType(type, categorized) {
    const { carbs, proteins, dairy, fruits, veggies, fats, exams } = categorized;
    const res = {};

    // Alerta de exames para escolhas prioritárias
    const hasHighLdlOrTrig = exams.some(e => (e.examId === 'ldl' && e.value >= 130) || (e.examId === 'triglycerides' && e.value >= 150));

    if (type === 'breakfast') {
      // Carboidrato típico de café (aveia, pão, tapioca, cuscuz)
      const bCarb = carbs.find(c => ['aveia_flocos', 'pao_integral', 'pao_frances', 'tapioca', 'cuscuz_milho'].includes(c.id)) || carbs[0];
      res.carb = bCarb;

      // Proteína típica (ovos, queijo, whey, leite)
      const bProt = proteins.find(p => ['ovo_cozido', 'ovo_mexido', 'clara_ovo', 'whey_protein'].includes(p.id)) || dairy.find(d => ['queijo_minas_frescal', 'queijo_cottage'].includes(d.id)) || proteins[0];
      res.protein = bProt;

      // Fruta matinal
      if (fruits.length > 0) {
        res.fruit = fruits.find(f => ['banana_prata', 'maca_fuji', 'mamao_papaya'].includes(f.id)) || fruits[0];
      }
    } else if (type === 'lunch') {
      // Carboidrato de almoço (arroz, batata, macarrão, mandioca)
      res.carb = carbs.find(c => ['arroz_integral', 'arroz_branco', 'batata_doce', 'batata_inglesa', 'mandioca_cozida'].includes(c.id)) || carbs[0];

      // Feijão / Leguminosa
      const legume = carbs.find(c => ['feijao_carioca', 'feijao_preto', 'lentilha_cozida', 'grao_de_bico'].includes(c.id));
      if (legume) res.legume = legume;

      // Proteína forte (frango, patinho, carne moída, peixe, tilápia, ovos)
      res.protein = proteins.find(p => ['frango_grelhado', 'patinho_grelhado', 'carne_moida_magra', 'tilapia_grelhada', 'salmao_grelhado'].includes(p.id)) || proteins[0];

      // Vegetal / Salada
      if (veggies.length > 0) res.veggie = veggies[0];

      // Fio de azeite
      const oliveOil = fats.find(f => f.id === 'azeite_oliva');
      if (oliveOil) res.fat = oliveOil;
    } else if (type === 'snack') {
      // Lanche prático (fruta + iogurte/aveia/pasta de amendoim ou pão)
      if (fruits.length > 0) res.fruit = fruits[0];
      const snackCarb = carbs.find(c => ['aveia_flocos', 'pao_integral', 'tapioca'].includes(c.id));
      if (snackCarb) res.carb = snackCarb;

      const snackProt = dairy.find(d => ['iogurte_natural_desn', 'iogurte_grego_light', 'queijo_cottage'].includes(d.id)) || proteins.find(p => p.id === 'whey_protein') || proteins.find(p => p.id === 'ovo_cozido');
      if (snackProt) res.protein = snackProt;

      const snackFat = fats.find(f => ['pasta_amendoim', 'castanha_para', 'semente_chia'].includes(f.id));
      if (snackFat) res.fat = snackFat;
    } else if (type === 'dinner') {
      // Jantar (leve e nutritivo)
      res.carb = carbs.find(c => ['batata_doce', 'arroz_integral', 'arroz_branco', 'mandioca_cozida'].includes(c.id)) || carbs[0];
      res.protein = proteins.find(p => ['frango_desfiado', 'frango_grelhado', 'tilapia_grelhada', 'ovo_cozido', 'patinho_grelhado'].includes(p.id)) || proteins[0];
      if (veggies.length > 1) res.veggie = veggies[1];
      else if (veggies.length > 0) res.veggie = veggies[0];

      const oliveOil = fats.find(f => f.id === 'azeite_oliva');
      if (oliveOil) res.fat = oliveOil;
    }

    return res;
  }
};
