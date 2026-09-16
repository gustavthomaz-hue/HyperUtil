export async function buscarImagemNoticia(termo: string): Promise<string> {
    const imagemPadrao = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';
  
    try {
      const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
      if (!accessKey) {
        console.warn('UNSPLASH_ACCESS_KEY não encontrada no .env.local');
        return imagemPadrao;
      }
  
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(termo)}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Erro na API do Unsplash: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data.results[0]?.urls?.regular || imagemPadrao;
    } catch (error) {
      console.error('Erro ao buscar imagem no Unsplash:', error);
      return imagemPadrao;
    }
  }