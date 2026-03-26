'use client';
import React, { useState, useRef, useEffect } from 'react';

const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .substring(0, 10);
};

const ProcessoForm = ({ processo, fases, tipos, prioridades, onSave, onCancel, isNew = false }) => {
  const initialFase = processo.fase || fases[0];
  const initialTipo = processo.tipo || tipos[0];
  const initialPrioridade = processo.statusPrioridade || prioridades[0];

  const [formData, setFormData] = useState({
    ...processo,
    valorCausa: processo.valorCausa || 0,
    fase: initialFase,
    tipo: initialTipo,
    statusPrioridade: initialPrioridade,
    prazo: formatDateForInput(processo.prazo),
    audiencia: formatDateForInput(processo.audiencia),
    primeiroContato: formatDateForInput(processo.primeiroContato),
    ultimoContato: formatDateForInput(processo.ultimoContato),
  });

  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const savedData = {
      ...formData,
      valorCausa: parseFloat(formData.valorCausa) || 0,
      prazo: formData.prazo ? new Date(formData.prazo + 'T00:00:00') : null,
      audiencia: formData.audiencia ? new Date(formData.audiencia + 'T00:00:00') : null,
      primeiroContato: formData.primeiroContato ? new Date(formData.primeiroContato + 'T00:00:00') : null,
      ultimoContato: formData.ultimoContato ? new Date(formData.ultimoContato + 'T00:00:00') : null,
    };
    onSave(savedData);
  };

  return (
    <div
      ref={formRef}
      className="fixed top-0 right-0 w-[420px] h-full bg-white shadow-2xl z-40 flex flex-col border-l border-[#EDE8E5]"
    >
      {/* Cabeçalho */}
      <div className="bg-[#610013] px-5 py-4 flex-shrink-0">
        <h2 className="font-display text-lg font-bold text-white">
          {isNew ? 'Novo Processo' : `Editando: ${processo.nomeCliente}`}
        </h2>
        <p className="text-[#F0D9CC]/60 text-xs mt-0.5">
          {isNew ? 'Preencha os dados do processo' : 'Atualize as informações'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Geral */}
        <FormSection title="Geral">
          <InputField label="Nome do Cliente" name="nomeCliente" value={formData.nomeCliente || ''} onChange={handleChange} required />
          <InputField label="Contato" name="contato" value={formData.contato || ''} onChange={handleChange} />
          <InputField label="Valor da Causa (R$)" name="valorCausa" value={formData.valorCausa} onChange={handleChange} type="number" step="0.01" />
        </FormSection>

        {/* Status e Fluxo */}
        <FormSection title="Status e Fluxo">
          <SelectField label="Fase" name="fase" value={formData.fase} onChange={handleChange} options={fases} required />
          <SelectField label="Prioridade / Status" name="statusPrioridade" value={formData.statusPrioridade} onChange={handleChange} options={prioridades} />
          <InputField label="Próximo Passo" name="proximoPasso" value={formData.proximoPasso || ''} onChange={handleChange} />
        </FormSection>

        {/* Processo e Prazos */}
        <FormSection title="Processo e Prazos">
          <InputField label="N° do Processo" name="numProcesso" value={formData.numProcesso || ''} onChange={handleChange} />
          <InputField label="Vara" name="vara" value={formData.vara || ''} onChange={handleChange} />
          <SelectField label="Tipo" name="tipo" value={formData.tipo} onChange={handleChange} options={tipos} required />
          <InputField label="Prazo Final" name="prazo" value={formData.prazo || ''} onChange={handleChange} type="date" />
          <InputField label="Audiência" name="audiencia" value={formData.audiencia || ''} onChange={handleChange} type="date" />
        </FormSection>

        {/* Origem */}
        <FormSection title="Origem">
          <InputField label="Indicação" name="indicacao" value={formData.indicacao || ''} onChange={handleChange} />
          <InputField label="Primeiro Contato" name="primeiroContato" value={formData.primeiroContato || ''} onChange={handleChange} type="date" />
          <InputField label="Último Contato" name="ultimoContato" value={formData.ultimoContato || ''} onChange={handleChange} type="date" />
          <InputField label="Parceria" name="parceria" value={formData.parceria || ''} onChange={handleChange} />
          <InputField label="Porcentagem" name="porcentagem" value={formData.porcentagem || ''} onChange={handleChange} />
        </FormSection>

        {/* Observação */}
        <FormSection title="Observação">
          <textarea
            name="observacao"
            value={formData.observacao || ''}
            onChange={handleChange}
            className="w-full p-3 border border-[#AA8F71]/30 rounded-lg text-sm focus:outline-none focus:border-[#610013] focus:ring-1 focus:ring-[#610013] resize-none text-[#161616]"
            rows="3"
            placeholder="Observações sobre o processo..."
          />
        </FormSection>

        {/* Botões */}
        <div className="pt-2 pb-4 space-y-2">
          <button
            type="submit"
            className="w-full py-3 bg-[#610013] text-white text-sm font-semibold rounded-lg hover:bg-[#4a000f] transition-colors"
          >
            {isNew ? 'Criar Processo' : 'Salvar Alterações'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 bg-[#EDE8E5] text-[#161616]/70 text-sm font-semibold rounded-lg hover:bg-[#AA8F71]/20 transition-colors border border-[#AA8F71]/20"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

const FormSection = ({ title, children }) => (
  <div>
    <h3 className="font-display text-xs font-bold text-[#610013] uppercase tracking-wider mb-3 pb-1.5 border-b border-[#EDE8E5]">
      {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const InputField = ({ label, name, value, onChange, type = 'text', ...rest }) => (
  <div>
    <label className="block text-xs font-semibold text-[#161616]/70 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-[#AA8F71]/30 rounded-lg text-sm text-[#161616] bg-white focus:outline-none focus:border-[#610013] focus:ring-1 focus:ring-[#610013] transition-colors"
      {...rest}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, ...rest }) => (
  <div>
    <label className="block text-xs font-semibold text-[#161616]/70 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-[#AA8F71]/30 rounded-lg text-sm text-[#161616] bg-white focus:outline-none focus:border-[#610013] focus:ring-1 focus:ring-[#610013] transition-colors"
      {...rest}
    >
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

export default ProcessoForm;
