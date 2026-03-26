# Sistema Jurídico — Marta Neumann Advogada

Sistema de gestão de processos jurídicos desenvolvido para o escritório de advocacia de Marta Neumann.

## Arquitetura do Projeto

### Dois Repositórios Separados

| Repositório | Tecnologia | Localização |
|---|---|---|
| Frontend | Next.js 15 + React 19 + Tailwind CSS v4 | `/Users/richardtotolo/Documents/DEV/sistema-juridico` |
| Backend API | Express.js 5 + MongoDB/Mongoose | `/Users/richardtotolo/Documents/DEV/sistema-juridico-api` |

### Frontend — Estrutura de Pastas

```
src/
├── app/
│   ├── page.js                    # Dashboard principal — Kanban + Tabela de processos
│   ├── login/page.js              # Autenticação
│   ├── calendario/page.js         # Calendário e agenda (prazos + audiências)
│   ├── arquivo-financeiro/page.js # Gestão financeira e geração de recibos
│   ├── publicacoes/page.js        # (em desenvolvimento)
│   ├── layout.js
│   └── globals.css
├── components/
│   ├── Sidebar.js
│   ├── ProcessoForm.js
│   ├── ProcessoDetalhe.js
│   ├── ProcessosTable.js
│   ├── KanbanColumn.js
│   ├── ProcessoCard.js
│   ├── PagamentoForm.js
│   └── GeradorRecibo.js
├── hooks/
│   └── useAuth.js                 # Gerenciamento de autenticação JWT + localStorage
├── utils/
│   └── priority-utils.js          # Sistema de prioridades (1-10) e cores por status
└── assets/
    └── logo.png
```

### Backend — Estrutura de Pastas

```
src/
├── Controllers/
│   ├── authController.js
│   └── eventoController.js
├── Models/
│   ├── User.js
│   ├── Processo.js
│   └── Evento.js
└── Middleware/
    └── authMiddleware.js
server.js                          # Entry point Express
```

## Tecnologias

- **Frontend:** Next.js 15.5.9, React 19.1.0, Tailwind CSS v4, react-beautiful-dnd, react-icons
- **Backend:** Express 5.1.0, Mongoose 8.19.0, JWT (jsonwebtoken), bcryptjs
- **Banco de Dados:** MongoDB Atlas
- **Deploy API:** Render (`https://api-sistema-jur.onrender.com/api`)
- **Path alias frontend:** `@/*` → `./src/*`

## Autenticação

- JWT com expiração de 1 dia, armazenado em `localStorage` como `authToken`
- Todas as requisições protegidas enviam `Authorization: Bearer {token}`
- Apenas 2 usuários permitidos: `martancouto` e `richardtotolo`
- Rotas não autenticadas redirecionam para `/login`

## Modelos de Dados Principais

### Processo
```js
{
  nomeCliente, contato, indicacao, primeiroContato, parceria,
  numProcesso, vara, tipo,
  fase: ['Pré-processual', 'Analise de Doc.', 'Extra-Judicial', 'Judicial'],
  prazo, audiencia, ultimoContato,
  statusPrioridade, proximoPasso, observacao,
  valorCausa, meus,
  pagamento: { status, totalPago, dataPagamento, parcelas[] },
  historico: [{ data, descricao }]
}
```

### Evento
```js
{
  titulo, descricao,
  tipo: ['Audiência', 'Reunião', 'Prazo', 'Outro'],
  dataInicio, dataFim,
  processoId, local, notas, concluido
}
```

## Sistema de Prioridades

O arquivo `priority-utils.js` define 10 níveis de prioridade e cores associadas:

| Rank | Status |
|---|---|
| 1 | Prazo Processual |
| 2 | Fazer com prioridade |
| 3 | Aguardando (Cliente) |
| 4 | Aguardando (Andamento Processual) |
| 5 | Normal |
| 6 | Em analise - Iraci |
| 7 | Em analise - Ivana |
| 8 | Audiência Marcada |
| 9 | Finalizado |
| 10 | Arquivado |

A tabela de processos ordena por: processos com prazo → processos com audiência → rank geral.

## Identidade Visual — Brandbook Marta Neumann

A interface deve seguir rigorosamente o brandbook da marca.

### Paleta de Cores

**Primárias:**

| Token | Hex | Uso |
|---|---|---|
| Vinho (principal) | `#610013` | Cor dominante, cabeçalhos, elementos de destaque |
| Dourado | `#D69957` | Acentos, ícones de destaque, detalhes da marca |
| Rosa claro | `#F0D9CC` | Fundos suaves, áreas de conteúdo claro |

**Secundárias:**

| Token | Hex | Uso |
|---|---|---|
| Taupe | `#AA8F71` | Elementos neutros, bordas suaves |
| Off-white | `#EDE8E5` | Backgrounds, cards, separadores |
| Quase preto | `#161616` | Textos principais, elementos escuros |

### Tipografia

- **Títulos e destaques:** `Playfair Display` — elegante, serifada, autoridade
- **Textos gerais e UI:** `Nunito Sans` — limpa, legível, digital-first

Ambas as fontes estão disponíveis no Google Fonts.

### Diretrizes Visuais

- Tom: sofisticado, acolhedor, humano, confiável — nunca frio ou excessivamente técnico
- Linguagem visual limpa, com uso equilibrado de cores
- Hierarquia tipográfica clara: Playfair para títulos, Nunito Sans para corpo e UI
- Não usar gradientes complexos, sombras pesadas ou efeitos excessivos
- Preferir espaçamento generoso e layouts com respiro visual

## Convenções de Código

- Todo código de página usa `'use client'` (Client Components)
- Estado global de autenticação via hook `useAuth`
- API URL de produção hardcoded nas páginas — considerar centralizar em uma constante
- Datas: usar `formatDateForInput()` para evitar problemas de timezone
- Moeda: sempre formatar com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- Idioma da interface: **Português Brasileiro**

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Registro |
| PUT | `/api/auth/change-password` | Alterar senha |
| GET | `/api/processos` | Listar processos (agrupados por fase) |
| POST | `/api/processos` | Criar processo |
| PUT | `/api/processos/:id` | Atualizar processo |
| POST | `/api/processos/:id/historico` | Adicionar histórico |
| DELETE | `/api/processos/:id` | Deletar processo |
| GET | `/api/eventos` | Listar eventos |
| POST | `/api/eventos` | Criar evento |
| PUT | `/api/eventos/:id` | Atualizar evento |
| DELETE | `/api/eventos/:id` | Deletar evento |

## Contexto do Negócio

- **Cliente:** Marta Neumann — advogada solo com foco em atendimento humano e próximo
- **Usuários do sistema:** Marta e colaboradoras (Iraci, Ivana)
- **Propósito:** Gestão interna de processos jurídicos, prazos, audiências e financeiro
- **Tagline da marca:** "Cuidando de cada detalhe"
- **Posicionamento:** Advocacia sofisticada, acessível e com atenção aos detalhes — diferente do padrão impessoal do setor

## Observações Importantes

- A página `/publicacoes` existe mas está sem implementação
- O backend usa `react-beautiful-dnd` virtuais IDs via Mongoose virtual `id` para compatibilidade com o MongoDB `_id`
- O drag-and-drop do Kanban atualiza a fase do processo via `PUT /api/processos/:id` imediatamente
- O histórico de atualizações em cada processo é append-only (nunca deletar entradas do histórico)
