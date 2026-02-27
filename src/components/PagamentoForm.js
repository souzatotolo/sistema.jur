import React, { useState, useEffect } from 'react';

const PagamentoForm = ({ processo, onSave, onCancel, onGenerateRecibo }) => {
  const [pagamento, setPagamento] = useState({
    status: 'Não Pago',
    totalPago: 0,
    dataPagamento: '',
    parcelas: [],
  });

  useEffect(() => {
    if (processo.pagamento) {
      setPagamento({
        status: processo.pagamento.status || 'Não Pago',
        totalPago: processo.pagamento.totalPago || 0,
        dataPagamento: processo.pagamento.dataPagamento
          ? processo.pagamento.dataPagamento.split('T')[0]
          : '',
        parcelas: processo.pagamento.parcelas || [],
      });
    }
  }, [processo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPagamento((prev) => ({
      ...prev,
      [name]: name === 'dataPagamento' ? (value === '' ? null : value) : value,
    }));
  };

  const handleAddParcela = () => {
    setPagamento((prev) => ({
      ...prev,
      parcelas: [
        ...prev.parcelas,
        { numero: prev.parcelas.length + 1, valor: 0, data: '', pago: false },
      ],
    }));
  };

  const handleParcelaChange = (index, field, value) => {
    setPagamento((prev) => ({
      ...prev,
      parcelas: prev.parcelas.map((p, i) =>
        i === index
          ? {
              ...p,
              [field]:
                field === 'valor'
                  ? parseFloat(value) || 0
                  : field === 'pago'
                    ? value === 'true' || value === true
                    : field === 'data'
                      ? value === ''
                        ? null
                        : value
                      : value,
            }
          : p,
      ),
    }));
  };

  const handleRemoveParcela = (index) => {
    setPagamento((prev) => ({
      ...prev,
      parcelas: prev.parcelas.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(pagamento);
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4">
        Editar Pagamento - {processo.nomeCliente}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status do Pagamento
          </label>
          <select
            name="status"
            value={pagamento.status}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="Não Pago">Não Pago</option>
            <option value="Parcial">Parcial</option>
            <option value="Pago">Pago</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Pago
          </label>
          <input
            type="number"
            name="totalPago"
            value={pagamento.totalPago}
            onChange={(e) =>
              setPagamento((prev) => ({
                ...prev,
                totalPago: parseFloat(e.target.value) || 0,
              }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Data do Pagamento
          </label>
          <input
            type="date"
            name="dataPagamento"
            value={pagamento.dataPagamento || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parcelas
          </label>
          {pagamento.parcelas.length > 0 && (
            <div className="mb-2">
              <table className="min-w-full table-auto border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-left text-xs">N°</th>
                    <th className="px-2 py-1 text-left text-xs">Valor</th>
                    <th className="px-2 py-1 text-left text-xs">Data</th>
                    <th className="px-2 py-1 text-left text-xs">Pago</th>
                    <th className="px-2 py-1 text-left text-xs">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamento.parcelas.map((parcela, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-2 py-1 text-sm">{parcela.numero}</td>
                      <td className="px-2 py-1 text-sm">
                        <input
                          type="number"
                          value={parcela.valor}
                          onChange={(e) =>
                            handleParcelaChange(index, 'valor', e.target.value)
                          }
                          className="w-full border border-gray-300 rounded p-1 text-sm"
                          step="0.01"
                        />
                      </td>
                      <td className="px-2 py-1 text-sm">
                        <input
                          type="date"
                          value={parcela.data ? parcela.data.split('T')[0] : ''}
                          onChange={(e) =>
                            handleParcelaChange(index, 'data', e.target.value)
                          }
                          className="w-full border border-gray-300 rounded p-1 text-sm"
                        />
                      </td>
                      <td className="px-2 py-1 text-sm">
                        <select
                          value={parcela.pago}
                          onChange={(e) =>
                            handleParcelaChange(index, 'pago', e.target.value)
                          }
                          className="w-full border border-gray-300 rounded p-1 text-sm"
                        >
                          <option value={false}>Pendente</option>
                          <option value={true}>Pago</option>
                        </select>
                      </td>
                      <td className="px-2 py-1 text-sm">
                        <button
                          type="button"
                          onClick={() => handleRemoveParcela(index)}
                          className="text-red-500 hover:text-red-700 text-lg font-bold"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button
            type="button"
            onClick={handleAddParcela}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Adicionar Parcela
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
          {onGenerateRecibo && pagamento.status === 'Pago' && (
            <button
              type="button"
              onClick={onGenerateRecibo}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
            >
              📄 Gerar Recibo
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PagamentoForm;
