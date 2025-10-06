// Definição do ranking de prioridade (menor número = maior prioridade)
export const PRIORITY_RANK = {
  'Prazo Processual': 1, // Vermelho (Máxima Urgência)
  'Fazer com prioridade': 2, // Laranja (Alta Prioridade)
  'Aguardando (Cliente)': 3,
  'Aguardando (Andamento Processual)': 4,
  Normal: 5,
};

// Função para retornar a cor baseada na prioridade
export const getPriorityColor = (status) => {
  const rank = PRIORITY_RANK[status] || 99;
  if (rank === 1) return 'red';
  if (rank === 2) return 'orange';
  if (rank === 3 || rank === 4) return 'blue';
  return 'green'; // 'Normal' e outros
};

// Função de comparação para ordenação
export const compareProcessosByPriority = (a, b) => {
  const rankA = PRIORITY_RANK[a.statusPrioridade] || 99;
  const rankB = PRIORITY_RANK[b.statusPrioridade] || 99;
  return rankA - rankB;
};
