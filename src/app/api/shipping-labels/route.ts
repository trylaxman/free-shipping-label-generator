import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ShippingLabelForm } from "@/types/shipping-label";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({
      success: true,
      labels: [],
    });
  }

  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 20);

  const labels = await prisma.shippingLabel.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
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