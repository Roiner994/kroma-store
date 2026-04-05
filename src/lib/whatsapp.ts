import { CartItem } from '@/types';
import { formatPrice } from './utils';

const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '521234567890';

/**
 * Build a pre-filled WhatsApp message URL from cart items
 */
export function buildWhatsAppCartUrl(items: CartItem[]): string {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let message = `🛒 *Pedido KROMA*\n\n`;

  items.forEach((item, i) => {
    message += `${i + 1}. ${item.quantity}x *${item.name}*\n`;
    message += `   Color: ${item.color} | Talla: ${item.size}\n`;
    message += `   Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`;
  });

  message += `───────────\n`;
  message += `💰 *Total: ${formatPrice(total)}*\n\n`;
  message += `📍 Por favor, envíame los detalles de envío.`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Build a pre-filled WhatsApp message for a single product (buy now)
 */
export function buildWhatsAppProductUrl(
  productName: string,
  color: string,
  size: string,
  quantity: number,
  price: number,
  productUrl?: string
): string {
  let message = `¡Hola! 👋 Me interesa comprar:\n\n`;
  message += `🛍️ *${productName}*\n`;
  message += `   Color: ${color}\n`;
  message += `   Talla: ${size}\n`;
  message += `   Cantidad: ${quantity}\n`;
  message += `   Precio: ${formatPrice(price * quantity)}\n`;

  if (productUrl) {
    message += `\n🔗 ${productUrl}\n`;
  }

  message += `\n¿Está disponible?`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Build a pre-filled WhatsApp message for custom design orders
 */
export function buildWhatsAppCustomUrl(details: string): string {
  let message = `🎨 *Pedido Personalizado KROMA*\n\n`;
  message += `${details}\n\n`;
  message += `Me gustaría recibir una cotización. ¡Gracias!`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
