'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AnalyticsTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    async function registrarVisita() {
      try {
        // 1. Identifica a origem do tráfego (UTM, Referrer ou Direto)
        const utmSource = searchParams.get('utm_source');
        const referrer = document.referrer;
        
        let origem = 'direto';

        if (utmSource) {
          origem = utmSource.toLowerCase();
        } else if (referrer) {
          if (referrer.includes('google.')) origem = 'google';
          else if (referrer.includes('whatsapp.com') || referrer.includes('wa.me')) origem = 'whatsapp';
          else if (referrer.includes('instagram.com')) origem = 'instagram';
          else if (referrer.includes('facebook.com')) origem = 'facebook';
          else {
            // Extrai o domínio principal de outras origens
            try {
              const urlObj = new URL(referrer);
              origem = urlObj.hostname.replace('www.', '');
            } catch {
              origem = 'outro';
            }
          }
        }

        // 2. Insere a visita na tabela analytics_visitas do Supabase
        await supabase.from('analytics_visitas').insert([
          {
            origem: origem,
            caminho: window.location.pathname,
            data_acesso: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        // Silencia erros de analytics para não atrapalhar a experiência do usuário
        console.error('Erro ao registrar analytics:', err);
      }
    }

    registrarVisita();
  }, [searchParams]);

  return null;
}