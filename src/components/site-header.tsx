import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm flex justify-center">
      <div className="w-full max-w-3xl px-6 h-16 flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="bg-blue-600 text-white font-black text-base px-2 py-0.5 rounded-lg shadow-sm">
            H
          </span>
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">
            Hyper<span className="text-blue-600">Util</span>
          </span>
        </Link>

        {/* BOTOES DE NAVEGAÇÃO VISÍVEIS */}
        <nav className="flex items-center gap-3 sm:gap-5 text-xs font-semibold text-slate-700">
          <Link href="/duelos" className="hover:text-blue-600 transition whitespace-nowrap">
            Duelos
          </Link>
          <Link href="/rankings" className="hover:text-blue-600 transition whitespace-nowrap">
            Rankings
          </Link>
          <Link href="/recomendador" className="hover:text-blue-600 transition whitespace-nowrap">
            Recomendador
          </Link>
          <Link href="/noticias" className="hover:text-blue-600 transition whitespace-nowrap">
            Notícias
          </Link>
        </nav>

        {/* BOTÃO DE DESTAQUE */}
        <Link
          href="/recomendador"
          className="hidden sm:inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm whitespace-nowrap"
        >
          Quiz
        </Link>
      </div>
    </header>
  );
}