'use client';

import { useState, useEffect } from 'react';

export function useWhatsappLink() {
  // Link oficial direto e definitivo do seu canal do WhatsApp
  const linkOficial = 'https://whatsapp.com/channel/0029VbDrSu40bIdmU5sqjH2J';
  const [whatsappLink, setWhatsappLink] = useState(linkOficial);

  useEffect(() => {
    // Tenta buscar do localStorage, mas se não houver ou se for o link antigo de exemplo, usa o oficial
    const waSalvo = localStorage.getItem('hyperutil_link_whatsapp');
    if (waSalvo && waSalvo.includes('whatsapp.com')) {
      setWhatsappLink(waSalvo);
    } else {
      setWhatsappLink(linkOficial);
    }
  }, []);

  return whatsappLink;
}