'use client';

import { Shield } from 'lucide-react';
import { useWhatsappLink } from '@/hooks/useWhatsappLink';
import { registrarClique } from '@/lib/analytics';

export default function WhatsappBanner() {
  const whatsappLink = useWhatsappLink();

  return (
    <section className="bg-blue-600 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4">
      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto">
        <Shield className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold">
        As melhores ofertas de tecnologia, direto no seu WhatsApp
      </h2>
      <p className="text-blue-100 text-sm max-w-lg mx-auto">
        Entre no nosso canal gratuito e receba promoções selecionadas de tecnologia e insumos.
      </p>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => registrarClique('whatsapp', 'Banner Principal')}
        className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-colors shadow-md"
      >
        Entrar no canal de ofertas
      </a>
    </section>
  );
}