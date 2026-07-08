"use client";

import { useEffect, useMemo, useState } from "react";
import { BoxGroup, ShippingLabelForm } from "@/types/shipping-label";
import LabelPreview from "./LabelPreview";
import Stepper from "./Stepper";
import { downloadShippingLabelsPdf } from "@/lib/labelPdf";

const createBoxGroup = (): BoxGroup => ({
    id: crypto.randomUUID(),
    boxCount: 1,
    length: 0,
    width: 0,
    height: 0,
    weightPerBox: 0,
    qtyPerBox: 0,
});

const initialForm: ShippingLabelForm = {
    sender: {
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    },
    receiver: {
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    },
    order: {
        orderId: "",
        productName: "",
        date: new Date().toISOString().split("T")[0],
        paymentMode: "Prepaid",
    },
    courier: {
        courierName: "",
        awb: "",
    },
    boxGroups: [
        {
            id: "default-box-group",
            boxCount: 1,
            length: 0,
            width: 0,
            height: 0,
            weightPerBox: 0,
            qtyPerBox: 0,
        },
    ],
};

type SavedLabel = {
    id: string;

    senderName: string;
    senderPhone: string | null;
    senderAddress: string;
    senderCity: string | null;
    senderState: string | null;
    senderPincode: string | null;

    receiverName: string;
    receiverPhone: string | null;
    receiverAddress: string;
    receiverCity: string | null;
    receiverState: string | null;
    receiverPincode: string | null;

    orderId: string | null;
    productName: string;
    shippingDate: string | null;
    paymentMode: ShippingLabelForm["order"]["paymentMode"];

    courierName: string | null;
    awb: string | null;

    boxGroups: BoxGroup[];

    createdAt: string;
};

export default function ShippingLabelApp() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<ShippingLabelForm>(initialForm);
    const [generated, setGenerated] = useState(false);
    const [history, setHistory] = useState<SavedLabel[]>([]);

    const loadHistory = async () => {
        try {
            const res = await fetch("/api/shipping-labels");
            const data = await res.json();

            if (data.success) {
                setHistory(data.labels);
            }
        } catch (error) {
            console.error("Failed loading history", error);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const totalBoxes = useMemo(() => {
        return form.boxGroups.reduce(
            (sum, group) => sum + Number(group.boxCount || 0),
            0
        );
    }, [form.boxGroups]);

    const totalWeight = useMemo(() => {
        return form.boxGroups.reduce((sum, group) => {
            return sum + Number(group.boxCount || 0) * Number(group.weightPerBox || 0);
        }, 0);
    }, [form.boxGroups]);

    const firstBoxGroup = form.boxGroups[0];

    const updateForm = <K extends "sender" | "receiver" | "order" | "courier">(
        section: K,
        value: Partial<ShippingLabelForm[K]>
    ) => {
        setForm((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                ...value,
            },
        }));
        setGenerated(false);
    };

    const updateBoxGroup = (
        id: string,
        value: Partial<Omit<BoxGroup, "id">>
    ) => {
        setForm((prev) => ({
            ...prev,
            boxGroups: prev.boxGroups.map((group) =>
                group.id === id ? { ...group, ...value } : group
            ),
        }));
        setGenerated(false);
    };

    const [expandedBoxGroupId, setExpandedBoxGroupId] = useState(
        initialForm.boxGroups[0].id
    );

    const addBoxGroup = () => {
        const newGroup = createBoxGroup();

        setForm((prev) => ({
            ...prev,
            boxGroups: [...prev.boxGroups, newGroup],
        }));

        setExpandedBoxGroupId(newGroup.id);
        setGenerated(false);
    };

    const removeBoxGroup = (id: string) => {
        setForm((prev) => {
            const remainingGroups =
                prev.boxGroups.length === 1
                    ? prev.boxGroups
                    : prev.boxGroups.filter((group) => group.id !== id);

            setExpandedBoxGroupId(remainingGroups[0].id);

            return {
                ...prev,
                boxGroups: remainingGroups,
            };
        });

        setGenerated(false);
    };

    const handleSubmit = async () => {
        setGenerated(true);

        try {
            await fetch("/api/shipping-labels", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            loadHistory();

        } catch (error) {
            console.error("Failed to save label", error);
        }
    };

    const loadSavedLabel = (label: SavedLabel) => {
        setForm({
            sender: {
                name: label.senderName,
                phone: label.senderPhone || "",
                address: label.senderAddress,
                city: label.senderCity || "",
                state: label.senderState || "",
                pincode: label.senderPincode || "",
            },

            receiver: {
                name: label.receiverName,
                phone: label.receiverPhone || "",
                address: label.receiverAddress,
                city: label.receiverCity || "",
                state: label.receiverState || "",
                pincode: label.receiverPincode || "",
            },

            order: {
                orderId: label.orderId || "",
                productName: label.productName,
                date:
                    label.shippingDate ||
                    new Date().toISOString().split("T")[0],
                paymentMode: label.paymentMode,
            },

            courier: {
                courierName: label.courierName || "",
                awb: label.awb || "",
            },

            boxGroups: label.boxGroups,
        });

        setGenerated(true);

        if (label.boxGroups.length) {
            setExpandedBoxGroupId(label.boxGroups[0].id);
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] px-4 py-10 text-white">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[620px_1fr]">
                <section className="rounded-[28px] border border-white/10 bg-[#151515] p-8 shadow-2xl">
                    <div className="mb-8">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#9AF000]/40 bg-[#9AF000]/10 px-4 py-1.5 text-xs text-[#9AF000]">
                            <span>▥</span>
                            Free Shipping Label Generator by Baiko
                        </div>

                        <h1 className="max-w-xl text-4xl font-bold leading-tight">
                            Generate 4×6 shipping labels in seconds
                        </h1>

                        <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
                            Create thermal printer ready shipping labels for courier,
                            warehouse, ecommerce, Amazon, Flipkart, Blinkit or self delivery.
                        </p>
                    </div>

                    <Stepper step={step} setStep={setStep} />

                    <div className="mt-7 space-y-5">
                        {step === 0 && (
                            <>
                                <SectionHeading
                                    title="Sender Info"
                                    description="Details of the person or company shipping the boxes."
                                />

                                <Input
                                    label="Sender / Company Name"
                                    value={form.sender.name}
                                    onChange={(v) => updateForm("sender", { name: v })}
                                />
                                <Input
                                    label="Phone"
                                    value={form.sender.phone}
                                    onChange={(v) => updateForm("sender", { phone: v })}
                                />
                                <Textarea
                                    label="Full Address"
                                    value={form.sender.address}
                                    onChange={(v) => updateForm("sender", { address: v })}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="City"
                                        value={form.sender.city}
                                        onChange={(v) => updateForm("sender", { city: v })}
                                    />
                                    <Input
                                        label="State"
                                        value={form.sender.state}
                                        onChange={(v) => updateForm("sender", { state: v })}
                                    />
                                </div>

                                <Input
                                    label="Pincode"
                                    value={form.sender.pincode}
                                    onChange={(v) => updateForm("sender", { pincode: v })}
                                />
                            </>
                        )}

                        {step === 1 && (
                            <>
                                <SectionHeading
                                    title="Receiver Info"
                                    description="Delivery address where the shipment has to reach."
                                />

                                <Input
                                    label="Receiver / Company Name"
                                    value={form.receiver.name}
                                    onChange={(v) => updateForm("receiver", { name: v })}
                                />
                                <Input
                                    label="Phone"
                                    value={form.receiver.phone}
                                    onChange={(v) => updateForm("receiver", { phone: v })}
                                />
                                <Textarea
                                    label="Full Address"
                                    value={form.receiver.address}
                                    onChange={(v) => updateForm("receiver", { address: v })}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="City"
                                        value={form.receiver.city}
                                        onChange={(v) => updateForm("receiver", { city: v })}
                                    />
                                    <Input
                                        label="State"
                                        value={form.receiver.state}
                                        onChange={(v) => updateForm("receiver", { state: v })}
                                    />
                                </div>

                                <Input
                                    label="Pincode"
                                    value={form.receiver.pincode}
                                    onChange={(v) => updateForm("receiver", { pincode: v })}
                                />
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <SectionHeading
                                    title="Order Details"
                                    description="Add invoice, product and payment details for this shipment."
                                />

                                <Input
                                    label="Order / Invoice ID"
                                    value={form.order.orderId}
                                    onChange={(v) => updateForm("order", { orderId: v })}
                                />
                                <Input
                                    label="Product Name"
                                    value={form.order.productName}
                                    onChange={(v) => updateForm("order", { productName: v })}
                                />
                                <Input
                                    type="date"
                                    label="Pick a Date"
                                    value={form.order.date}
                                    onChange={(v) => updateForm("order", { date: v })}
                                />

                                <label className="block">
                                    <span className="mb-2 block text-sm text-white/75">
                                        Payment Mode
                                    </span>
                                    <select
                                        value={form.order.paymentMode}
                                        onChange={(e) =>
                                            updateForm("order", {
                                                paymentMode:
                                                    e.target.value as ShippingLabelForm["order"]["paymentMode"],
                                            })
                                        }
                                        className="w-full rounded-2xl border border-white/10 bg-[#101010] px-4 py-3.5 text-white outline-none focus:border-[#9AF000]"
                                    >
                                        <option>Prepaid</option>
                                        <option>COD</option>
                                        <option>To Pay</option>
                                    </select>
                                </label>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <SectionHeading
                                    title="Courier Details"
                                    description="Add courier name and AWB if available. AWB will create a barcode."
                                />

                                <Input
                                    label="Courier Name"
                                    placeholder="Leave blank if delivering by self"
                                    value={form.courier.courierName}
                                    onChange={(v) => updateForm("courier", { courierName: v })}
                                />
                                <Input
                                    label="AWB Number"
                                    placeholder="Optional. Barcode will be generated if added."
                                    value={form.courier.awb}
                                    onChange={(v) => updateForm("courier", { awb: v })}
                                />
                            </>
                        )}

                        {step === 4 && (
                            <>
                                <div className="flex items-start justify-between gap-4">
                                    <SectionHeading
                                        title="Box Details"
                                        description="Add one group for same-size boxes. Add more groups if boxes have different dimensions or weight."
                                    />

                                    <button
                                        type="button"
                                        onClick={addBoxGroup}
                                        className="shrink-0 rounded-2xl border border-[#9AF000]/40 bg-[#9AF000]/10 px-4 py-3 text-sm font-semibold text-[#9AF000] hover:bg-[#9AF000]/15"
                                    >
                                        + Add Box
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {form.boxGroups.map((group, index) => {
                                        const expanded = expandedBoxGroupId === group.id;

                                        return (
                                            <div
                                                key={group.id}
                                                className="rounded-3xl border border-white/10 bg-[#101010]"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExpandedBoxGroupId(expanded ? "" : group.id)
                                                    }
                                                    className="flex w-full items-center justify-between gap-3 p-5 text-left"
                                                >
                                                    <div>
                                                        <h3 className="font-semibold">Box Group {index + 1}</h3>
                                                        <p className="mt-1 text-xs text-white/45">
                                                            {group.boxCount} boxes · {group.length} × {group.width} ×{" "}
                                                            {group.height} · {group.weightPerBox} kg/box
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {form.boxGroups.length > 1 && (
                                                            <span
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeBoxGroup(group.id);
                                                                }}
                                                                className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                                                            >
                                                                Remove
                                                            </span>
                                                        )}

                                                        <span className="text-xl text-[#9AF000]">
                                                            {expanded ? "⌃" : "⌄"}
                                                        </span>
                                                    </div>
                                                </button>

                                                {expanded && (
                                                    <div className="space-y-4 border-t border-white/10 p-5 pt-4">
                                                        <Input
                                                            type="number"
                                                            label="No. of Boxes in this group"
                                                            value={String(group.boxCount)}
                                                            onChange={(v) =>
                                                                updateBoxGroup(group.id, {
                                                                    boxCount: Number(v) || 1,
                                                                })
                                                            }
                                                        />

                                                        <div className="grid grid-cols-3 gap-3">
                                                            <Input
                                                                type="number"
                                                                label="L"
                                                                value={String(group.length)}
                                                                onChange={(v) =>
                                                                    updateBoxGroup(group.id, {
                                                                        length: Number(v),
                                                                    })
                                                                }
                                                            />
                                                            <Input
                                                                type="number"
                                                                label="W"
                                                                value={String(group.width)}
                                                                onChange={(v) =>
                                                                    updateBoxGroup(group.id, {
                                                                        width: Number(v),
                                                                    })
                                                                }
                                                            />
                                                            <Input
                                                                type="number"
                                                                label="H"
                                                                value={String(group.height)}
                                                                onChange={(v) =>
                                                                    updateBoxGroup(group.id, {
                                                                        height: Number(v),
                                                                    })
                                                                }
                                                            />
                                                        </div>

                                                        <Input
                                                            type="number"
                                                            label="Weight per Box / kg"
                                                            value={String(group.weightPerBox)}
                                                            onChange={(v) =>
                                                                updateBoxGroup(group.id, {
                                                                    weightPerBox: Number(v),
                                                                })
                                                            }
                                                        />

                                                        <Input
                                                            type="number"
                                                            label="Qty per Box"
                                                            value={String(group.qtyPerBox)}
                                                            onChange={(v) =>
                                                                updateBoxGroup(group.id, {
                                                                    qtyPerBox: Number(v),
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-[#9AF000]/30 bg-[#9AF000]/10 p-5">
                                        <p className="text-sm text-white/70">Total Boxes</p>
                                        <p className="mt-1 text-3xl font-bold text-[#9AF000]">
                                            {totalBoxes}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-[#9AF000]/30 bg-[#9AF000]/10 p-5">
                                        <p className="text-sm text-white/70">Total Weight</p>
                                        <p className="mt-1 text-3xl font-bold text-[#9AF000]">
                                            {totalWeight.toFixed(2)} kg
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex gap-3 pt-5">
                            <button
                                disabled={step === 0}
                                onClick={() => setStep((s) => s - 1)}
                                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Back
                            </button>

                            {step < 4 ? (
                                <button
                                    onClick={() => setStep((s) => s + 1)}
                                    className="flex-1 rounded-2xl bg-[#9AF000] px-5 py-3.5 font-semibold text-black hover:bg-[#8be000]"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 rounded-2xl bg-[#9AF000] px-5 py-3.5 font-semibold text-black hover:bg-[#8be000]"
                                >
                                    Generate Labels
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="rounded-[28px] bg-white p-8 text-[#1c1c1c] shadow-2xl">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-[#4b8f00]">Preview</p>
                            <h2 className="text-2xl font-bold">Generated shipping label</h2>
                            <p className="mt-1 text-sm text-black/45">
                                4×6 thermal printer size
                            </p>
                        </div>

                        {generated && (
                            <button
                                onClick={() => downloadShippingLabelsPdf(form)}
                                className="shrink-0 rounded-2xl bg-[#9AF000] px-5 py-3 text-sm font-semibold text-black hover:bg-[#8be000]"
                            >
                                Download PDF
                            </button>
                        )}
                    </div>

                    {generated && firstBoxGroup ? (
                        <div className="rounded-[24px] border border-[#e5e5e5] bg-[#fafafa] p-5">
                            <LabelPreview
                                form={form}
                                boxNumber={1}
                                totalBoxes={totalBoxes}
                                boxGroup={firstBoxGroup}
                            />
                        </div>
                    ) : (
                        <div className="flex min-h-[620px] items-center justify-center rounded-[24px] border border-[#e5e5e5] bg-[#fafafa] p-6">
                            <div className="w-full rounded-[20px] border border-dashed border-[#d8d8d8] p-16 text-center">
                                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f1f1f1] text-2xl">
                                    ▤
                                </div>
                                <h3 className="text-xl font-bold">No label generated yet</h3>
                                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-black/50">
                                    Fill the shipment details and generate your 4×6 shipping
                                    label.
                                </p>
                            </div>
                        </div>
                    )}
                    {history.length > 0 && (
                        <div className="mt-6">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-bold">
                                    Recent Labels
                                </h3>

                                <span className="text-xs text-black/40">
                                    Click to reuse
                                </span>
                            </div>

                            <div className="space-y-2">
                                {history.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => loadSavedLabel(item)}
                                        className="w-full rounded-2xl border border-black/10 bg-white p-4 text-left transition hover:border-[#9AF000]"
                                    >
                                        <div className="flex justify-between gap-3">
                                            <div>
                                                <p className="font-semibold">
                                                    {item.receiverName}
                                                </p>

                                                <p className="text-xs text-black/50">
                                                    {item.productName}
                                                </p>
                                            </div>

                                            <span className="text-xs font-bold text-[#4b8f00]">
                                                {item.totalBoxes} Box
                                            </span>
                                        </div>

                                        <p className="mt-2 text-xs text-black/40">
                                            #{item.orderId || "No Invoice"}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

function SectionHeading({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-white/55">{description}</p>
        </div>
    );
}

function Input({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm text-white/75">{label}</span>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#101010] px-4 py-3.5 text-white outline-none placeholder:text-white/35 focus:border-[#9AF000]"
            />
        </label>
    );
}

function Textarea({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm text-white/75">{label}</span>
            <textarea
                value={value}
                rows={3}
                onChange={(e) => onChange(e.target.value)}
                className="w-full resize-none rounded-2xl border border-white/10 bg-[#101010] px-4 py-3.5 text-white outline-none placeholder:text-white/35 focus:border-[#9AF000]"
            />
        </label>
    );
}