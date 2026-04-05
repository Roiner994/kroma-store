'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { buildWhatsAppCustomUrl } from '@/lib/whatsapp';
import { createClient } from '@/lib/supabase/client';


const CAROUSEL_IMAGES = [
  { src: '/images/products/essential-oversize-black.png', alt: 'Diseño personalizado KROMA 1' },
  { src: '/images/products/grafica-signature-white.png', alt: 'Diseño personalizado KROMA 2' },
  { src: '/images/products/vintage-heavyweight-gray.png', alt: 'Diseño personalizado KROMA 3' },
];

export default function PersonalizadosPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [details, setDetails] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();


  const handleNextImage = () => {
    setCurrentImage((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  };

  const handlePrevImage = () => {
    setCurrentImage((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendWhatsApp = async () => {
    if (files.length === 0 || !details.trim()) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
          .from('custom-designs')
          .upload(filePath, file);


        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('custom-designs')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const publicUrls = await Promise.all(uploadPromises);

      let message = '';
      if (publicUrls.length > 0) {
        message += `🖼️ *Archivos de referencia:*\n`;
        publicUrls.forEach((url, i) => {
          message += `• [Archivo ${i + 1}](${url})\n`;
        });
        message += `\n`;
      }
      
      if (details) {
        message += `📋 *Detalles del pedido:*\n${details}`;
      }

      const url = buildWhatsAppCustomUrl(message || 'Me gustaría hacer un pedido personalizado.');
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error uploading designs:', error);
      alert('Hubo un error al subir tus diseños. Por favor intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8" id="personalizados-hero">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <span className="mb-4 inline-block w-fit rounded-md bg-surface px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Servicio Premium
            </span>
            <h1 className="text-4xl font-black italic leading-tight sm:text-5xl lg:text-6xl">
              Inspiración<br />sin límites.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Explora algunos de nuestros proyectos personalizados más icónicos. Desde marcas emergentes hasta colecciones exclusivas, convertimos tu visión en prendas de alta gama.
            </p>
          </motion.div>

          {/* Right - Image carousel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface lg:aspect-auto lg:min-h-[500px]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <Image
                  src={CAROUSEL_IMAGES[currentImage].src}
                  alt={CAROUSEL_IMAGES[currentImage].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Carousel dots */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {CAROUSEL_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === currentImage ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                  aria-label={`Ir a imagen ${i + 1}`}
                />
              ))}
            </div>

            {/* Nav arrows */}
            <button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 cursor-pointer"
              aria-label="Anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 cursor-pointer"
              aria-label="Siguiente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* WhatsApp Order Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8" id="whatsapp-order-section">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Text */}
          <div>
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">
              Cotiza rápido por WhatsApp
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Olvídate de largos formularios. La forma más rápida de empezar es enviarnos tus archivos directamente por WhatsApp. Sube todas las fotos, referencias o diseños que tengas en mente, agrega una breve descripción de tu idea (cantidades, colores, tallas) y presiona enviar.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Nuestro equipo revisará tu material al instante y te dará una propuesta a medida.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-muted">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                +58 414 858 9600
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-muted">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                hola@kroma.com
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="space-y-6">
            {/* Upload Zone */}
            <div>
              <h3 className="mb-3 text-sm font-medium">1. Sube tus diseños o ideas</h3>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-border-hover'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mb-3 h-10 w-10 text-muted">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>
                <p className="text-sm text-muted-foreground">
                  Arrastra una o varias fotos aquí o{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-accent-light underline cursor-pointer"
                  >
                    explora
                  </button>
                </p>
                <p className="mt-1 text-xs text-muted">PNG, JPG o PDF hasta 20MB</p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-accent-light">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`} • Listo para enviar
                          </p>
                        </div>

                      </div>
                      <button onClick={() => removeFile(i)} className="text-red-400 transition-colors hover:text-red-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h3 className="mb-3 text-sm font-medium">2. Detalles del pedido</h3>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="¿Cuántas piezas necesitas? ¿En qué tallas y colores? Cuéntanos un poco más sobre tu proyecto..."
                className="w-full rounded-xl bg-surface px-4 py-3 text-sm text-foreground placeholder-muted outline-none ring-1 ring-border focus:ring-accent min-h-[100px] resize-y"
                id="custom-order-details"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSendWhatsApp}
              disabled={files.length === 0 || !details.trim() || isUploading}

              className="flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp py-4 text-sm font-semibold text-white transition-all hover:bg-whatsapp-hover disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed cursor-pointer"
              id="send-designs-whatsapp"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Subiendo diseños...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Enviar Diseños por WhatsApp</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Se abrirá WhatsApp con tus imágenes adjuntas y tu mensaje preparado.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
