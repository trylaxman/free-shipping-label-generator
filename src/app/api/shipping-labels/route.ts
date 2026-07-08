// src/app/api/shipping-labels/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ShippingLabelForm } from "@/types/shipping-label";

export async function GET() {
  const labels = await prisma.shippingLabel.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return NextResponse.json({
    success: true,
    labels,
  });
}

export async function POST(request: Request) {
  try {
    const form = (await request.json()) as ShippingLabelForm;

    const totalBoxes = Math.max(
      1,
      form.boxGroups.reduce(
        (sum, group) => sum + Number(group.boxCount || 0),
        0
      )
    );

    const totalWeight = form.boxGroups.reduce((sum, group) => {
      return (
        sum + Number(group.boxCount || 0) * Number(group.weightPerBox || 0)
      );
    }, 0);

    const record = await prisma.shippingLabel.create({
      data: {
        senderName: form.sender.name,
        senderPhone: form.sender.phone,
        senderAddress: form.sender.address,
        senderCity: form.sender.city,
        senderState: form.sender.state,
        senderPincode: form.sender.pincode,

        receiverName: form.receiver.name,
        receiverPhone: form.receiver.phone,
        receiverAddress: form.receiver.address,
        receiverCity: form.receiver.city,
        receiverState: form.receiver.state,
        receiverPincode: form.receiver.pincode,

        orderId: form.order.orderId,
        productName: form.order.productName,
        shippingDate: form.order.date,
        paymentMode: form.order.paymentMode,

        courierName: form.courier.courierName,
        awb: form.courier.awb,

        totalBoxes,
        totalWeight,
        boxGroups: form.boxGroups,
      },
    });

    return NextResponse.json({
      success: true,
      record,
    });
  } catch (error) {
    console.error("CREATE_SHIPPING_LABEL_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save shipping label.",
      },
      { status: 500 }
    );
  }
}