import { supabase } from '@/lib/supabase';

/**
 * Registra um clique de conversão ou saída (WhatsApp, Afiliado, etc.) no Supabase
 */
export async function registrarClique(tipo: 'whatsapp' | 'afiliado', identificador: string) {
  try {
    await supabase.from('analytics_cliques').insert([
      {
        tipo: tipo,
        identificador: identificador, // Ex: nome do produto ou link do grupo
        data_clique: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    // Silencia o erro para não travar a navegação do usuário caso ocorra falha de rede
    console.error('Erro ao registrar clique:', err);
  }
}