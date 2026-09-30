import { ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import QuantityStepper from './quantity-stepper';

type ShippingArea = {
    id: number;
    name: string;
    charge: string;
};

export default function CheckoutSection({
    productName,
    quantity,
    onQuantityChange,
    customerName,
    onCustomerNameChange,
    customerPhone,
    onCustomerPhoneChange,
    deliveryAddress,
    onDeliveryAddressChange,
    shippingAreas,
    shippingAreaId,
    onShippingAreaChange,
    customerNote,
    onCustomerNoteChange,
    subtotal,
    shippingCharge,
    grandTotal,
    errors,
    processing,
    onSubmit,
}: {
    productName: string;
    quantity: number;
    onQuantityChange: (value: number) => void;
    customerName: string;
    onCustomerNameChange: (value: string) => void;
    customerPhone: string;
    onCustomerPhoneChange: (value: string) => void;
    deliveryAddress: string;
    onDeliveryAddressChange: (value: string) => void;
    shippingAreas: ShippingArea[];
    shippingAreaId: number | null;
    onShippingAreaChange: (value: number) => void;
    customerNote: string;
    onCustomerNoteChange: (value: string) => void;
    subtotal: number;
    shippingCharge: number;
    grandTotal: number;
    errors: Partial<Record<string, string>>;
    processing: boolean;
    onSubmit: (e: FormEvent) => void;
}) {
    return (
        <section
            id="order"
            className="scroll-mt-16 bg-neutral-900/60 py-14 sm:py-20"
        >
            <div className="mx-auto max-w-xl px-4 sm:px-6">
                <h2 className="text-center font-bengali text-2xl font-bold text-white sm:text-3xl">
                    অর্ডার করুন
                </h2>
                <p className="mt-2 text-center font-bengali text-sm text-neutral-400">
                    {productName}
                </p>

                <form
                    onSubmit={onSubmit}
                    className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-neutral-950/60 p-6 font-bengali sm:p-8"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="quantity" className="text-neutral-300">
                            পরিমাণ
                        </Label>
                        <QuantityStepper
                            value={quantity}
                            onChange={onQuantityChange}
                        />
                        <InputError message={errors.quantity} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="customer_name"
                            className="text-neutral-300"
                        >
                            পূর্ণ নাম
                        </Label>
                        <Input
                            id="customer_name"
                            value={customerName}
                            onChange={(e) =>
                                onCustomerNameChange(e.target.value)
                            }
                            placeholder="আপনার নাম লিখুন"
                            className="border-white/15 bg-white/5 text-white placeholder:text-neutral-500"
                            required
                        />
                        <InputError message={errors.customer_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="customer_phone"
                            className="text-neutral-300"
                        >
                            মোবাইল নম্বর
                        </Label>
                        <Input
                            id="customer_phone"
                            type="tel"
                            inputMode="numeric"
                            pattern="01[3-9][0-9]{8}"
                            value={customerPhone}
                            onChange={(e) =>
                                onCustomerPhoneChange(e.target.value)
                            }
                            placeholder="01XXXXXXXXX"
                            className="border-white/15 bg-white/5 text-white placeholder:text-neutral-500"
                            required
                        />
                        <InputError message={errors.customer_phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="delivery_address"
                            className="text-neutral-300"
                        >
                            সম্পূর্ণ ঠিকানা
                        </Label>
                        <Textarea
                            id="delivery_address"
                            rows={3}
                            value={deliveryAddress}
                            onChange={(e) =>
                                onDeliveryAddressChange(e.target.value)
                            }
                            placeholder="বাসা/হোল্ডিং, রোড, এলাকা, জেলা"
                            className="border-white/15 bg-white/5 text-white placeholder:text-neutral-500"
                            required
                        />
                        <InputError message={errors.delivery_address} />
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-neutral-300">ডেলিভারি এলাকা</Label>
                        <Select
                            value={
                                shippingAreaId
                                    ? String(shippingAreaId)
                                    : undefined
                            }
                            onValueChange={(value) =>
                                onShippingAreaChange(Number(value))
                            }
                        >
                            <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
                                <SelectValue placeholder="এলাকা নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                {shippingAreas.map((area) => (
                                    <SelectItem
                                        key={area.id}
                                        value={String(area.id)}
                                    >
                                        {area.name} (৳{area.charge})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.shipping_area_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="customer_note"
                            className="text-neutral-300"
                        >
                            অর্ডার নোট (ঐচ্ছিক)
                        </Label>
                        <Textarea
                            id="customer_note"
                            rows={2}
                            value={customerNote}
                            onChange={(e) =>
                                onCustomerNoteChange(e.target.value)
                            }
                            className="border-white/15 bg-white/5 text-white placeholder:text-neutral-500"
                        />
                        <InputError message={errors.customer_note} />
                    </div>

                    <div className="space-y-1.5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                        <div className="flex justify-between text-neutral-400">
                            <span>সাবটোটাল</span>
                            <span>৳{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                            <span>ডেলিভারি চার্জ</span>
                            <span>৳{shippingCharge.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-1.5 text-base font-semibold text-white">
                            <span>সর্বমোট</span>
                            <span>৳{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <InputError message={errors.order} />

                    <Button
                        type="submit"
                        size="lg"
                        disabled={processing}
                        className="w-full bg-amber-500 text-base font-semibold text-neutral-950 hover:bg-amber-400"
                    >
                        {processing ? 'অর্ডার হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
                    </Button>

                    <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                        <ShieldCheck className="size-3.5 text-amber-500" />
                        ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন
                    </p>
                </form>
            </div>
        </section>
    );
}
