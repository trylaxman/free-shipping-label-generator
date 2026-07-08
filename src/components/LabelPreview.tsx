"use client";

import { useEffect, useState } from "react";
import { BoxGroup, ShippingLabelForm } from "@/types/shipping-label";
import { generateBarcodeDataUrl } from "@/lib/barcode";

export default function LabelPreview({
  form,
  boxNumber,
  totalBoxes,
  boxGroup,
}: {
  form: ShippingLabelForm;
  boxNumber: number;
  totalBoxes: number;
  boxGroup: BoxGroup;
}) {
  const [barcodeUrl, setBarcodeUrl] = useState("");

  useEffect(() => {
    if (form.courier.awb) {
      setBarcodeUrl(generateBarcodeDataUrl(form.courier.awb));
    } else {
      setBarcodeUrl("");
    }
  }, [form.courier.awb]);

  const totalWeight = form.boxGroups.reduce((sum, group) => {
    return sum + Number(group.boxCount || 0) * Number(group.weightPerBox || 0);
  }, 0);

  return (
    <div className="flex justify-center overflow-auto rounded-2xl bg-black/10 p-4">
      <div
        className="bg-white p-4 text-black shadow-2xl"
        style={{ width: "384px", minHeight: "576px" }}
      >
        <div className="border-2 border-black p-3">
          <div className="flex items-start justify-between border-b-2 border-black pb-2">
            <div>
              <p className="text-xs font-bold uppercase">Shipping Label</p>
              <h3 className="text-lg font-black">
                {form.courier.courierName || "SELF DELIVERY"}
              </h3>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold">BOX</p>
              <p className="text-xl font-black">
                {boxNumber}/{totalBoxes}
              </p>
            </div>
          </div>

          {barcodeUrl && (
            <div className="border-b-2 border-black py-3 text-center">
              <img src={barcodeUrl} alt="AWB Barcode" className="mx-auto h-16" />
              <p className="mt-1 text-xs font-bold">AWB: {form.courier.awb}</p>
            </div>
          )}

          <div className="grid grid-cols-2 border-b-2 border-black">
            <AddressBlock title="From" data={form.sender} rightBorder />
            <AddressBlock title="To" data={form.receiver} />
          </div>

          <div className="border-b-2 border-black p-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Info label="Order/Invoice" value={form.order.orderId} />
              <Info label="Date" value={form.order.date} />
              <Info label="Payment" value={form.order.paymentMode} />
              <Info label="Total Weight" value={`${totalWeight.toFixed(2)} kg`} />
            </div>
          </div>

          <div className="border-b-2 border-black p-2">
            <p className="text-[10px] font-black uppercase">Product</p>
            <p className="text-sm font-bold leading-tight">
              {form.order.productName}
            </p>
          </div>

          <div className="grid grid-cols-3 border-b-2 border-black text-center">
            <div className="border-r-2 border-black p-2">
              <p className="text-[10px] font-black uppercase">Qty/Box</p>
              <p className="text-lg font-black">{boxGroup.qtyPerBox}</p>
            </div>

            <div className="border-r-2 border-black p-2">
              <p className="text-[10px] font-black uppercase">Wt/Box</p>
              <p className="text-lg font-black">{boxGroup.weightPerBox} kg</p>
            </div>

            <div className="p-2">
              <p className="text-[10px] font-black uppercase">Boxes</p>
              <p className="text-lg font-black">{totalBoxes}</p>
            </div>
          </div>

          <div className="p-2 text-center">
            <p className="text-[10px] font-black uppercase">Dimensions</p>
            <p className="text-base font-black">
              {boxGroup.length} × {boxGroup.width} × {boxGroup.height}
            </p>
            <p className="text-[10px]">L × W × H</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressBlock({
  title,
  data,
  rightBorder,
}: {
  title: string;
  data: ShippingLabelForm["sender"];
  rightBorder?: boolean;
}) {
  return (
    <div className={`min-h-[128px] p-2 ${rightBorder ? "border-r-2 border-black" : ""}`}>
      <p className="mb-1 text-[10px] font-black uppercase">{title}</p>
      <p className="text-sm font-bold leading-tight">{data.name || "-"}</p>
      <p className="text-xs">{data.phone || "-"}</p>
      <p className="mt-1 line-clamp-3 text-xs leading-tight">
        {data.address || "-"}
      </p>
      <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-tight">
        {data.city || "-"}, {data.state || "-"} - {data.pincode || "-"}
      </p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase">{label}</p>
      <p className="font-bold">{value || "-"}</p>
    </div>
  );
}