'use client';
import React, { useState, useRef, useEffect } from 'react';

// Função auxiliar para formatar datas no formato de input (YYYY-MM-DD)
const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);

  // CORREÇÃO: Garante que a data é tratada no fuso horário local para evitar problemas de dia
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .substring(0, 10);
};

const ProcessoForm = ({
  processo,
  fases,
  tipos,
  prioridades,
  onSave,
  onCancel,
  isNew = false,
}) => {
  // --- GARANTIA DE VALORES DEFAULT ---
  // Se for um novo processo, preenche a fase e o tipo com o primeiro item da lista.
  const initialFase = processo.fase || fases[0];
  const initialTipo = processo.tipo || tipos[0];
  const initialPrioridade = processo.statusPrioridade || prioridades[0];

  const [formData, setFormData] = useState({
    ...processo,
    valorCausa: processo.valorCausa || 0,
    fase: initialFase, // Novo default
    tipo: initialTipo, // Novo default
    statusPrioridade: initialPrioridade, // Novo default
    prazo: formatDateForInput(processo.prazo),
    audiencia: formatDateForInput(processo.audiencia),
    primeiroContato: formatDateForInput(processo.primeiroContato),
    ultimoContato: formatDateForInput(processo.ultimoContato),
  });
  // ---------------------------------

  // Referência para o container do formulário
  const formRef = useRef(null);

  // Lógica para fechar ao clicar fora (Mantida)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Converte valores de volta para tipos corretos antes de salvar no estado
    const savedData = {
      ...formData,
      valorCausa: parseFloat(formData.valorCausa) || 0,

      // Converte a string de data (YYYY-MM-DD) para objeto Date usando a hora 00:00:00
      prazo: formData.prazo ? new Date(formData.prazo + 'T00:00:00') : null,
      audiencia: formData.audiencia
        ? new Date(formData.audiencia + 'T00:00:00')
        : null,
      primeiroContato: formData.primeiroContato
        ? new Date(formData.primeiroContato + 'T00:00:00')
        : null,
      ultimoContato: formData.ultimoContato
        ? new Date(formData.ultimoContato + 'T00:00:00')
        : null,
    };

    onSave(savedData);
  };

  return (
    <div
      ref={formRef}
      className="fixed top-0 right-0 w-96 h-full bg-white shadow-2xl z-40 overflow-y-auto border-l border-gray-200"
    >
      <div className="p-5 border-b sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-gray-800">
          {isNew ? 'Novo Processo' : `Editando: ${processo.nomeCliente}`}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* CAMPOS GERAIS */}
        <h3 className="text-lg font-bold mt-4 border-b pb-1">Geral</h3>
        <InputField
          label="Nome do Cliente"
          name="nomeCliente"
          value={formData.nomeCliente || ''}
          onChange={handleChange}
          required
        />
        <InputField
          label="Contato"
          name="contato"
          value={formData.contato || ''}
          onChange={handleChange}
        />
        <InputField
          label="Valor da Causa (R$)"
          name="valorCausa"
          value={formData.valorCausa}
          onChange={handleChange}
          type="number"
          step="0.01"
        />

        {/* STATUS E FLUXO */}
        <h3 className="text-lg font-bold mt-4 border-b pb-1">Status e Fluxo</h3>
        <SelectField
          label="Fase"
          name="fase"
          value={formData.fase}
          onChange={handleChange}
          options={fases}
          required
        />
        <SelectField
          label="Prioridade/Status"
          name="statusPrioridade"
          value={formData.statusPrioridade}
          onChange={handleChange}
          options={prioridades}
        />
        <InputField
          label="Próximo Passo"
          name="proximoPasso"
          value={formData.proximoPasso || ''}
          onChange={handleChange}
        />

        {/* DADOS PROCESSUAIS E PRAZOS */}
        <h3 className="text-lg font-bold mt-4 border-b pb-1">
          Processo e Prazos
        </h3>
        <InputField
          label="N° do Processo"
          name="numProcesso"
          value={formData.numProcesso || ''}
          onChange={handleChange}
        />
        <InputField
          label="Vara"
          name="vara"
          value={formData.vara || ''}
          onChange={handleChange}
        />
        <SelectField
          label="Tipo"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          options={tipos}
          required
        />
        <InputField
          label="Prazo Final"
          name="prazo"
          value={formData.prazo || ''}
          onChange={handleChange}
          type="date"
        />
        <InputField
          label="Audiência"
          name="audiencia"
          value={formData.audiencia || ''}
          onChange={handleChange}
          type="date"
        />

        {/* ORIGEM E PARCERIA */}
        <h3 className="text-lg font-bold mt-4 border-b pb-1">Origem</h3>
        <InputField
          label="Indicação"
          name="indicacao"
          value={formData.indicacao || ''}
          onChange={handleChange}
        />
        <InputField
          label="Primeiro Contato"
          name="primeiroContato"
          value={formData.primeiroContato || ''}
          onChange={handleChange}
          type="date"
        />
        <InputField
          label="Último Contato"
          name="ultimoContato"
          value={formData.ultimoContato || ''}
          onChange={handleChange}
          type="date"
        />
        <InputField
          label="Parceria"
          name="parceria"
          value={formData.parceria || ''}
          onChange={handleChange}
        />
        <InputField
          label="Porcentagem"
          name="porcentagem"
          value={formData.porcentagem || ''}
          onChange={handleChange}
        />

        {/* OBSERVAÇÃO */}
        <h3 className="text-lg font-bold mt-4 border-b pb-1">Observação</h3>
        <textarea
          name="observacao"
          value={formData.observacao || ''}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:border-blue-500"
          rows="3"
        />

        {/* BOTÕES DE AÇÃO */}
        <div className="pt-5 border-t flex flex-col space-y-2">
          <button
            type="submit"
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            {isNew ? 'Criar Processo' : 'Salvar Alterações'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-gray-800 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

// Componente auxiliar para Input padrão
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  ...rest
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:border-blue-500"
      {...rest}
    />
  </div>
);

// Componente auxiliar para Select Field
const SelectField = ({ label, name, value, onChange, options, ...rest }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:border-blue-500"
      {...rest}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default ProcessoForm;
