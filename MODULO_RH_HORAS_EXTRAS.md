# 📋 Módulo RH - Cálculo de Horas Extras

## ✅ Sistema de Horas Extras IMPLEMENTADO

### 🎯 Funcionalidades Ativas

✅ **Cadastro de Funcionários**
- Nome completo
- Cargo (Operário, Supervisor, Gerente, Diretor)
- Data de admissão
- Tempo de empresa calculado automaticamente

✅ **Cálculo de Horas Extras**
- Adicional de **50% sobre o valor da hora** (conforme CLT)
- Fórmula: `Valor Hora Extra = Valor/hora × 1.5`
- Campo individual por funcionário
- Permite valores fracionados (0.5h = 30 minutos)

✅ **Cálculos Trabalhistas (2025)**
- **INSS Progressivo**: 7,5% a 14% (teto R$ 908,85)
- **IR Progressivo**: Isento a 27,5%
- **Base de Cálculo**: 220 horas mensais (44h/semana)

✅ **Folha de Pagamento Completa**
- Salário base (220h normais)
- Horas extras com adicional de 50%
- Descontos (INSS + IR)
- Salário líquido
- Totalizadores

---

## 💰 Como Funciona o Cálculo

### 1. Valores por Cargo

| Cargo | Valor/Hora | Salário Base (220h) |
|-------|-----------|-------------------|
| 🔧 Operário | R$ 15,00 | R$ 3.300,00 |
| 👷 Supervisor | R$ 40,00 | R$ 8.800,00 |
| 👔 Gerente | R$ 60,00 | R$ 13.200,00 |
| 💼 Diretor | R$ 80,00 | R$ 17.600,00 |

### 2. Cálculo de Horas Extras

**Fórmula Legal (CLT):**
```
Hora Extra = Valor/hora × 1,5

Exemplo para Operário:
- Valor/hora normal: R$ 15,00
- Valor/hora extra: R$ 15,00 × 1,5 = R$ 22,50
- 10h extras no mês: 10 × R$ 22,50 = R$ 225,00
```

**Exemplo Completo - Operário com 10h extras:**
```
Salário Base:     R$ 3.300,00  (220h × R$ 15/h)
Horas Extras:     R$   225,00  (10h × R$ 22,50/h)
──────────────────────────────────────────────
Salário Bruto:    R$ 3.525,00
INSS (12%):       R$   423,00
IR (7,5%):        R$    95,65
──────────────────────────────────────────────
Salário Líquido:  R$ 3.006,35
```

### 3. Tabela INSS 2025 (Progressivo)

| Faixa Salarial | Alíquota | Cálculo |
|---------------|----------|---------|
| Até R$ 1.412,00 | 7,5% | Valor × 0,075 |
| R$ 1.412,01 - R$ 2.666,68 | 9% | Progressivo |
| R$ 2.666,69 - R$ 4.000,03 | 12% | Progressivo |
| R$ 4.000,04 - R$ 7.786,02 | 14% | Progressivo |
| Acima de R$ 7.786,02 | Teto | R$ 908,85 |

### 4. Tabela IR 2025 (Progressivo)

| Base de Cálculo | Alíquota | Dedução |
|----------------|----------|---------|
| Até R$ 2.259,20 | Isento | R$ 0,00 |
| R$ 2.259,21 - R$ 2.826,65 | 7,5% | R$ 169,44 |
| R$ 2.826,66 - R$ 3.751,05 | 15% | R$ 381,44 |
| R$ 3.751,06 - R$ 4.664,68 | 22,5% | R$ 662,77 |
| Acima de R$ 4.664,68 | 27,5% | R$ 896,00 |

---

## 🖥️ Como Usar no Sistema

### Passo 1: Cadastrar Funcionário

1. Preencha o formulário:
   - **Nome**: Nome completo do funcionário
   - **Cargo**: Selecione da lista (define valor/hora)
   - **Admissão**: Data de entrada na empresa

2. Clique em "Salvar Funcionário"

### Passo 2: Registrar Horas Extras

Para cada funcionário cadastrado:

1. Localize o campo **"⏰ Horas Extras (mês)"**
2. Digite a quantidade de horas extras do mês
   - Aceita valores inteiros: `5` (5 horas)
   - Aceita valores decimais: `2.5` (2h30min)
3. O sistema calcula automaticamente com adicional de 50%

### Passo 3: Calcular Folha

1. Clique no botão **"Calcular Folha de Pagamento (Mês Atual)"**
2. O sistema processa:
   - ✅ Salário base de cada funcionário
   - ✅ Horas extras com adicional de 50%
   - ✅ Salário bruto (base + extras)
   - ✅ Descontos (INSS + IR progressivos)
   - ✅ Salário líquido final

### Passo 4: Visualizar Resultados

A tabela mostra:
- **Coluna HE**: Quantidade de horas extras registradas
- **Valor HE (+50%)**: Valor total das horas extras calculado
- **Salário Bruto**: Base + Horas Extras
- **Descontos**: INSS e IR detalhados
- **Salário Líquido**: Valor final a pagar

### Passo 5: Exportar PDF (Opcional)

1. Após calcular a folha, clique em **"Exportar PDF"**
2. O sistema gera arquivo com:
   - Dados completos da folha
   - Tabela de funcionários
   - Totalizadores
   - Data de emissão

---

## 📊 Visualização no Sistema

### Tabela de Folha de Pagamento

```
┌────┬────────────┬─────────────┬─────┬─────────────┬──────────────┬──────────────┬─────────┬────────┬──────────────┐
│ #  │ 👤 Nome    │ 💼 Cargo    │ ⏰ HE│ 💰 Base     │ ⚡ Valor HE  │ 📊 Bruto     │ 🏛️ INSS │ 🏦 IR  │ ✅ Líquido   │
├────┼────────────┼─────────────┼─────┼─────────────┼──────────────┼──────────────┼─────────┼────────┼──────────────┤
│ 1  │ João Silva │ Operário    │ 10h │ R$ 3.300,00 │ + R$ 225,00  │ R$ 3.525,00  │ R$ 423  │ R$ 96  │ R$ 3.006,35  │
│ 2  │ Maria Souza│ Supervisor  │ 5h  │ R$ 8.800,00 │ + R$ 300,00  │ R$ 9.100,00  │ R$ 909  │ R$ 940 │ R$ 7.251,00  │
│ 3  │ Carlos Lima│ Gerente     │ 0   │ R$ 13.200,00│ -            │ R$ 13.200,00 │ R$ 909  │ R$ 2k  │ R$ 10.291,00 │
└────┴────────────┴─────────────┴─────┴─────────────┴──────────────┴──────────────┴─────────┴────────┴──────────────┘

RESUMO:
• Total Bruto: R$ 25.825,00
• Total Descontos: R$ 5.277,00
• Total Líquido: R$ 20.548,00
```

---

## 🎨 Recursos Visuais

### Cards de Funcionários
- **Cores por Cargo**: Cada cargo tem cor distintiva
- **Hover Effects**: Cards destacam ao passar o mouse
- **Tempo de Empresa**: Calculado automaticamente
- **Campo de Horas Extras**: Visível em cada card

### Tabela da Folha
- **Gradiente no Cabeçalho**: Visual profissional
- **Cores Semânticas**: 
  - 🟢 Verde para valores positivos (salário líquido)
  - 🔴 Vermelho para descontos (INSS, IR)
  - 🟠 Laranja para horas extras
- **Hover em Linhas**: Destaque ao passar o mouse
- **Responsivo**: Adapta-se a telas pequenas

---

## 🔧 Detalhes Técnicos

### Fórmulas Implementadas

**1. Salário Base:**
```javascript
const salarioBase = valorHora * 220; // 220h mensais
```

**2. Horas Extras (+50%):**
```javascript
const valorHorasExtras = horasExtras * (valorHora * 1.5);
```

**3. Salário Bruto:**
```javascript
const salarioBruto = salarioBase + valorHorasExtras;
```

**4. INSS Progressivo:**
```javascript
function calcularINSS(salario) {
    // Cálculo progressivo por faixas
    // Retorna valor do desconto
}
```

**5. IR Progressivo:**
```javascript
function calcularIR(baseCalculo) {
    // Base = Salário Bruto - INSS
    // Cálculo progressivo por faixas
    // Retorna valor do desconto
}
```

**6. Salário Líquido:**
```javascript
const salarioLiquido = salarioBruto - inss - ir;
```

---

## 📱 Responsividade

### Desktop (> 1024px)
- Grade com 3-4 cards por linha
- Tabela completa visível
- Todos os campos lado a lado

### Tablet (768px - 1024px)
- Grade com 2 cards por linha
- Tabela com scroll horizontal
- Campos empilhados

### Mobile (< 768px)
- Grade com 1 card por linha
- Tabela scrollável horizontalmente
- Layout vertical otimizado

---

## ✅ Validações Implementadas

1. **Campo de Horas Extras:**
   - ✅ Mínimo: 0 horas
   - ✅ Máximo: 100 horas
   - ✅ Incremento: 0.5 (permite 30 minutos)
   - ✅ Valor padrão: 0

2. **Cálculo de INSS:**
   - ✅ Teto máximo respeitado
   - ✅ Progressão correta por faixas
   - ✅ Arredondamento para 2 casas decimais

3. **Cálculo de IR:**
   - ✅ Dedução do INSS antes do cálculo
   - ✅ Faixa de isenção respeitada
   - ✅ Não permite valores negativos

---

## 🆘 Troubleshooting

### "Horas extras não aparecem no cálculo"
✅ **Solução**: Certifique-se de digitar um valor no campo "Horas Extras" antes de calcular a folha.

### "Valores diferentes do esperado"
✅ **Solução**: Lembre-se que:
- INSS e IR são progressivos (calculados por faixas)
- Horas extras têm adicional de 50% sobre o valor/hora
- Base de cálculo é 220h mensais

### "PDF não exporta corretamente"
✅ **Solução**: 
1. Calcule a folha primeiro
2. Aguarde o carregamento completo
3. Tente exportar novamente

---

## 📚 Referências Legais

- **CLT Art. 59**: Horas extras com adicional mínimo de 50%
- **Lei 8.212/1991**: Tabela INSS 2025
- **Lei 9.250/1995**: Tabela IR 2025
- **Portaria MTP 3.659/2023**: Salário mínimo e base de cálculo

---

## 🎯 Casos de Uso Reais

### Caso 1: Operário com Horas Extras
```
Funcionário: João Silva
Cargo: Operário (R$ 15/h)
Horas Extras: 20h

Cálculo:
• Base: 220h × R$ 15 = R$ 3.300,00
• HE: 20h × R$ 22,50 = R$ 450,00
• Bruto: R$ 3.750,00
• Líquido: ~R$ 3.200,00
```

### Caso 2: Supervisor sem Horas Extras
```
Funcionário: Maria Santos
Cargo: Supervisor (R$ 40/h)
Horas Extras: 0h

Cálculo:
• Base: 220h × R$ 40 = R$ 8.800,00
• HE: 0h = R$ 0,00
• Bruto: R$ 8.800,00
• Líquido: ~R$ 7.200,00
```

### Caso 3: Gerente com Meio Período Extra
```
Funcionário: Carlos Oliveira
Cargo: Gerente (R$ 60/h)
Horas Extras: 2.5h (2h30min)

Cálculo:
• Base: 220h × R$ 60 = R$ 13.200,00
• HE: 2.5h × R$ 90 = R$ 225,00
• Bruto: R$ 13.425,00
• Líquido: ~R$ 10.800,00
```

---

## 🚀 Melhorias Futuras (Sugestões)

- [ ] Banco de horas
- [ ] Histórico mensal de folhas
- [ ] Adicionais noturnos
- [ ] Insalubridade/Periculosidade
- [ ] Vale transporte/alimentação
- [ ] Férias e 13º salário
- [ ] Integração com ponto eletrônico

---

**Versão**: 21.0 - Horas Extras Completo  
**Data**: Dezembro 2025  
**Status**: ✅ Totalmente Funcional
