/**
 * Banco de Dados de Alimentos com foco em hábitos brasileiros
 * Valores nutricionais baseados na Tabela TACO / IBGE / USDA (por 100g de alimento)
 */

const FOODS_DATABASE = [
  // CEREAIS, TUBÉRCULOS E CARBOIDRATOS
  { id: 'arroz_branco', name: 'Arroz Branco Cozido', category: 'Cereais', unit: 'g', defaultPortion: 150, kcal: 128, carbs: 28.1, protein: 2.5, fats: 0.2, fiber: 1.6 },
  { id: 'arroz_integral', name: 'Arroz Integral Cozido', category: 'Cereais', unit: 'g', defaultPortion: 150, kcal: 124, carbs: 25.8, protein: 2.6, fats: 1.0, fiber: 2.7 },
  { id: 'feijao_carioca', name: 'Feijão Carioca Cozido', category: 'Leguminosas', unit: 'g', defaultPortion: 100, kcal: 76, carbs: 13.6, protein: 4.8, fats: 0.5, fiber: 8.5 },
  { id: 'feijao_preto', name: 'Feijão Preto Cozido', category: 'Leguminosas', unit: 'g', defaultPortion: 100, kcal: 77, carbs: 14.0, protein: 4.5, fats: 0.5, fiber: 8.4 },
  { id: 'lentilha_cozida', name: 'Lentilha Cozida', category: 'Leguminosas', unit: 'g', defaultPortion: 100, kcal: 93, carbs: 16.3, protein: 6.3, fats: 0.4, fiber: 7.9 },
  { id: 'grao_de_bico', name: 'Grão-de-bico Cozido', category: 'Leguminosas', unit: 'g', defaultPortion: 100, kcal: 120, carbs: 19.5, protein: 7.0, fats: 2.0, fiber: 6.5 },
  { id: 'aveia_flocos', name: 'Aveia em Flocos', category: 'Cereais', unit: 'g', defaultPortion: 30, kcal: 394, carbs: 66.6, protein: 13.9, fats: 8.5, fiber: 9.1 },
  { id: 'pao_frances', name: 'Pão Francês Tradicional', category: 'Pães', unit: 'g', defaultPortion: 50, kcal: 300, carbs: 58.7, protein: 8.0, fats: 3.1, fiber: 2.3 },
  { id: 'pao_integral', name: 'Pão Integral 100%', category: 'Pães', unit: 'g', defaultPortion: 50, kcal: 247, carbs: 41.3, protein: 13.0, fats: 3.4, fiber: 7.0 },
  { id: 'tapioca', name: 'Goma de Tapioca Hidratada', category: 'Cereais', unit: 'g', defaultPortion: 80, kcal: 240, carbs: 60.0, protein: 0.0, fats: 0.0, fiber: 0.5 },
  { id: 'batata_doce', name: 'Batata-Doce Cozida', category: 'Tubérculos', unit: 'g', defaultPortion: 150, kcal: 77, carbs: 18.4, protein: 0.6, fats: 0.1, fiber: 2.2 },
  { id: 'batata_inglesa', name: 'Batata Inglesa Cozida', category: 'Tubérculos', unit: 'g', defaultPortion: 150, kcal: 52, carbs: 11.9, protein: 1.2, fats: 0.1, fiber: 1.3 },
  { id: 'mandioca_cozida', name: 'Mandioca / Aipim Cozido', category: 'Tubérculos', unit: 'g', defaultPortion: 150, kcal: 125, carbs: 30.1, protein: 0.6, fats: 0.3, fiber: 1.6 },
  { id: 'macarrao_cozido', name: 'Macarrão Tradicional Cozido', category: 'Massas', unit: 'g', defaultPortion: 150, kcal: 141, carbs: 29.5, protein: 4.8, fats: 0.6, fiber: 1.5 },
  { id: 'cuscuz_milho', name: 'Cuscuz Nordestino Cozido', category: 'Cereais', unit: 'g', defaultPortion: 100, kcal: 112, carbs: 25.0, protein: 2.2, fats: 0.5, fiber: 2.0 },

  // PROTEÍNAS ANIMAIS & OVOS
  { id: 'frango_grelhado', name: 'Peito de Frango Grelhado', category: 'Carnes & Aves', unit: 'g', defaultPortion: 150, kcal: 159, carbs: 0.0, protein: 32.0, fats: 2.5, fiber: 0.0 },
  { id: 'frango_desfiado', name: 'Peito de Frango Cozido Desfiado', category: 'Carnes & Aves', unit: 'g', defaultPortion: 120, kcal: 150, carbs: 0.0, protein: 31.0, fats: 2.0, fiber: 0.0 },
  { id: 'coxa_frango', name: 'Coxa de Frango sem Pele Grelhada', category: 'Carnes & Aves', unit: 'g', defaultPortion: 100, kcal: 167, carbs: 0.0, protein: 25.0, fats: 6.8, fiber: 0.0 },
  { id: 'patinho_grelhado', name: 'Carne Bovina Magra (Patinho)', category: 'Carnes Bovinas', unit: 'g', defaultPortion: 150, kcal: 185, carbs: 0.0, protein: 31.9, fats: 5.4, fiber: 0.0 },
  { id: 'carne_moida_magra', name: 'Carne Moída de Patinho Refogada', category: 'Carnes Bovinas', unit: 'g', defaultPortion: 120, kcal: 212, carbs: 0.0, protein: 26.7, fats: 10.9, fiber: 0.0 },
  { id: 'file_mignon', name: 'Filé Mignon Bovino Grelhado', category: 'Carnes Bovinas', unit: 'g', defaultPortion: 150, kcal: 220, carbs: 0.0, protein: 32.8, fats: 8.8, fiber: 0.0 },
  { id: 'alcatra_grelhada', name: 'Alcatra Bovina Grelhada', category: 'Carnes Bovinas', unit: 'g', defaultPortion: 150, kcal: 215, carbs: 0.0, protein: 31.0, fats: 9.3, fiber: 0.0 },
  { id: 'tilapia_grelhada', name: 'Filé de Tilápia Grelhado', category: 'Peixes & Frutos do Mar', unit: 'g', defaultPortion: 150, kcal: 128, carbs: 0.0, protein: 26.0, fats: 2.7, fiber: 0.0 },
  { id: 'salmao_grelhado', name: 'Salmão Fresco Grelhado', category: 'Peixes & Frutos do Mar', unit: 'g', defaultPortion: 150, kcal: 206, carbs: 0.0, protein: 22.1, fats: 12.3, fiber: 0.0 },
  { id: 'atum_natural', name: 'Atum Sólido em Água (Lata)', category: 'Peixes & Frutos do Mar', unit: 'g', defaultPortion: 120, kcal: 116, carbs: 0.0, protein: 26.0, fats: 1.0, fiber: 0.0 },
  { id: 'ovo_cozido', name: 'Ovo de Galinha Inteiro Cozido (1 un = 50g)', category: 'Ovos', unit: 'g', defaultPortion: 100, kcal: 146, carbs: 0.6, protein: 13.3, fats: 9.5, fiber: 0.0 },
  { id: 'ovo_mexido', name: 'Ovo Mexido (com fio de azeite)', category: 'Ovos', unit: 'g', defaultPortion: 100, kcal: 168, carbs: 1.0, protein: 12.5, fats: 12.0, fiber: 0.0 },
  { id: 'clara_ovo', name: 'Clara de Ovo Cozida', category: 'Ovos', unit: 'g', defaultPortion: 100, kcal: 52, carbs: 0.7, protein: 11.0, fats: 0.2, fiber: 0.0 },

  // LATICÍNIOS
  { id: 'leite_desnatado', name: 'Leite Desnatado Fluido', category: 'Laticínios', unit: 'ml', defaultPortion: 200, kcal: 35, carbs: 4.9, protein: 3.4, fats: 0.1, fiber: 0.0 },
  { id: 'leite_integral', name: 'Leite Integral Fluido', category: 'Laticínios', unit: 'ml', defaultPortion: 200, kcal: 60, carbs: 4.8, protein: 3.2, fats: 3.3, fiber: 0.0 },
  { id: 'iogurte_natural_desn', name: 'Iogurte Natural Desnatado', category: 'Laticínios', unit: 'g', defaultPortion: 170, kcal: 45, carbs: 5.5, protein: 4.5, fats: 0.3, fiber: 0.0 },
  { id: 'iogurte_grego_light', name: 'Iogurte Grego Tradicional', category: 'Laticínios', unit: 'g', defaultPortion: 100, kcal: 97, carbs: 4.0, protein: 9.0, fats: 5.0, fiber: 0.0 },
  { id: 'queijo_minas_frescal', name: 'Queijo Minas Frescal', category: 'Laticínios', unit: 'g', defaultPortion: 50, kcal: 227, carbs: 3.2, protein: 17.4, fats: 16.0, fiber: 0.0 },
  { id: 'queijo_cottage', name: 'Queijo Cottage', category: 'Laticínios', unit: 'g', defaultPortion: 60, kcal: 98, carbs: 3.4, protein: 11.1, fats: 4.3, fiber: 0.0 },
  { id: 'queijo_mussarela', name: 'Queijo Mussarela Fatiado', category: 'Laticínios', unit: 'g', defaultPortion: 30, kcal: 280, carbs: 2.2, protein: 22.0, fats: 20.0, fiber: 0.0 },
  { id: 'ricota_fresca', name: 'Ricota Fresca', category: 'Laticínios', unit: 'g', defaultPortion: 50, kcal: 140, carbs: 3.8, protein: 12.6, fats: 8.1, fiber: 0.0 },

  // FRUTAS
  { id: 'banana_prata', name: 'Banana Prata', category: 'Frutas', unit: 'g', defaultPortion: 100, kcal: 98, carbs: 26.0, protein: 1.3, fats: 0.1, fiber: 2.0 },
  { id: 'maca_fuji', name: 'Maçã Fuji com Casca', category: 'Frutas', unit: 'g', defaultPortion: 130, kcal: 56, carbs: 15.2, protein: 0.3, fats: 0.2, fiber: 1.3 },
  { id: 'morango', name: 'Morango Fresco', category: 'Frutas', unit: 'g', defaultPortion: 150, kcal: 30, carbs: 6.8, protein: 0.9, fats: 0.3, fiber: 1.7 },
  { id: 'mamao_papaya', name: 'Mamão Papaya', category: 'Frutas', unit: 'g', defaultPortion: 150, kcal: 40, carbs: 10.4, protein: 0.5, fats: 0.1, fiber: 1.0 },
  { id: 'laranja_pera', name: 'Laranja Pêra', category: 'Frutas', unit: 'g', defaultPortion: 130, kcal: 37, carbs: 8.9, protein: 1.0, fats: 0.1, fiber: 0.8 },
  { id: 'abacate', name: 'Abacate', category: 'Frutas', unit: 'g', defaultPortion: 80, kcal: 160, carbs: 6.0, protein: 1.6, fats: 15.4, fiber: 6.3 },
  { id: 'melancia', name: 'Melancia Fresca', category: 'Frutas', unit: 'g', defaultPortion: 200, kcal: 33, carbs: 8.1, protein: 0.9, fats: 0.0, fiber: 0.1 },
  { id: 'abacaxi', name: 'Abacaxi Pérola em Fatias', category: 'Frutas', unit: 'g', defaultPortion: 120, kcal: 48, carbs: 12.3, protein: 0.9, fats: 0.1, fiber: 1.0 },
  { id: 'uva_roxa', name: 'Uva Roxa / Thompson', category: 'Frutas', unit: 'g', defaultPortion: 100, kcal: 69, carbs: 18.1, protein: 0.7, fats: 0.2, fiber: 0.9 },

  // GORDURAS BOAS & OLEAGINOSAS
  { id: 'azeite_oliva', name: 'Azeite de Oliva Extra Virgem', category: 'Gorduras & Óleos', unit: 'g', defaultPortion: 10, kcal: 884, carbs: 0.0, protein: 0.0, fats: 100.0, fiber: 0.0 },
  { id: 'pasta_amendoim', name: 'Pasta de Amendoim Integral', category: 'Oleaginosas', unit: 'g', defaultPortion: 20, kcal: 588, carbs: 18.8, protein: 25.0, fats: 50.0, fiber: 8.0 },
  { id: 'castanha_para', name: 'Castanha-do-Pará (Brasil)', category: 'Oleaginosas', unit: 'g', defaultPortion: 15, kcal: 656, carbs: 12.3, protein: 14.3, fats: 66.4, fiber: 7.5 },
  { id: 'castanha_caju', name: 'Castanha de Caju Torrada', category: 'Oleaginosas', unit: 'g', defaultPortion: 20, kcal: 574, carbs: 32.7, protein: 15.3, fats: 46.3, fiber: 3.0 },
  { id: 'semente_chia', name: 'Sementes de Chia', category: 'Sementes', unit: 'g', defaultPortion: 15, kcal: 486, carbs: 42.1, protein: 16.5, fats: 30.7, fiber: 34.4 },
  { id: 'semente_linhaca', name: 'Sementes de Linhaça Dourada', category: 'Sementes', unit: 'g', defaultPortion: 15, kcal: 534, carbs: 28.9, protein: 18.3, fats: 42.2, fiber: 27.3 },

  // VEGETAIS & VERDURAS
  { id: 'brocolis_cozido', name: 'Brócolis Cozido no Vapor', category: 'Vegetais', unit: 'g', defaultPortion: 100, kcal: 35, carbs: 7.2, protein: 2.4, fats: 0.4, fiber: 3.4 },
  { id: 'alface_crespa', name: 'Alface Crespa Fresca', category: 'Vegetais', unit: 'g', defaultPortion: 50, kcal: 11, carbs: 1.7, protein: 1.3, fats: 0.2, fiber: 1.8 },
  { id: 'tomate_salada', name: 'Tomate Vermelho Salada', category: 'Vegetais', unit: 'g', defaultPortion: 80, kcal: 15, carbs: 3.1, protein: 1.1, fats: 0.2, fiber: 1.2 },
  { id: 'cenoura_crua', name: 'Cenoura Ralada Crua', category: 'Vegetais', unit: 'g', defaultPortion: 60, kcal: 34, carbs: 7.7, protein: 1.3, fats: 0.2, fiber: 3.2 },
  { id: 'espinafre_refogado', name: 'Espinafre Refogado', category: 'Vegetais', unit: 'g', defaultPortion: 80, kcal: 48, carbs: 6.8, protein: 2.9, fats: 1.9, fiber: 2.2 },
  { id: 'abobrinha_cozida', name: 'Abobrinha Italiana Cozida', category: 'Vegetais', unit: 'g', defaultPortion: 100, kcal: 15, carbs: 3.0, protein: 1.1, fats: 0.1, fiber: 1.6 },
  { id: 'couve_manteiga', name: 'Couve Manteiga Refogada', category: 'Vegetais', unit: 'g', defaultPortion: 60, kcal: 67, carbs: 8.7, protein: 2.0, fats: 3.4, fiber: 3.1 },

  // SUPLEMENTOS
  { id: 'whey_protein', name: 'Whey Protein 80% Concentrado/Isolado', category: 'Suplementos', unit: 'g', defaultPortion: 30, kcal: 400, carbs: 8.0, protein: 80.0, fats: 4.5, fiber: 0.0 },
  { id: 'creatina', name: 'Creatina Monohidratada 100% Pura', category: 'Suplementos', unit: 'g', defaultPortion: 5, kcal: 0, carbs: 0.0, protein: 0.0, fats: 0.0, fiber: 0.0 }
];

/**
 * Função utilitária para calcular macros de uma porção específica
 */
function calculateFoodPortion(food, quantityInGrams) {
  const factor = quantityInGrams / 100;
  return {
    id: food.id,
    name: food.name,
    category: food.category,
    quantity: quantityInGrams,
    unit: food.unit || 'g',
    kcal: Math.round(food.kcal * factor),
    carbs: Number((food.carbs * factor).toFixed(1)),
    protein: Number((food.protein * factor).toFixed(1)),
    fats: Number((food.fats * factor).toFixed(1)),
    fiber: Number((food.fiber * factor).toFixed(1))
  };
}
