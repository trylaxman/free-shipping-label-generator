export type PaymentMode = "Prepaid" | "COD" | "To Pay";

export type BoxGroup = {
  id: string;
  boxCount: number;
  length: number;
  width: number;
  height: number;
  weightPerBox: number;
  qtyPerBox: number;
};

export type ShippingLabelForm = {
  sender: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  receiver: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  order: {
    orderId: string;
    productName: string;
    date: string;
    paymentMode: PaymentMode;
  };
  courier: {
    courierName: string;
    awb: string;
  };
  boxGroups: BoxGroup[];
};