/**
 * Módulo de Análise de Exames Laboratoriais e Diretrizes Nutricionais Integradas
 * Avalia marcadores de saúde e prescreve condutas dietéticas preventivas
 */

const EXAMS_CATALOG = {
  glucose: {
    id: 'glucose',
    name: 'Glicemia de Jejum',
    category: 'Metabolismo Glicídico',
    unit: 'mg/dL',
    refText: 'Desejável: < 99 mg/dL | Pré-diabetes: 100-125 | Diabetes: ≥ 126',
    evaluate(val) {
      if (val < 70) return { status: 'warning', label: 'Hipoglicemia', tagClass: 'tag-warning' };
      if (val <= 99) return { status: 'normal', label: 'Normal / Otimizado', tagClass: 'tag-normal' };
      if (val <= 125) return { status: 'warning', label: 'Atenção (Glicemia de Jejum Alterada)', tagClass: 'tag-warning' };
      return { status: 'alert', label: 'Elevado (Risco Diabético)', tagClass: 'tag-alert' };
    },
    dietAdvice: {
      warning: 'Reduza carboidratos simples (farinhas brancas, doces, sucos açucarados). Priorize carboidratos de baixo índice glicêmico acompanhados de fibras solúveis (aveia, psyllium, chia) e proteínas.',
      alert: 'Atenção médica recomendada. Evite açúcares livres, controle as porções de carboidratos nas refeições e nunca consuma carboidratos isolados (sempre associe a vegetais ou proteínas).'
    }
  },

  hba1c: {
    id: 'hba1c',
    name: 'Hemoglobina Glicada (HbA1c)',
    category: 'Metabolismo Glicídico',
    unit: '%',
    refText: 'Normal: < 5.7% | Risco aumentado: 5.7% - 6.4% | Diabetes: ≥ 6.5%',
    evaluate(val) {
      if (val < 5.7) return { status: 'normal', label: 'Normal', tagClass: 'tag-normal' };
      if (val <= 6.4) return { status: 'warning', label: 'Risco Elevado (Pré-diabetes)', tagClass: 'tag-warning' };
      return { status: 'alert', label: 'Alterado (Diabetes)', tagClass: 'tag-alert' };
    },
    dietAdvice: {
      warning: 'A média da glicose dos últimos 90 dias está no limiar. Implemente restrição de carboidratos refinados e caminhadas leves de 15 minutos após as principais refeições.',
      alert: 'Controle rigoroso da carga glicêmica diária. Consulte endocrinologista e nutricionista para adequação de medicação e cardápio de baixo índice glicêmico.'
    }
  },

  total_cholesterol: {
    id: 'total_cholesterol',
    name: 'Colesterol Total',
    category: 'Perfil Lipídico',
    unit: 'mg/dL',
    refText: 'Desejável: < 190 mg/dL | Limítrofe: 190 - 239 | Elevado: ≥ 240',
    evaluate(val) {
      if (val < 190) return { status: 'normal', label: 'Desejável', tagClass: 'tag-normal' };
      if (val <= 239) return { status: 'warning', label: 'Limítrofe', tagClass: 'tag-warning' };
      return { status: 'alert', label: 'Elevado', tagClass: 'tag-alert' };
    },
    dietAdvice: {
      warning: 'Substitua gorduras saturadas (embutidos, frituras, queijos amarelos) por gorduras mono e poli-insaturadas (azeite de oliva, abacate, sementes e castanhas).',
      alert: 'Atenção ao risco cardiovascular. Aumente o consumo diário de fibras solúveis (beta-glucana da aveia, maçã com casca e feijões) que reduzem a absorção do colesterol.'
    }
  },

  hdl: {
    id: 'hdl',
    name: 'Colesterol HDL ("Bom")',
    category: 'Perfil Lipídico',
    unit: 'mg/dL',
    refText: 'Desejável: > 40 mg/dL (Homens) / > 50 mg/dL (Mulheres) | Ótimo: > 60',
    evaluate(val) {
      if (val >= 60) return { status: 'normal', label: 'Excelente / Protetor', tagClass: 'tag-normal' };
      if (val >= 40) return { status: 'normal', label: 'Adequado', tagClass: 'tag-normal' };
      return { status: 'warning', label: 'Baixo (Fator de Risco)', tagClass: 'tag-warning' };
    },
    dietAdvice: {
      warning: 'HDL baixo reduz a proteção cardíaca. Aumente a ingestão de azeite de oliva extra virgem cru, nozes, peixes ricos em ômega-3 e mantenha atividade física aeróbica regular.'
    }
  },

  ldl: {
    id: 'ldl',
    name: 'Colesterol LDL ("Ruim")',
    category: 'Perfil Lipídico',
    unit: 'mg/dL',
    refText: 'Ótimo: < 100 mg/dL | Limítrofe: 100 - 129 | Elevado: ≥ 130',
    evaluate(val) {
      if (val < 100) return { status: 'normal', label: 'Ótimo', tagClass: 'tag-normal' };
      if (val <= 129) return { status: 'normal', label: 'Desejável / Aceitável', tagClass: 'tag-normal' };
      if (val <= 159) return { status: 'warning', label: 'Limítrofe / Elevado', tagClass: 'tag-warning' };
      return { status: 'alert', label: 'Muito Elevado', tagClass: 'tag-alert' };
    },
    dietAdvice: {
      warning: 'Elimine gorduras trans industriais. Reduza carnes bovinas muito gordas e queijos ultraprocessados. Consuma 2 colheres de sopa de aveia e 1 maçã todos os dias.',
      alert: 'Redução estrita de ácidos graxos saturados (< 7% do VET). Adicione alimentos ricos em fitoesteróis e mantenha acompanhamento médico.'
    }
  },

  triglycerides: {
    id: 'triglycerides',
    name: 'Triglicerídeos',
    category: 'Perfil Lipídico',
    unit: 'mg/dL',
    refText: 'Desejável: < 150 mg/dL | Limítrofe: 150 - 199 | Elevado: ≥ 200',
    evaluate(val) {
      if (val < 150) return { status: 'normal', label: 'Desejável', tagClass: 'tag-normal' };
      if (val <= 199) return { status: 'warning', label: 'Limítrofe', tagClass: 'tag-warning' };
      return { status: 'alert', label: 'Elevado / Crítico', tagClass: 'tag-alert' };
    },
    dietAdvice: {
      warning: 'Corte bebidas alcoólicas, refrigerantes e sobremesas açucaradas. Triglicerídeos respondem diretamente ao excesso de carboidratos rápidos e álcool. Inclua peixes e linhaça.',
      alert: 'Risco de esteatose hepática e pancreatite se muito alto. Restrição firme de açúcares, farinhas refinadas e álcool zero. Priorize vegetais fibrosos e proteínas magras.'
    }
  },

  uric_acid: {
    id: 'uric_acid',
    name: 'Ácido Úrico',
    category: 'Metabolismo Renal & Purinas',
    unit: 'mg/dL',
    refText: 'Normal: 2.5 - 7.0 mg/dL (Homem) / 1.5 - 6.0 (Mulher)',
    evaluate(val) {
      if (val <= 7.0) return { status: 'normal', label: 'Normal', tagClass: 'tag-normal' };
      return { status: 'warning', label: 'Elevado (Hiperuricemia)', tagClass: 'tag-warning' };
    },
    dietAdvice: {
      warning: 'Risco de gota e cálculos renais. Beba no mínimo 3 a 3.5 litros de água por dia. Evite bebidas alcoólicas (especialmente cerveja), embutidos, frutos do mar e carnes vermelhas em excesso. Consuma frutas ricas em vitamina C (laranja, limão, acerola).'
    }
  },

  vitamin_d: {
    id: 'vitamin_d',
    name: 'Vitamina D (25-OH)',
    category: 'Vitaminas & Imunidade',
    unit: 'ng/mL',
    refText: 'Deficiência: < 20 ng/mL | Insuficiência: 20 - 29 | Adequado: 30 - 60',
    evaluate(val) {
      if (val < 20) return { status: 'alert', label: 'Deficiência', tagClass: 'tag-alert' };
      if (val < 30) return { status: 'warning', label: 'Insuficiente', tagClass: 'tag-warning' };
      return { status: 'normal', label: 'Suficiente / Otimizado', tagClass: 'tag-normal' };
    },
    dietAdvice: {
      warning: 'Exponha braços e pernas ao sol matinal por 15 a 20 minutos diariamente. Consuma gema de ovo, atum, sardinha e cogumelos. Avalie suplementação com médico/nutricionista.',
      alert: 'Impacto direto na imunidade, ossos e metabolismo lipídico. É altamente recomendada a suplementação terapêutica prescrita por médico ou nutricionista.'
    }
  },

  vitamin_b12: {
    id: 'vitamin_b12',
    name: 'Vitamina B12 (Cobalamina)',
    category: 'Vitaminas & Energia',
    unit: 'pg/mL',
    refText: 'Baixo: < 200 pg/mL | Limítrofe: 200 - 350 | Ótimo: > 350',
    evaluate(val) {
      if (val < 200) return { status: 'alert', label: 'Deficiência', tagClass: 'tag-alert' };
      if (val <= 350) return { status: 'warning', label: 'Limítrofe', tagClass: 'tag-warning' };
      return { status: 'normal', label: 'Adequado', tagClass: 'tag-normal' };
    },
    dietAdvice: {
      warning: 'Pode causar cansaço, fraqueza muscular e lentidão cognitiva. Consuma mais carnes magras, ovos e laticínios. Em dietas vegetarianas/veganas, a suplementação é mandatória.',
      alert: 'Deficiência significativa. Necessidade imediata de suplementação oral ou injetável supervisionada para evitar danos neurológicos e anemia megaloblástica.'
    }
  },

  ferritin: {
    id: 'ferritin',
    name: 'Ferritina Sérica',
    category: 'Minerais & Estoque de Ferro',
    unit: 'ng/mL',
    refText: 'Desejável: 30 - 300 ng/mL | Baixo: < 30 (Anemia) | Elevado: > 300',
    evaluate(val) {
      if (val < 30) return { status: 'warning', label: 'Estoque Baixo (Risco Anêmico)', tagClass: 'tag-warning' };
      if (val <= 300) return { status: 'normal', label: 'Normal', tagClass: 'tag-normal' };
      return { status: 'warning', label: 'Elevado (Inflamação / Sobrecarga)', tagClass: 'tag-warning' };
    },
    dietAdvice: {
      warning: 'Se baixo: inclua feijão, lentilha e folhas verde-escuras acompanhados de fonte de vitamina C (limão, laranja) para quadruplicar a absorção de ferro. Evite café ou leite nas refeições com ferro.',
      alert: 'Se muito elevado: investigue inflamação sistêmica ou sobrecarga hepática. Modere consumo de carnes vermelhas e suplementos minerais não prescritos.'
    }
  },

  tgo_ast: {
    id: 'tgo_ast',
    name: 'TGO / AST (Fígado)',
    category: 'Função Hepática',
    unit: 'U/L',
    refText: 'Normal: até 35 U/L (Mulheres) / até 40 U/L (Homens)',
    evaluate(val) {
      if (val <= 40) return { status: 'normal', label: 'Normal', tagClass: 'tag-normal' };
      return { status: 'warning', label: 'Elevado (Sobrecarga)', tagClass: 'tag-warning' };
    },
    dietAdvice: {
      warning: 'Evite álcool e ultraprocessados. Aumente vegetais crucíferos (brócolis, couve) que auxiliam a desintoxicação hepática.'
    }
  },

  tgp_alt: {
    id: 'tgp_alt',
    name: 'TGP / ALT (Fígado)',
    category: 'Função Hepática',
    unit: 'U/L',
    refText: 'Normal: até 35 U/L (Mulheres) / até 45 U/L (Homens)',
    evaluate(val) {
      if (val <= 45) return { status: 'normal', label: 'Normal', tagClass: 'tag-normal' };
      return { status: 'warning', label: 'Elevado (Gordura no Fígado / Sobrecarga)', tagClass: 'tag-warning' };
    },
    dietAdvice: {
      warning: 'Alerta para esteatose hepática. A perda gradual de 5% a 10% do peso corporal reverte a inflamação do fígado na maioria dos casos. Elimine xaropes de frutose e refrigerantes.'
    }
  },

  creatinine: {
    id: 'creatinine',
    name: 'Creatinina Sérica',
    category: 'Função Renal',
    unit: 'mg/dL',
    refText: 'Normal: 0.7 - 1.2 mg/dL (Homem) / 0.5 - 1.0 (Mulher)',
    evaluate(val) {
      if (val <= 1.2) return { status: 'normal', label: 'Normal', tagClass: 'tag-normal' };
      return { status: 'warning', label: 'Atenção Renal', tagClass: 'tag-warning' };
    },
    dietAdvice: {
      warning: 'Mantenha hidratação rigorosa (35 a 40 ml/kg). Se consome suplementação de creatina, avise seu médico antes dos exames de rotina.'
    }
  },

  crp: {
    id: 'crp',
    name: 'Proteína C Reativa (PCR Ultrasensível)',
    category: 'Marcador Inflamatório',
    unit: 'mg/L',
    refText: 'Baixo Risco: < 1.0 mg/L | Moderado: 1.0 - 3.0 | Alto Risco: > 3.0',
    evaluate(val) {
      if (val < 1.0) return { status: 'normal', label: 'Baixo Risco Inflamatório', tagClass: 'tag-normal' };
      if (val <= 3.0) return { status: 'warning', label: 'Risco Inflamatório Moderado', tagClass: 'tag-warning' };
      return { status: 'alert', label: 'Inflamação Sistêmica Alta', tagClass: 'tag-alert' };
    },
    dietAdvice: {
      warning: 'Adote uma dieta rica em antioxidantes: azeite extra virgem, cúrcuma com pimenta preta, frutas vermelhas, chá verde e peixes ricos em ômega-3.',
      alert: 'Reduza imediatamente açúcares refinados, gorduras hidrogenadas e alimentos ultraprocessados pró-inflamatórios. Pratique higiene do sono e atividade física.'
    }
  }
};

const ExamsAnalyzer = {
  /**
   * Avalia um exame individual
   */
  evaluateExam(examId, numericValue) {
    const meta = EXAMS_CATALOG[examId];
    if (!meta) return null;

    const evaluation = meta.evaluate(numericValue);
    let advice = null;

    if (evaluation.status === 'alert' && meta.dietAdvice.alert) {
      advice = meta.dietAdvice.alert;
    } else if ((evaluation.status === 'warning' || evaluation.status === 'alert') && meta.dietAdvice.warning) {
      advice = meta.dietAdvice.warning;
    }

    return {
      examId,
      name: meta.name,
      category: meta.category,
      unit: meta.unit,
      value: numericValue,
      refText: meta.refText,
      status: evaluation.status,
      label: evaluation.label,
      tagClass: evaluation.tagClass,
      advice
    };
  },

  /**
   * Analisa a lista completa de exames cadastrados e gera um panorama clínico e recomendações consolidadas
   */
  analyzeAllExams(examsList) {
    const results = [];
    const recommendations = [];
    let warningCount = 0;
    let alertCount = 0;

    examsList.forEach(item => {
      const evalResult = this.evaluateExam(item.examId, item.value);
      if (evalResult) {
        evalResult.date = item.date;
        evalResult.notes = item.notes || '';
        results.push(evalResult);

        if (evalResult.status === 'warning') warningCount++;
        if (evalResult.status === 'alert') alertCount++;

        if (evalResult.advice) {
          recommendations.push({
            examName: evalResult.name,
            status: evalResult.status,
            advice: evalResult.advice
          });
        }
      }
    });

    let overallStatus = 'Excelente';
    let overallBadge = 'badge-meta';
    if (alertCount > 0) {
      overallStatus = `${alertCount} exame(s) em nível crítico`;
      overallBadge = 'tag-alert';
    } else if (warningCount > 0) {
      overallStatus = `${warningCount} exame(s) com atenção`;
      overallBadge = 'tag-warning';
    }

    return {
      results,
      recommendations,
      warningCount,
      alertCount,
      totalCount: results.length,
      overallStatus,
      overallBadge
    };
  }
};
