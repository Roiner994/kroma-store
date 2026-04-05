import { ProductWithVariations } from '@/types';

// Fit type labels for display
export const FIT_TYPE_LABELS: Record<string, string> = {
  normal: 'Corte Normal',
  oversize: 'Corte Oversize',
  manga_larga: 'Manga Larga',
  sudadera: 'Sudadera',
};

export const MOCK_PRODUCTS: ProductWithVariations[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'KROMA Essential Oversize',
    slug: 'kroma-essential-oversize',
    base_price: 25.0,
    description: 'Nuestra camiseta oversize esencial. Diseñada para ofrecer la máxima comodidad con un corte relajado y tejido de algodón 100% premium. Ideal para cualquier outfit urbano o para un estilo diario sin esfuerzo. El teñido en prenda asegura un color profundo y duradero.',
    features: ['Corte oversize para un ajuste relajado', '100% Algodón peinado de alta densidad', 'Costuras reforzadas en cuello y hombros', 'Cuello acanalado grueso', 'Teñido en prenda para un color duradero'],
    fit_type: 'oversize',
    sizing_chart_url: null,
    image_urls: [],
    main_image_url: '/images/products/essential-oversize-black.png',
    badge: 'NUEVO',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variations: [
      {
        id: 'v1a', product_id: '00000000-0000-0000-0000-000000000001', color_name: 'Negro', color_hex: '#000000',
        variation_image_url: '/images/products/essential-oversize-black.png', display_order: 0, created_at: new Date().toISOString(),
        skus: [
          { id: 's1', variation_id: 'v1a', size_name: 'S', stock_count: 30, sku_code: 'KRM-ESS-BLK-S', created_at: new Date().toISOString() },
          { id: 's2', variation_id: 'v1a', size_name: 'M', stock_count: 120, sku_code: 'KRM-ESS-BLK-M', created_at: new Date().toISOString() },
          { id: 's3', variation_id: 'v1a', size_name: 'L', stock_count: 85, sku_code: 'KRM-ESS-BLK-L', created_at: new Date().toISOString() },
          { id: 's4', variation_id: 'v1a', size_name: 'XL', stock_count: 45, sku_code: 'KRM-ESS-BLK-XL', created_at: new Date().toISOString() },
          { id: 's5', variation_id: 'v1a', size_name: 'XXL', stock_count: 20, sku_code: 'KRM-ESS-BLK-XXL', created_at: new Date().toISOString() },
        ],
      },
      {
        id: 'v1b', product_id: '00000000-0000-0000-0000-000000000001', color_name: 'Gris Carbón', color_hex: '#4a4a4a',
        variation_image_url: '/images/products/vintage-heavyweight-gray.png', display_order: 1, created_at: new Date().toISOString(),
        skus: [
          { id: 's6', variation_id: 'v1b', size_name: 'S', stock_count: 25, sku_code: 'KRM-ESS-GRC-S', created_at: new Date().toISOString() },
          { id: 's7', variation_id: 'v1b', size_name: 'M', stock_count: 85, sku_code: 'KRM-ESS-GRC-M', created_at: new Date().toISOString() },
          { id: 's8', variation_id: 'v1b', size_name: 'L', stock_count: 60, sku_code: 'KRM-ESS-GRC-L', created_at: new Date().toISOString() },
          { id: 's9', variation_id: 'v1b', size_name: 'XL', stock_count: 30, sku_code: 'KRM-ESS-GRC-XL', created_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Camiseta Gráfica Signature',
    slug: 'camiseta-grafica-signature',
    base_price: 30.0,
    description: 'Camiseta con estampado premium de montaña. Corte normal con tejido de algodón premium.',
    features: ['Estampado premium de alta definición', 'Algodón 100% premium', 'Corte normal clásico', 'Costuras reforzadas dobles', 'Etiqueta tejida en cuello'],
    fit_type: 'normal',
    sizing_chart_url: null,
    image_urls: [],
    main_image_url: '/images/products/grafica-signature-white.png',
    badge: 'MÁS VENDIDO',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variations: [
      {
        id: 'v2a', product_id: '00000000-0000-0000-0000-000000000002', color_name: 'Blanco', color_hex: '#ffffff',
        variation_image_url: '/images/products/grafica-signature-white.png', display_order: 0, created_at: new Date().toISOString(),
        skus: [
          { id: 's10', variation_id: 'v2a', size_name: 'S', stock_count: 40, sku_code: 'KRM-GRA-WHT-S', created_at: new Date().toISOString() },
          { id: 's11', variation_id: 'v2a', size_name: 'M', stock_count: 100, sku_code: 'KRM-GRA-WHT-M', created_at: new Date().toISOString() },
          { id: 's12', variation_id: 'v2a', size_name: 'L', stock_count: 75, sku_code: 'KRM-GRA-WHT-L', created_at: new Date().toISOString() },
          { id: 's13', variation_id: 'v2a', size_name: 'XL', stock_count: 35, sku_code: 'KRM-GRA-WHT-XL', created_at: new Date().toISOString() },
        ],
      },
      {
        id: 'v2b', product_id: '00000000-0000-0000-0000-000000000002', color_name: 'Negro', color_hex: '#000000',
        variation_image_url: '/images/products/essential-oversize-black.png', display_order: 1, created_at: new Date().toISOString(),
        skus: [
          { id: 's14', variation_id: 'v2b', size_name: 'M', stock_count: 60, sku_code: 'KRM-GRA-BLK-M', created_at: new Date().toISOString() },
          { id: 's15', variation_id: 'v2b', size_name: 'L', stock_count: 45, sku_code: 'KRM-GRA-BLK-L', created_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Camiseta Vintage Heavyweight',
    slug: 'camiseta-vintage-heavyweight',
    base_price: 35.0,
    description: 'Camiseta de peso pesado con lavado vintage. Un clásico reinventado con tejido de algodón pesado.',
    features: ['Lavado vintage para un look retro', 'Algodón pesado (280gsm)', 'Cuello reforzado doble aguja', 'Acabado lavado enzimático', 'Corte oversize relajado'],
    fit_type: 'oversize',
    sizing_chart_url: null,
    image_urls: [],
    main_image_url: '/images/products/vintage-heavyweight-gray.png',
    badge: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variations: [
      {
        id: 'v3a', product_id: '00000000-0000-0000-0000-000000000003', color_name: 'Gris', color_hex: '#808080',
        variation_image_url: '/images/products/vintage-heavyweight-gray.png', display_order: 0, created_at: new Date().toISOString(),
        skus: [
          { id: 's16', variation_id: 'v3a', size_name: 'M', stock_count: 50, sku_code: 'KRM-VIN-GRY-M', created_at: new Date().toISOString() },
          { id: 's17', variation_id: 'v3a', size_name: 'L', stock_count: 40, sku_code: 'KRM-VIN-GRY-L', created_at: new Date().toISOString() },
          { id: 's18', variation_id: 'v3a', size_name: 'XL', stock_count: 30, sku_code: 'KRM-VIN-GRY-XL', created_at: new Date().toISOString() },
        ],
      },
      {
        id: 'v3b', product_id: '00000000-0000-0000-0000-000000000003', color_name: 'Beige', color_hex: '#d4a574',
        variation_image_url: '/images/products/boxy-cropped-olive.png', display_order: 1, created_at: new Date().toISOString(),
        skus: [
          { id: 's19', variation_id: 'v3b', size_name: 'M', stock_count: 35, sku_code: 'KRM-VIN-BGE-M', created_at: new Date().toISOString() },
          { id: 's20', variation_id: 'v3b', size_name: 'L', stock_count: 25, sku_code: 'KRM-VIN-BGE-L', created_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Sudadera KROMA Clásica',
    slug: 'sudadera-kroma-clasica',
    base_price: 55.0,
    description: 'Sudadera con capucha doble de interior felpa. La sudadera definitiva para el día a día.',
    features: ['Interior de felpa cálido', 'Capucha doble con cordón', 'Bolsillo canguro frontal', 'Puños y borde acanalados', 'Algodón/Poliéster premium'],
    fit_type: 'sudadera',
    sizing_chart_url: null,
    image_urls: [],
    main_image_url: '/images/products/sudadera-clasica-black.png',
    badge: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variations: [
      {
        id: 'v4a', product_id: '00000000-0000-0000-0000-000000000004', color_name: 'Negro', color_hex: '#000000',
        variation_image_url: '/images/products/sudadera-clasica-black.png', display_order: 0, created_at: new Date().toISOString(),
        skus: [
          { id: 's21', variation_id: 'v4a', size_name: 'M', stock_count: 40, sku_code: 'KRM-SUD-BLK-M', created_at: new Date().toISOString() },
          { id: 's22', variation_id: 'v4a', size_name: 'L', stock_count: 55, sku_code: 'KRM-SUD-BLK-L', created_at: new Date().toISOString() },
          { id: 's23', variation_id: 'v4a', size_name: 'XL', stock_count: 25, sku_code: 'KRM-SUD-BLK-XL', created_at: new Date().toISOString() },
        ],
      },
      {
        id: 'v4b', product_id: '00000000-0000-0000-0000-000000000004', color_name: 'Azul Marino', color_hex: '#1a237e',
        variation_image_url: '/images/products/basica-diaria-teal.png', display_order: 1, created_at: new Date().toISOString(),
        skus: [
          { id: 's24', variation_id: 'v4b', size_name: 'M', stock_count: 30, sku_code: 'KRM-SUD-NVY-M', created_at: new Date().toISOString() },
          { id: 's25', variation_id: 'v4b', size_name: 'L', stock_count: 25, sku_code: 'KRM-SUD-NVY-L', created_at: new Date().toISOString() },
        ],
      },
      {
        id: 'v4c', product_id: '00000000-0000-0000-0000-000000000004', color_name: 'Rojo', color_hex: '#c62828',
        variation_image_url: '/images/products/essential-oversize-black.png', display_order: 2, created_at: new Date().toISOString(),
        skus: [
          { id: 's26', variation_id: 'v4c', size_name: 'L', stock_count: 20, sku_code: 'KRM-SUD-RED-L', created_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Camiseta Básica Diaria',
    slug: 'camiseta-basica-diaria',
    base_price: 20.0,
    description: 'Tu camiseta de todos los días. Ajuste perfecto con algodón 100% suave al tacto.',
    features: ['Ajuste perfecto y cómodo', '100% Algodón suave (180gsm)', 'Cuello redondo reforzado', 'Corte normal clásico', 'Disponible en colores esenciales'],
    fit_type: 'normal',
    sizing_chart_url: null,
    image_urls: [],
    main_image_url: '/images/products/basica-diaria-teal.png',
    badge: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variations: [
      {
        id: 'v5a', product_id: '00000000-0000-0000-0000-000000000005', color_name: 'Teal', color_hex: '#008080',
        variation_image_url: '/images/products/basica-diaria-teal.png', display_order: 0, created_at: new Date().toISOString(),
        skus: [
          { id: 's27', variation_id: 'v5a', size_name: 'S', stock_count: 60, sku_code: 'KRM-BAS-TEL-S', created_at: new Date().toISOString() },
          { id: 's28', variation_id: 'v5a', size_name: 'M', stock_count: 80, sku_code: 'KRM-BAS-TEL-M', created_at: new Date().toISOString() },
          { id: 's29', variation_id: 'v5a', size_name: 'L', stock_count: 70, sku_code: 'KRM-BAS-TEL-L', created_at: new Date().toISOString() },
        ],
      },
      {
        id: 'v5b', product_id: '00000000-0000-0000-0000-000000000005', color_name: 'Negro', color_hex: '#000000',
        variation_image_url: '/images/products/essential-oversize-black.png', display_order: 1, created_at: new Date().toISOString(),
        skus: [
          { id: 's30', variation_id: 'v5b', size_name: 'S', stock_count: 50, sku_code: 'KRM-BAS-BLK-S', created_at: new Date().toISOString() },
          { id: 's31', variation_id: 'v5b', size_name: 'M', stock_count: 90, sku_code: 'KRM-BAS-BLK-M', created_at: new Date().toISOString() },
          { id: 's32', variation_id: 'v5b', size_name: 'L', stock_count: 65, sku_code: 'KRM-BAS-BLK-L', created_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Camiseta Boxy Cropped',
    slug: 'camiseta-boxy-cropped',
    base_price: 28.0,
    description: 'Camiseta boxy con corte cropped. Estilo urbano moderno con un corte corto que marca tendencia.',
    features: ['Corte boxy cropped moderno', 'Estilo urbano contemporáneo', 'Algodón premium (220gsm)', 'Acabado suave al tacto', 'Diseño unisex'],
    fit_type: 'oversize',
    sizing_chart_url: null,
    image_urls: [],
    main_image_url: '/images/products/boxy-cropped-olive.png',
    badge: 'AGOTADO',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variations: [
      {
        id: 'v6a', product_id: '00000000-0000-0000-0000-000000000006', color_name: 'Oliva', color_hex: '#556b2f',
        variation_image_url: '/images/products/boxy-cropped-olive.png', display_order: 0, created_at: new Date().toISOString(),
        skus: [
          { id: 's33', variation_id: 'v6a', size_name: 'M', stock_count: 0, sku_code: 'KRM-BOX-OLV-M', created_at: new Date().toISOString() },
          { id: 's34', variation_id: 'v6a', size_name: 'L', stock_count: 0, sku_code: 'KRM-BOX-OLV-L', created_at: new Date().toISOString() },
        ],
      },
      {
        id: 'v6b', product_id: '00000000-0000-0000-0000-000000000006', color_name: 'Beige', color_hex: '#d2b48c',
        variation_image_url: '/images/products/vintage-heavyweight-gray.png', display_order: 1, created_at: new Date().toISOString(),
        skus: [
          { id: 's35', variation_id: 'v6b', size_name: 'M', stock_count: 0, sku_code: 'KRM-BOX-BGE-M', created_at: new Date().toISOString() },
          { id: 's36', variation_id: 'v6b', size_name: 'L', stock_count: 0, sku_code: 'KRM-BOX-BGE-L', created_at: new Date().toISOString() },
        ],
      },
    ],
  },
];
