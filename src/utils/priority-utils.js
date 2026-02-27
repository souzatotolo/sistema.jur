// Definição do ranking de prioridade (menor número = maior prioridade)
// Definição do ranking de prioridade (menor número = maior prioridade)
// adicionei novos status para análise e finalizado/arquivado
export const PRIORITY_RANK = {
  'Prazo Processual': 1, // Vermelho (Máxima Urgência)
  'Fazer com prioridade': 2, // Laranja (Alta Prioridade)
  'Aguardando (Cliente)': 3,
  'Aguardando (Andamento Processual)': 4,
  Normal: 5,
  'Em analise - Iraci': 6,
  'Em analise - Ivana': 7,
  'Audiência Marcada': 8,
  Finalizado: 9,
  Arquivado: 10,
};

// Função para retornar a cor baseada na prioridade
// retorna uma cor básica para o badge de prioridade;
// cores não estão diretamente ligadas ao ranking acima
export const getPriorityColor = (status) => {
  switch (status) {
    case 'Prazo Processual':
    case 'Finalizado':
      // finalizado também deve ficar vermelho conforme pedido
      return 'gray';
    case 'Fazer com prioridade':
      return 'orange';
    case 'Aguardando (Cliente)':
    case 'Aguardando (Andamento Processual)':
      return 'blue';
    case 'Em analise - Iraci':
      return 'purple'; // roxo
    case 'Audiência Marcada':
      return 'red'; // amarelo / âmbar
    case 'Em analise - Ivana':
      return 'purple'; // marrom claro / âmbar
    default:
      return 'green'; // Normal, Arquivado e demais
  }
};

// Função de comparação para ordenação
export const compareProcessosByPriority = (a, b) => {
  const rankA = PRIORITY_RANK[a.statusPrioridade] || 99;
  const rankB = PRIORITY_RANK[b.statusPrioridade] || 99;
  return rankA - rankB;
};

// Comparador utilizado especificamente na tabela para levar em conta prazos/audiências
export const compareProcessosForTable = (a, b) => {
  // 1. processos com prazo aparecem primeiro (mais urgente = data mais próxima)
  if (a.prazo && b.prazo) {
    const diff = new Date(a.prazo) - new Date(b.prazo);
    if (diff !== 0) return diff;
  } else if (a.prazo) {
    return -1;
  } else if (b.prazo) {
    return 1;
  }

  // 2. sem prazos, processos com audiência sobem acima dos demais
  if (a.audiencia && b.audiencia) {
    const diff = new Date(a.audiencia) - new Date(b.audiencia);
    if (diff !== 0) return diff;
  } else if (a.audiencia) {
    return -1;
  } else if (b.audiencia) {
    return 1;
  }

  // 3. fallback para prioridade geral
  return compareProcessosByPriority(a, b);
};
