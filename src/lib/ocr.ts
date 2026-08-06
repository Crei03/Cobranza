import Tesseract from "tesseract.js";

interface ReceiptData {
  amount: number | null;
  date: string | null;
  confirmationCode: string | null;
  rawText: string;
}

const SPANISH_MONTHS: Record<string, string> = {
  ene: "01", feb: "02", mar: "03", abr: "04", may: "05", jun: "06",
  jul: "07", ago: "08", sep: "09", oct: "10", nov: "11", dic: "12",
};

function parsePanamanianNumber(str: string): number {
  // Panama: 1,000.50 (comma=thousands, period=decimal)
  // Also handles: 1.000,50 (European) and plain 25.50
  const lastComma = str.lastIndexOf(",");
  const lastPeriod = str.lastIndexOf(".");

  let cleaned: string;

  if (lastComma > lastPeriod) {
    // Comma is decimal: 1.000,50 or 25,50
    cleaned = str.replace(/\./g, "").replace(",", ".");
  } else {
    // Period is decimal: 1,000.50 or 25.50
    cleaned = str.replace(/,/g, "");
  }

  return parseFloat(cleaned);
}

function parseAmount(text: string): number | null {
  let match = text.match(/\$\s*([\d.,]+)/);
  if (match) {
    const num = parsePanamanianNumber(match[1]);
    if (!isNaN(num) && num > 0) return num;
  }

  match = text.match(/(?:^|\n)\s*(\d{1,3}(?:[.,]\d{2}))\s*(?:\n|$)/m);
  if (match) {
    const num = parsePanamanianNumber(match[1]);
    if (!isNaN(num) && num > 0 && num < 100000) return num;
  }

  return null;
}

function parseDate(text: string): string | null {
  const match = text.match(
    /(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\s+(\d{4})\s*[-–]\s*(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)/i
  );
  if (!match) return null;

  const [, day, monthStr, year, hour, minute, period] = match;
  const month = SPANISH_MONTHS[monthStr.toLowerCase()];
  if (!month) return null;

  let hour24 = parseInt(hour, 10);
  const isPM = period.toLowerCase().includes("p");
  if (isPM && hour24 !== 12) hour24 += 12;
  if (!isPM && hour24 === 12) hour24 = 0;

  return `${year}-${month}-${day.padStart(2, "0")} ${String(hour24).padStart(2, "0")}:${minute}`;
}

function parseConfirmationCode(text: string): string | null {
  let match = text.match(/#([A-Z]+-\d+)/i);
  if (match) return `#${match[1]}`;

  match = text.match(/[H#]([A-Z]+-\d+)/i);
  if (match) return `#${match[1]}`;

  const confirmIdx = text.toLowerCase().indexOf("confirmaci");
  if (confirmIdx !== -1) {
    const afterConfirm = text.slice(confirmIdx);
    match = afterConfirm.match(/([A-Z]{3,}-\d{5,})/i);
    if (match) return `#${match[1]}`;
  }

  return null;
}

function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx!.drawImage(img, 0, 0);

      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        const normalized = Math.min(255, Math.max(0, (gray - 128) * 1.5 + 128));
        data[i] = normalized;
        data[i + 1] = normalized;
        data[i + 2] = normalized;
      }

      ctx!.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function extractReceiptData(
  imageFile: File
): Promise<ReceiptData> {
  const imageData = await preprocessImage(imageFile);

  const result = await Tesseract.recognize(imageData, "spa+eng", {
    logger: () => {},
  });

  const text = result.data.text;

  return {
    amount: parseAmount(text),
    date: parseDate(text),
    confirmationCode: parseConfirmationCode(text),
    rawText: text,
  };
}
