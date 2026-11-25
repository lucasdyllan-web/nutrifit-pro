/**
 * Módulo de Análise de Exames Laboratoriais e Diretrizes Nutricionais Integradas
 * Avalia os 5 principais marcadores essenciais: Glicemia, Colesterol Total, Triglicerídeos, Vitamina D e Vitamina B12
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
      warning: 'Reduza carboidratos simples (farinhas brancas, doces, refrigerantes). Priorize carboidratos de baixo índice glicêmico acompanhados de fibras solúveis (aveia, psyllium, chia) e proteínas.',
      alert: 'Atenção médica recomendada. Evite açúcares livres, controle as porções de carboidratos nas refeições e nunca consuma carboidratos isolados (sempre associe a vegetais ou proteínas).'
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
      warning: 'Substitua gorduras saturadas (embutidos, frituras, queijos amarelos gordos) por gorduras mono e poli-insaturadas (azeite de oliva extra virgem, sementes, abacate e castanhas).',
      alert: 'Atenção ao risco cardiovascular. Aumente o consumo diário de fibras solúveis (beta-glucana da aveia, maçã com casca e leguminosas/feijões) que reduzem a absorção intestinal do colesterol.'
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
      alert: 'Deficiência significativa. Necessidade de reposição com orientação médica/nutricional para evitar fadiga crônica, danos neurológicos e anemia megaloblástica.'
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
