import productBase from "@/assets/product-base-image.png";
export type LeadLike = {
  name: string;
  address?: string;
};

interface ImageGenerationOptions {
  width?: number;
  height?: number;
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '900' | string;
  labelText?: string;
  textX?: number; // %
  textY?: number; // %
  addressX?: number; // %
  addressY?: number; // %
  showAddress?: boolean;
}

class LocalImageGenerator {
  private defaultOptions: Required<ImageGenerationOptions> = {
    width: 800,
    height: 600,
    textColor: '#000000',
    fontSize: 22,
    fontWeight: '900',
    labelText: 'Destinatário:',
    showAddress: true,
    addressX: 7,
    addressY: 43,
    textX: 19,
    textY: 41.5,
  };

  async generateProductImage(lead: LeadLike, options: Partial<ImageGenerationOptions> = {}): Promise<string> {
    const opts = { ...this.defaultOptions, ...options };
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto do canvas'));
          return;
        }
        const baseImage = new Image();
        baseImage.onload = () => {
          try {
            canvas.width = baseImage.width || opts.width;
            canvas.height = baseImage.height || opts.height;
            ctx.drawImage(baseImage, 0, 0);
            this.drawLeadNameWithLabel(ctx, canvas, lead, opts);
            const imageDataUrl = canvas.toDataURL('image/png', 0.9);
            resolve(imageDataUrl);
          } catch (error) {
            reject(error);
          }
        };
        baseImage.onerror = () => {
          // fallback gerando sem base
          canvas.width = opts.width;
          canvas.height = opts.height;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          this.drawLeadNameWithLabel(ctx, canvas, lead, opts);
          resolve(canvas.toDataURL('image/png', 0.9));
        };
        baseImage.src = productBase;
      } catch (error) {
        reject(error);
      }
    });
  }

  private drawLeadNameWithLabel(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    lead: LeadLike,
    options: Required<ImageGenerationOptions>
  ) {
    ctx.font = `${options.fontWeight} ${options.fontSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = options.textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const labelX = canvas.width * (options.textX / 100);
    const labelY = canvas.height * (options.textY / 100);
    const maxTextWidth = canvas.width * 0.8;

    const displayText = this.getFittingText(ctx, lead.name, maxTextWidth);
    ctx.filter = 'blur(0.8px)';
    const finalText = lead.name.length >= 32 ? this.abbreviateLongName(lead.name) : displayText;
    ctx.fillText(finalText, labelX, labelY);
    ctx.filter = 'none';

    if (options.showAddress && lead.address) {
      const addressPixelX = canvas.width * (options.addressX / 100);
      const addressPixelY = canvas.height * (options.addressY / 100);
      ctx.font = `700 ${Math.max(12, options.fontSize - 2)}px 'Segoe UI', system-ui, sans-serif`;
      const maxWidth = canvas.width * 0.86;
      const cleanAddress = this.cleanAddress(lead.address);
      const lines = this.wrapText(ctx, cleanAddress, maxWidth);
      ctx.filter = 'blur(0.8px)';
      let y = addressPixelY;
      for (const line of lines) {
        ctx.fillText(line, addressPixelX, y);
        y += (options.fontSize - 2) + 4; // line height
      }
      ctx.filter = 'none';
    }

    ctx.globalAlpha = 1.0;
  }

  private abbreviateLongName(fullName: string): string {
    if (!fullName) return '';
    const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length <= 2) return fullName;
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const middleNames = nameParts.slice(1, nameParts.length - 1);
    const initials = middleNames.map(name => name.charAt(0).toUpperCase() + '.');
    return [firstName, ...initials, lastName].join(' ');
  }

  private getFittingText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    if (!text) return '';
    if (text.length <= 31) return text;
    return this.abbreviateLongName(text);
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = String(text).split(/\s+/);
    const lines: string[] = [];
    let current = '';
    for (const w of words) {
      const test = current ? current + ' ' + w : w;
      const width = ctx.measureText(test).width;
      if (width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  // Remove vírgulas e espaços redundantes e vírgulas finais
  private cleanAddress(address?: string): string {
    let s = String(address || '').trim();
    if (!s) return '';
    // Normaliza espaços ao redor das vírgulas
    s = s.replace(/\s*,\s*/g, ', ');
    // Colapsa vírgulas repetidas (", ," -> ", ")
    s = s.replace(/(,\s*)+/g, ', ');
    // Remove vírgulas e espaços no final
    s = s.replace(/(?:,|\s)+$/g, '');
    // Colapsa múltiplos espaços
    s = s.replace(/\s{2,}/g, ' ');
    return s.trim();
  }
}

export const localImageGenerator = new LocalImageGenerator();



