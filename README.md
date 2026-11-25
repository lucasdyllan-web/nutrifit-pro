# NutriFit Pro 🥗📊

Um webapp moderno e completo de **planejamento alimentar, monitoramento de consumo diário, interpretação de exames laboratoriais e projeção preditiva de peso** para os próximos 7 a 90 dias.

---

## 🚀 Como Executar

O **NutriFit Pro** foi desenvolvido com tecnologia web pura (HTML5, CSS3 moderno, Vanilla JavaScript ES6+), sem necessidade de instalar Node.js, Python ou qualquer dependência externa!

### Opção 1: Abrir Diretamente no Navegador (Mais Rápido)
Basta dar dois cliques no arquivo:
```
index.html
```
no seu navegador padrão (Google Chrome, Edge, Firefox, Brave, etc.).

### Opção 2: Iniciar Servidor Local via PowerShell
Se preferir rodar via HTTP local em `http://localhost:8080`:
1. Abra o PowerShell na pasta do projeto;
2. Execute:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Ele iniciará o servidor e mostrará inclusive o endereço para acessar direto do celular no mesmo Wi-Fi!

---

## 📱 Otimização Mobile & Funcionamento em Qualquer Rede (PWA)

O aplicativo foi transformado em um **Progressive Web App (PWA)** com suporte **100% Offline**:

1. **Barra de Navegação Inferior Ergonômica:** Em smartphones, o menu se move para a parte inferior da tela ao alcance do polegar (Início, Diário, Realidade, Exames e Projeção).
2. **Instalável como App Real:** Ao acessar pelo celular no Chrome ou Safari, surge o botão para **"Instalar App"** / **"Adicionar à Tela de Início"**. Ele abre em tela cheia com ícone próprio e sem a barra do navegador, exatamente como um aplicativo nativo baixado da Play Store ou App Store.
3. **Funciona Offline em Qualquer Rede:** Graças ao **Service Worker** (`sw.js`), todos os dados, cálculos, bancos de alimentos e gráficos continuam funcionando normalmente mesmo sem internet, em modo avião ou com conexão 3G instável.

### 🌐 Como Colocar no Ar Gratuitamente para Acessar de Qualquer Rede (4G/5G/Wi-Fi):
Como o projeto é 100% estático (sem backend pesado), você pode colocá-lo online em 1 minuto de graça com HTTPS:

* **Vercel (Recomendado):** Acesse [vercel.com](https://vercel.com), faça login com GitHub ou e-mail, importe a pasta e ganhe um domínio `https://nutrifit.vercel.app`.
* **Netlify Drop:** Acesse [app.netlify.com/drop](https://app.netlify.com/drop) e simplesmente arraste a pasta `c:\Webapp Dieta` para a janela do navegador. O site fica online imediatamente com link seguro mundial.
* **GitHub Pages:** Crie um repositório no GitHub, suba os arquivos e ative o *Pages* nas configurações do repositório.

---

## 🌟 Funcionalidades Principais

### 1. 📊 Dashboard Diário Completo
- **Balanço Calórico em Tempo Real**: Calorias consumidas vs Meta diária vs Gasto Energético Total (GET) e déficit calórico.
- **Macronutrientes Precisos**: Acompanhamento de Carboidratos, Proteínas, Gorduras e Fibras com barras de progresso e percentuais.
- **Rastreador de Hidratação Inteligente**: Cálculo automático de meta hídrica (35 ml por kg de peso corporal) e botões rápidos (+250ml, +500ml).
- **Alerta Clínico Resumido**: Detecta exames com alteração e avisa imediatamente no topo da tela.

### 2. 🍽️ Diário Alimentar Detalhado
- Divisão por refeições: **Café da Manhã**, **Almoço**, **Lanche da Tarde**, **Jantar** e **Ceia**.
- **Banco de Dados com 100+ alimentos brasileiros** (Tabela TACO/IBGE/USDA): arroz, feijão, frango, patinho, tilápia, ovos, aveia, frutas, azeite, castanhas, etc.
- **Busca Rápida**: Filtro instantâneo por nome ou categoria e ajuste da quantidade (em gramas ou ml).
- **Alimento Personalizado**: Adicione qualquer alimento customizado informando calorias e macronutrientes.
- Navegação por calendário/dias anteriores.

### 3. 🩺 Perfil Antropométrico & Painel de Exames Laboratoriais
- **Dados Corporais**: Altura, Peso atual, Peso meta, Idade, Sexo biológico e Nível de Atividade Física.
- **Cálculo Científico de TMB e GET**: Utiliza a fórmula padrão ouro **Mifflin-St Jeor**.
- **Classificação de IMC (OMS)** e cálculo da **Faixa de Peso Saudável Ideal** para a sua altura.
- **Painel de Biomarcadores Laboratoriais**:
  - Glicemia de Jejum & Hemoglobina Glicada (HbA1c)
  - Colesterol Total, HDL ("bom") e LDL ("ruim")
  - Triglicerídeos
  - Ácido Úrico
  - Vitamina D (25-OH) & Vitamina B12
  - Ferritina sérica (estoque de ferro)
  - TGO/AST e TGP/ALT (função hepática / esteatose)
  - Creatinina (função renal)
  - Proteína C Reativa (PCR ultrasensível - inflamação sistêmica)
- **Diretrizes Nutricionais Clínicas Automatizadas**: Gera orientações dietéticas específicas e personalizadas para qualquer exame que esteja fora da faixa desejável!

### 4. 📈 Projeção Preditiva dos Próximos Dias (7 a 90 Dias)
- **Modelo Cinético de Balanço Energético**: 
  - Considera $7.700 \text{ kcal}$ por kg de gordura corporal.
  - Compensa a **adaptação metabólica progressiva** (ajuste do BMR a cada quilo eliminado ao longo do tempo).
- **Marcos Futuros**:
  - Previsão de peso em **7 dias**, **14 dias**, **30 dias (1 mês)**, **60 dias (2 meses)** e **90 dias (3 meses)**.
- **Data Estimada para Atingir a Meta**:
  - Cálculo exato de quantos dias e qual a data prevista para alcançar o peso desejado mantendo o déficit atual.
- **Gráfico Interativo**:
  - Linha do tempo mostrando histórico real passado + curva preditiva futura + linha da meta.
  - Suporte a Chart.js e **renderizador SVG nativo de alta definição integrado** (garantia de funcionamento 100% offline).
- **Simulador Interativo de Cenários ("E se...?")**:
  - Sliders para simular: *"E se eu cortar mais 200 kcal?"* ou *"E se eu caminhar 45 min extras por dia?"*. Recálculo instantâneo na tela!

### 5. 🛒 Minha Realidade Alimentar & Dieta Sob Medida (NOVO!)
- **Você escolhe o que come**: marque os alimentos que você costuma ter em casa, que cabem no seu orçamento e no seu paladar (arroz, feijão, frango, ovos, pão, batata, aveia, frutas da estação, etc.).
- **Algoritmo de Montagem Proporcional**: o motor de otimização calcula as **porções exatas em gramas/unidades** para atingir com precisão a sua meta diária de calorias e distribuição de proteínas, carboidratos e gorduras.
- **Configuração de Rotina**: escolha quantas refeições faz por dia (3, 4 ou 5 refeições) e o estilo (Básico Brasileiro, Econômica, Alta Proteína).
- **Lançamento Automático no Diário com 1 Clique**: botão para transferir instantaneamente o cardápio calculado para o seu Diário Alimentar do dia.

### 6. 🥗 Cardápio Sugerido Inteligente
- Cardápio balanceado dividindo calorias entre as refeições do dia.
- **Ajustado pelos seus exames**: se seus triglicerídeos ou LDL estiverem alterados, o cardápio sugere automaticamente substituições funcionais (ex: aveia com canela, salmão rico em ômega-3, fitoesteróis e controle de carboidratos refinados).
- Botão para **Imprimir ou Salvar em PDF** para levar à sua consulta médica ou nutricionista.

### 7. 💾 Armazenamento & Segurança dos Seus Dados
- Todos os dados ficam salvos de forma 100% privada no `localStorage` do seu navegador.
- Funções de **Exportar Backup (JSON)** e **Importar Backup** no rodapé.
- Botão de **Restaurar Demonstração** para resetar os dados de exemplo quando desejar.

---

## 📁 Estrutura de Arquivos

```
c:\Webapp Dieta\
│
├── index.html               # Estrutura principal e layout semântico
├── server.ps1               # Servidor HTTP estático nativo em PowerShell
├── README.md                # Este documento de instruções
│
├── css/
│   └── styles.css           # Design system moderno, responsivo e temas
│
└── js/
    ├── foods-data.js        # Banco com 100+ alimentos e tabela nutricional
    ├── nutrition-calc.js    # Fórmulas de TMB, GET, IMC e macronutrientes
    ├── exams-analyzer.js    # Avaliação clínica de exames e condutas dietéticas
    ├── projection-engine.js # Motor matemático de projeção e gráfico preditivo
    ├── diet-builder.js      # Motor que monta o cardápio sob medida com suas comidas
    ├── storage.js           # Gerenciador de persistência local e backup
    └── app.js               # Controlador de interface e reatividade
```
