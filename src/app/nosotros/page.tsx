import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nosotros — KROMA',
  description: 'Conoce la historia detrás de KROMA, tu marca de estampados y sublimación.',
};

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8" id="nosotros-page">
      {/* Header */}
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-md bg-surface px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Nuestra Historia
        </span>
        <h1 className="text-4xl font-black italic leading-tight sm:text-5xl">
          Hecho con pasión,<br />diseñado para ti.
        </h1>
      </div>

      {/* Content */}
      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <p className="text-base text-foreground">
          KROMA nació de la idea de que la ropa es más que tela — es una forma de expresión. Somos una marca venezolana dedicada a crear prendas únicas a través del estampado, la sublimación y el diseño personalizado.
        </p>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-accent-light">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-semibold text-foreground">Diseño Original</h3>
            <p>Cada diseño es creado por nuestro equipo creativo, inspirado en la cultura urbana y las tendencias globales de streetwear.</p>
          </div>

          <div className="rounded-xl border border-border p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-accent-light">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-semibold text-foreground">Calidad Premium</h3>
            <p>Usamos solo algodón de alta densidad y técnicas de estampado que garantizan durabilidad y colores vibrantes.</p>
          </div>

          <div className="rounded-xl border border-border p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-accent-light">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-semibold text-foreground">100% Personalizable</h3>
            <p>Tu idea, tu diseño. Creamos piezas únicas para marcas, eventos, equipos y para quienes quieren algo diferente.</p>
          </div>

          <div className="rounded-xl border border-border p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-accent-light">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-semibold text-foreground">Hecho en Venezuela</h3>
            <p>Con orgullo local, producimos cada prenda con dedicación artesanal y atención al detalle.</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">¿Listo para crear algo único?</h2>
          <p className="mb-4">Contáctanos por WhatsApp y hagamos realidad tu diseño.</p>
          <a
            href="https://wa.me/584148589600?text=¡Hola!%20Me%20interesa%20saber%20más%20sobre%20KROMA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-whatsapp-hover"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Escribirnos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
