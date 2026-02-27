'use client';

import React from 'react';

const formatCurrency = (value) => {
  if (value == null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (isoString) => {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleDateString('pt-BR');
  } catch (e) {
    return '-';
  }
};

const GeradorRecibo = ({ processo, onClose }) => {
  const generatePDF = () => {
    const receboHTML = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recibo de Pagamento</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border: 2px solid #333;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          
          .header p {
            color: #666;
            font-size: 14px;
          }
          
          .content {
            margin-bottom: 30px;
          }
          
          .section {
            margin-bottom: 25px;
          }
          
          .section-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            font-size: 14px;
            text-transform: uppercase;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          
          .field {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
          }
          
          .field-label {
            font-weight: 600;
            color: #333;
            min-width: 200px;
          }
          
          .field-value {
            color: #666;
            text-align: right;
            flex: 1;
          }
          
          .amount-box {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #A03232;
            margin: 15px 0;
          }
          
          .total-amount {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 18px;
            font-weight: bold;
            color: #A03232;
            padding: 10px 0;
          }
          
          .parcelas-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          .parcelas-table th {
            background-color: #f0f0f0;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            font-size: 12px;
            border-bottom: 2px solid #333;
          }
          
          .parcelas-table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            font-size: 12px;
          }
          
          .status-pago {
            color: green;
            font-weight: bold;
          }
          
          .status-pendente {
            color: red;
            font-weight: bold;
          }
          
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          
          .signature-area {
            display: flex;
            justify-content: space-around;
            margin-top: 40px;
            padding-top: 40px;
          }
          
          .signature-line {
            text-align: center;
            width: 200px;
            border-top: 1px solid #333;
            padding-top: 10px;
            font-size: 12px;
          }
          
          @media print {
            body {
              background-color: white;
              padding: 0;
            }
            .container {
              box-shadow: none;
              border: 1px solid #ccc;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RECIBO DE PAGAMENTO</h1>
            <p>Recebimento de Honorários Advocatícios</p>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">Informações do Cliente</div>
              <div class="field">
                <span class="field-label">Cliente:</span>
                <span class="field-value">${processo.nomeCliente || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Processo:</span>
                <span class="field-value">${processo.numProcesso || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Tipo:</span>
                <span class="field-value">${processo.tipo || 'N/A'}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Informações de Pagamento</div>
              <div class="field">
                <span class="field-label">Status:</span>
                <span class="field-value">${processo.pagamento?.status || 'Não Pago'}</span>
              </div>
              <div class="field">
                <span class="field-label">Data do Pagamento:</span>
                <span class="field-value">${formatDate(processo.pagamento?.dataPagamento)}</span>
              </div>
            </div>
            
            <div class="amount-box">
              <div class="total-amount">
                <span>Valor Total Pago:</span>
                <span>${formatCurrency(processo.pagamento?.totalPago)}</span>
              </div>
            </div>
            
            ${
              processo.pagamento?.parcelas &&
              processo.pagamento.parcelas.length > 0
                ? `
              <div class="section">
                <div class="section-title">Parcelas</div>
                <table class="parcelas-table">
                  <thead>
                    <tr>
                      <th>Parcela</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${processo.pagamento.parcelas
                      .map(
                        (parcela) => `
                      <tr>
                        <td>${parcela.numero}</td>
                        <td>${formatCurrency(parcela.valor)}</td>
                        <td class="status-${parcela.pago ? 'pago' : 'pendente'}">
                          ${parcela.pago ? 'Pago' : 'Pendente'}
                        </td>
                        <td>${formatDate(parcela.data)}</td>
                      </tr>
                    `,
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
                : ''
            }
            
            <div class="section">
              <div class="section-title">Descrição</div>
              <p style="color: #666; font-size: 13px; line-height: 1.6;">
                Recebemos nesta data, de ${processo.nomeCliente || 'N/A'}, a quantia de ${formatCurrency(
                  processo.pagamento?.totalPago,
                )} 
                referente aos honorários advocatícios do processo ${processo.numProcesso || 'N/A'}.
              </p>
            </div>
          </div>
          
          <div class="signature-area">
            <div class="signature-line">
              Assinado digitalmente em ${new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
          
          <div class="footer">
            <p>Este recibo foi gerado automaticamente pelo Sistema Jurídico.</p>
            <p>Data e hora de geração: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=800,width=800');
    printWindow.document.write(receboHTML);
    printWindow.document.close();

    // Esperar um pouco para o documento estar pronto antes de imprimir
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 overflow-auto">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Gerar Recibo</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900">
            Processo: {processo.nomeCliente}
          </h4>
          <p className="text-sm text-gray-600">{processo.numProcesso}</p>

          <div className="bg-white p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status Pagamento:</span>
              <span className="font-semibold text-gray-900">
                {processo.pagamento?.status || 'Não Pago'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor Total:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(processo.pagamento?.totalPago)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data do Pagamento:</span>
              <span className="font-semibold text-gray-900">
                {formatDate(processo.pagamento?.dataPagamento)}
              </span>
            </div>
          </div>

          {processo.pagamento?.parcelas &&
            processo.pagamento.parcelas.length > 0 && (
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-2">Parcelas:</h5>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {processo.pagamento.parcelas.map((parcela, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm border-b pb-2"
                    >
                      <span className="text-gray-600">
                        Parcela {parcela.numero}
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(parcela.valor)}
                      </span>
                      <span
                        className={
                          parcela.pago ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {parcela.pago ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={generatePDF}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            📄 Gerar PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeradorRecibo;
