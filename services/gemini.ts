
import { GoogleGenAI } from "@google/genai";
import { ProductionEntry, FinancialSummary } from "../types";

export const getBusinessInsights = async (
  production: ProductionEntry[],
  summary: FinancialSummary
): Promise<string> => {
  // Use strictly the prescribed initialization format with named parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Atue como um consultor de gestão de produção têxtil.
    Analise os dados de produção do meu ateliê e forneça insights acionáveis sobre os pagamentos e produtividade da equipe.

    DADOS DE PRODUÇÃO:
    ${JSON.stringify(production.map(p => ({ costureiro: p.seamstress, produto: p.product, q: p.quantity, valor_total: p.total })))}

    RESUMO:
    Folha Total: R$ ${summary.totalProductionCost}
    Peças Produzidas: ${summary.totalPieces}
    Número de Costureiros: ${summary.seamstressCount}

    POR FAVOR FORNEÇA:
    1. Quem é o colaborador mais produtivo e por quê.
    2. Análise de custo médio por peça.
    3. Sugestão para melhorar o fluxo de trabalho ou controle de custos.
    Use Markdown curto e direto ao ponto.
  `;

  try {
    const response = await ai.models.generateContent({
      // Use gemini-3-pro-preview for complex reasoning and data analysis tasks
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // The text property is a getter, not a method; do not use response.text()
    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao conectar com a IA.";
  }
};
