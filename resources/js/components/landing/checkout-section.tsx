import { ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import heroImage from '../../../images/landing/ababil-oil.webp';
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
import Reveal from './motion/reveal';
import QuantityStepper from './quantity-stepper';

const fieldClass =
    'border-amber-200 focus-visible:border-amber-400 focus-visible:ring-amber-400/30';

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
    honeypotValue,
    onHoneypotChange,
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
    honeypotValue: string;
    onHoneypotChange: (value: string) => void;
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
            className="scroll-mt-16 bg-gradient-to-b from-amber-100 to-amber-50 py-14 sm:py-20"
        >
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
                <Reveal>
                    <h2 className="text-center font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        অর্ডার করুন
                    </h2>
                    <p className="mt-2 text-center font-bengali text-sm text-stone-600">
                        {productName}
                    </p>
                </Reveal>

                <Reveal delay={0.1}>
                    <form
                        onSubmit={onSubmit}
                        className="mt-8 font-bengali lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-6"
                    >
                        {/* Honeypot: hidden off-screen from real visitors and
                            unreachable by keyboard/screen readers. Bots that
                            blindly autofill every field trip it. */}
                        <div
                            className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                            aria-hidden="true"
                        >
                            <input
                                type="text"
                                name="website"
                                value={honeypotValue}
                                onChange={(e) =>
                                    onHoneypotChange(e.target.value)
                                }
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        <div className="space-y-5 rounded-2xl border border-amber-200 bg-white p-6 shadow-xl shadow-amber-900/5 sm:p-8">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="customer_name"
                                        className="text-stone-700"
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
                                        className={fieldClass}
                                        required
                                    />
                                    <InputError
                                        message={errors.customer_name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="customer_phone"
                                        className="text-stone-700"
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
                                            onCustomerPhoneChange(
                                                e.target.value,
                                            )
                                        }
                                        placeholder="01XXXXXXXXX"
                                        className={fieldClass}
                                        required
                                    />
                                    <InputError
                                        message={errors.customer_phone}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="delivery_address"
                                    className="text-stone-700"
                                >
                                    সম্পূর্ণ ঠিকানা
                                </Label>
                                <Textarea
                                    id="delivery_address"
                                    rows={2}
                                    value={deliveryAddress}
                                    onChange={(e) =>
                                        onDeliveryAddressChange(e.target.value)
                                    }
                                    placeholder="বাসা/হোল্ডিং, রোড, এলাকা, জেলা"
                                    className={fieldClass}
                                    required
                                    minLength={10}
                                />
                                <InputError message={errors.delivery_address} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label className="text-stone-700">
                                        ডেলিভারি এলাকা
                                    </Label>
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
                                        <SelectTrigger
                                            className={`w-full ${fieldClass}`}
                                        >
                                            <SelectValue placeholder="এলাকা নির্বাচন করুন" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {shippingAreas.map((area) => (
                                                <SelectItem
                                                    key={area.id}
                                                    value={String(area.id)}
                                                >
                                                    {area.name} (৳
                                                    {area.charge})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.shipping_area_id}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="quantity"
                                        className="text-stone-700"
                                    >
                                        পরিমাণ
                                    </Label>
                                    <QuantityStepper
                                        value={quantity}
                                        onChange={onQuantityChange}
                                    />
                                    <InputError message={errors.quantity} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="customer_note"
                                    className="text-stone-700"
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
                                    className={fieldClass}
                                />
                                <InputError message={errors.customer_note} />
                            </div>
                        </div>

                        <div className="mt-6 space-y-4 rounded-2xl border border-amber-200 bg-stone-950 p-6 shadow-xl shadow-amber-900/10 lg:sticky lg:top-24 lg:mt-0">
                            <div className="flex items-center gap-3">
                                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                                    <img
                                        src={heroImage}
                                        alt=""
                                        className="size-full object-contain"
                                    />
                                </div>
                                <p className="text-sm font-medium text-white">
                                    {productName}
                                </p>
                            </div>

                            <div className="space-y-1.5 border-t border-white/10 pt-4 text-sm">
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
                                className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-[length:200%_auto] text-base font-semibold text-stone-950 transition-[background-position] duration-500 hover:bg-right"
                            >
                                {processing ? 'অর্ডার হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
                            </Button>

                            <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                                <ShieldCheck className="size-3.5 text-amber-500" />
                                ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন
                            </p>
                        </div>
                    </form>
                </Reveal>
            </div>
        </section>
    );
}
