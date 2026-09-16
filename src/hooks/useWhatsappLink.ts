'use client';

import { useState, useEffect } from 'react';

export function useWhatsappLink(linkPadrao = 'https://chat.whatsapp.com/ExemploGrupoHyperUtil') {
  const [whatsappLink, setWhatsappLink] = useState(linkPadrao);

  useEffect(() => {
    // Busca o link atualizado salvo pelo Admin
    const waSalvo = localStorage.getItem('hyperutil_link_whatsapp');
    if (waSalvo) {
      setWhatsappLink(waSalvo);
    }
  }, []);

  return whatsappLink;
}