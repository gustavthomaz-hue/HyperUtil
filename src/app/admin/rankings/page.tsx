'use client';

import { useState } from 'react';

export default function RankingsAdminPage() {
  const [subcategoria, setSubcategoria] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const handleGerarRanking = async () => {
    if (!subcategoria) return;
    setLoading(true);
    setResultado(null);

    try {
      const res = await fetch('/api/rankings/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subcategoria }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      setResultado(data);
      alert('Ranking gerado e salvo no Supabase com sucesso!');
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto font-sans">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          🏆 Gerador de Rankings Interno (IA)
        </h1>
        <p className="text-[11px] text-slate-400 mt-1">
          A IA vai analisar os produtos cadastrados no seu banco para esta subcategoria e montar o ranking com notas automaticamente.
        </p>
      </div>

      <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 shadow-sm mb-4 space-y-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            NOME EXATO DA SUBCATEGORIA (Como está no banco)
          </label>
          <input
            type="text"
            value={subcategoria}
            onChange={(e) => setSubcategoria(e.target.value)}
            placeholder="Ex: FDM"
            className="w-full p-2 rounded-lg border border-slate-700 bg-slate-950 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <button
          onClick={handleGerarRanking}
          disabled={loading || !subcategoria}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-[11px] p-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? '🤖 Avaliando produtos no banco e gerando ranking...' : '⚡ Processar Embate e Salvar Ranking'}
        </button>
      </div>

      {resultado && resultado.ranking && (
        <div className="bg-slate-800 p-3.5 rounded-xl border border-emerald-500/30 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-white">
            ✅ Ranking Atualizado!
          </h2>
          <p className="text-[11px] text-slate-300">
            <strong>Resumo da IA:</strong> {resultado.ranking.introducao_embate}
          </p>
          <p className="text-[10px] text-emerald-400 font-medium">
            Foram avaliados {resultado.total_produtos_avaliados} produtos cadastrados. Tudo já está salvo no banco!
          </p>
        </div>
      )}
    </div>
  );
}