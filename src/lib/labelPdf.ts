import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { BoxGroup, ShippingLabelForm } from "@/types/shipping-label";

function getBarcodeDataUrl(value: string) {
  if (!value.trim()) return "";

  const canvas = document.createElement("canvas");

  JsBarcode(canvas, value, {
    format: "CODE128",
    displayValue: true,
    fontSize: 12,
    height: 45,
    margin: 4,
  });

  return canvas.toDataURL("image/png");
}

export function downloadShippingLabelsPdf(form: ShippingLabelForm) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [4, 6],
  });

  const totalBoxes = Math.max(
    1,
    form.boxGroups.reduce((sum, group) => sum + Number(group.boxCount || 0), 0)
  );

  const totalWeight = form.boxGroups.reduce((sum, group) => {
    return sum + Number(group.boxCount || 0) * Number(group.weightPerBox || 0);
  }, 0);

  const barcodeUrl = getBarcodeDataUrl(form.courier.awb);

  let currentBoxNumber = 1;

  form.boxGroups.forEach((group) => {
    const groupBoxCount = Math.max(1, Number(group.boxCount || 1));

    for (let i = 1; i <= groupBoxCount; i++) {
      if (currentBoxNumber > 1) pdf.addPage([4, 6], "portrait");

      drawLabel({
        pdf,
        form,
        boxGroup: group,
        boxNumber: currentBoxNumber,
        totalBoxes,
        totalWeight,
        barcodeUrl,
      });

      currentBoxNumber++;
    }
  });

  const filename = form.order.orderId
    ? `shipping-label-${form.order.orderId}.pdf`
    : "shipping-labels.pdf";

  pdf.save(filename);
}

function drawLabel({
  pdf,
  form,
  boxGroup,
  boxNumber,
  totalBoxes,
  totalWeight,
  barcodeUrl,
}: {
  pdf: jsPDF;
  form: ShippingLabelForm;
  boxGroup: BoxGroup;
  boxNumber: number;
  totalBoxes: number;
  totalWeight: number;
  barcodeUrl: string;
}) {
  pdf.setDrawColor(0);
  pdf.setTextColor(0);
  pdf.setLineWidth(0.012);

  pdf.rect(0.16, 0.16, 3.68, 5.68);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("SHIPPING LABEL", 0.28, 0.32);

  pdf.setFontSize(16);
  pdf.text(form.courier.courierName || "SELF DELIVERY", 0.28, 0.58);

  pdf.setFontSize(8);
  pdf.text("BOX", 3.42, 0.32, { align: "center" });

  pdf.setFontSize(16);
  pdf.text(`${boxNumber}/${totalBoxes}`, 3.42, 0.58, {
    align: "center",
  });

  line(pdf, 0.82);

  let y = 0.82;

  if (barcodeUrl) {
    pdf.addImage(barcodeUrl, "PNG", 0.58, 0.93, 2.85, 0.45);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text(`AWB: ${form.courier.awb}`, 2, 1.53, {
      align: "center",
    });

    y = 1.66;
    line(pdf, y);
  }

  const addressTop = y;
  const addressBottom = 3.12;
  const addressContentY = addressTop + 0.34;
  const availableAddressHeight = addressBottom - addressContentY - 0.12;

  pdf.line(2, addressTop, 2, addressBottom);

  sectionTitle(pdf, "FROM", 0.28, addressTop + 0.16);
  addressBlock(
    pdf,
    form.sender,
    0.28,
    addressContentY,
    1.55,
    availableAddressHeight
  );

  sectionTitle(pdf, "TO", 2.14, addressTop + 0.16);
  addressBlock(
    pdf,
    form.receiver,
    2.14,
    addressContentY,
    1.55,
    availableAddressHeight
  );

  line(pdf, addressBottom);

  info(pdf, "ORDER/INVOICE", form.order.orderId, 0.28, 3.34);
  info(pdf, "DATE", form.order.date, 2.08, 3.34);

  info(pdf, "PAYMENT", form.order.paymentMode, 0.28, 3.78);
  info(pdf, "TOTAL WEIGHT", `${totalWeight.toFixed(2)} kg`, 2.08, 3.78);

  line(pdf, 4.08);

  sectionTitle(pdf, "PRODUCT", 0.28, 4.25);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);

  const productLines = pdf
    .splitTextToSize(form.order.productName || "-", 3.35)
    .slice(0, 2);

  pdf.text(productLines, 0.28, 4.45);

  line(pdf, 4.82);

  pdf.line(1.38, 4.82, 1.38, 5.28);
  pdf.line(2.62, 4.82, 2.62, 5.28);

  stat(pdf, "QTY/BOX", String(boxGroup.qtyPerBox || 0), 0.78, 4.98);
  stat(pdf, "WT/BOX", `${boxGroup.weightPerBox || 0} kg`, 2, 4.98);
  stat(pdf, "BOXES", String(totalBoxes), 3.25, 4.98);

  line(pdf, 5.28);

  sectionTitle(pdf, "DIMENSIONS", 2, 5.44, "center");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text(
    `${boxGroup.length || 0} × ${boxGroup.width || 0} × ${
      boxGroup.height || 0
    }`,
    2,
    5.68,
    { align: "center" }
  );
}

function line(pdf: jsPDF, y: number) {
  pdf.line(0.16, y, 3.84, y);
}

function sectionTitle(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  align: "left" | "center" = "left"
) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text(text, x, y, { align });
}

function addressBlock(
  pdf: jsPDF,
  data: ShippingLabelForm["sender"],
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number
) {
  const parts = {
    name: data.name || "-",
    phone: data.phone || "-",
    address: data.address || "-",
    cityStatePin: `${data.city || "-"}, ${data.state || "-"} - ${
      data.pincode || "-"
    }`,
  };

  let finalFontSize = 5;
  let finalLines: { text: string; bold: boolean }[] = [];

  for (let fontSize = 9; fontSize >= 5; fontSize -= 0.2) {
    pdf.setFontSize(fontSize);

    const nameLines = pdf
      .splitTextToSize(parts.name, maxWidth)
      .slice(0, 1)
      .map((text: string) => ({ text, bold: true }));

    const phoneLines = pdf
      .splitTextToSize(parts.phone, maxWidth)
      .slice(0, 1)
      .map((text: string) => ({ text, bold: false }));

    const addressLines = pdf
      .splitTextToSize(parts.address, maxWidth)
      .slice(0, 5)
      .map((text: string) => ({ text, bold: false }));

    const cityLines = pdf
      .splitTextToSize(parts.cityStatePin, maxWidth)
      .slice(0, 3)
      .map((text: string) => ({ text, bold: false }));

    const lines = [...nameLines, ...phoneLines, ...addressLines, ...cityLines];

    const lineHeight = (fontSize / 72) * 1.15;
    const neededHeight = lines.length * lineHeight;

    if (neededHeight <= maxHeight) {
      finalFontSize = fontSize;
      finalLines = lines;
      break;
    }
  }

  if (!finalLines.length) {
    pdf.setFontSize(5);

    finalLines = [
      ...pdf
        .splitTextToSize(parts.name, maxWidth)
        .slice(0, 1)
        .map((text: string) => ({ text, bold: true })),
      ...pdf
        .splitTextToSize(parts.phone, maxWidth)
        .slice(0, 1)
        .map((text: string) => ({ text, bold: false })),
      ...pdf
        .splitTextToSize(parts.address, maxWidth)
        .slice(0, 4)
        .map((text: string) => ({ text, bold: false })),
      ...pdf
        .splitTextToSize(parts.cityStatePin, maxWidth)
        .slice(0, 2)
        .map((text: string) => ({ text, bold: false })),
    ];

    finalFontSize = 5;
  }

  const lineHeight = (finalFontSize / 72) * 1.15;

  finalLines.forEach((line, index) => {
    pdf.setFont("helvetica", line.bold || index === 0 ? "bold" : "normal");
    pdf.setFontSize(finalFontSize);
    pdf.text(line.text, x, y + index * lineHeight);
  });
}

function info(pdf: jsPDF, label: string, value: string, x: number, y: number) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text(label, x, y);

  pdf.setFontSize(9);
  pdf.text(value || "-", x, y + 0.17);
}

function stat(pdf: jsPDF, label: string, value: string, x: number, y: number) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text(label, x, y, { align: "center" });

  pdf.setFontSize(13);
  pdf.text(value, x, y + 0.25, { align: "center" });
}