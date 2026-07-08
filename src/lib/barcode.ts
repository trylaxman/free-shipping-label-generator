// src/lib/barcode.ts

import JsBarcode from "jsbarcode";

export function generateBarcodeDataUrl(value: string) {
  if (!value.trim()) return "";

  const canvas = document.createElement("canvas");

  JsBarcode(canvas, value, {
    format: "CODE128",
    displayValue: true,
    fontSize: 14,
    height: 50,
    margin: 4,
  });

  return canvas.toDataURL("image/png");
}