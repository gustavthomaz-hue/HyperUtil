interface Options {
  googleSearch?: boolean;
}

export async function gerarConteudoComGemini(prompt: string, options?: Options) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      prompt,
      googleSearch: options?.googleSearch ?? false,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição da API');
  }

  return data.resultado;
}