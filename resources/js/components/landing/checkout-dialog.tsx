import { Truck } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CheckoutForm } from '@/hooks/use-checkout-form';
import { toEnglishDigits } from '@/lib/bangla-digits';
import { shippingAreaLabel } from '@/lib/shipping-area';
import QuantityStepper from './quantity-stepper';

const fieldClass =
    'border-amber-200 focus-visible:border-amber-400 focus-visible:ring-amber-400/30';

/**
 * The checkout form, shared across every design-concept page. On the live
 * `/` page the same fields are rendered inline in `checkout-section.tsx`;
 * here they live inside a popup instead, triggered by an "Order Now"
 * button (see `payment-section.tsx` / `order-trigger-button.tsx`).
 */
export default function CheckoutDialog({
    open,
    onOpenChange,
    productName,
    checkout,
    showQuantity = true,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productName: string;
    checkout: CheckoutForm;
    /**
     * Some pages (e.g. concept 1's product/payment section) already let the
     * shopper pick quantity on the page itself, before the dialog opens -
     * set this to false there so the stepper isn't shown twice.
     */
    showQuantity?: boolean;
}) {
    const {
        data,
        setField,
        setNote,
        setHoneypot,
        displayShippingAreas,
        subtotal,
        shippingCharge,
        grandTotal,
        errors,
        processing,
        submit,
    } = checkout;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto border-amber-200 font-bengali sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-bengali text-xl text-stone-900">
                        ডেলিভারি তথ্য প্রদান করুন
                    </DialogTitle>
                    <p className="font-bengali text-xs text-stone-500">
                        {productName} — ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে মূল্য পরিশোধ
                        করবেন
                    </p>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-5">
                    {/* Anti-Spam Honeypot - see checkout-section.tsx for why
                        the field name deliberately avoids autofill-bait
                        words and uses readOnly instead of display:none. */}
                    <div
                        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                        aria-hidden="true"
                    >
                        <input
                            type="text"
                            name="hp_confirm_entry"
                            value={data.website}
                            onChange={(e) => setHoneypot(e.target.value)}
                            tabIndex={-1}
                            autoComplete="off"
                            readOnly
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label
                                htmlFor="dialog_customer_name"
                                className="font-semibold text-stone-700"
                            >
                                পূর্ণ নাম
                            </Label>
                            <Input
                                id="dialog_customer_name"
                                value={data.customer_name}
                                onChange={(e) => {
                                    try {
                                        e.target.setCustomValidity('');
                                    } catch {
                                        // Ignore - see the phone field below.
                                    }

                                    setField('customer_name', e.target.value);
                                }}
                                onInvalid={(e) =>
                                    e.currentTarget.setCustomValidity(
                                        'Name may only contain letters, spaces, dots, and hyphens (no numbers or links).',
                                    )
                                }
                                placeholder="আপনার নাম লিখুন"
                                className={fieldClass}
                                maxLength={60}
                                pattern="[\p{Script=Bengali}\p{Script=Latin} .\-]+"
                                required
                            />
                            <InputError message={errors.customer_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="dialog_customer_phone"
                                className="font-semibold text-stone-700"
                            >
                                মোবাইল নম্বর
                            </Label>
                            <Input
                                id="dialog_customer_phone"
                                type="tel"
                                inputMode="numeric"
                                pattern="01[3-9][0-9]{8}"
                                value={data.customer_phone}
                                onChange={(e) => {
                                    // The actual state update (and the
                                    // abandoned-checkout tracking it
                                    // triggers) must never be blocked by
                                    // this - it's just resetting the native
                                    // validation message.
                                    try {
                                        e.target.setCustomValidity('');
                                    } catch {
                                        // Ignore - see above.
                                    }

                                    setField(
                                        'customer_phone',
                                        toEnglishDigits(e.target.value),
                                    );
                                }}
                                onInvalid={(e) =>
                                    e.currentTarget.setCustomValidity(
                                        'Please provide a 11 digit valid Bangladesh phone number starts with 01',
                                    )
                                }
                                placeholder="01XXXXXXXXX"
                                className={fieldClass}
                                required
                            />
                            <InputError message={errors.customer_phone} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="dialog_delivery_address"
                            className="font-semibold text-stone-700"
                        >
                            সম্পূর্ণ ঠিকানা
                        </Label>
                        <Textarea
                            id="dialog_delivery_address"
                            rows={2}
                            value={data.delivery_address}
                            onChange={(e) =>
                                setField('delivery_address', e.target.value)
                            }
                            placeholder="বাসা/হোল্ডিং, রোড, এলাকা, জেলা"
                            className={fieldClass}
                            required
                            minLength={10}
                            maxLength={200}
                        />
                        <InputError message={errors.delivery_address} />
                    </div>

                    <div className="grid gap-2">
                        <Label className="font-semibold text-stone-700">
                            ডেলিভারি এলাকা
                        </Label>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {displayShippingAreas.map((area) => {
                                const checked =
                                    data.shipping_area_id === area.id;

                                return (
                                    <label
                                        key={area.id}
                                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                                            checked
                                                ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-400/50'
                                                : 'border-amber-200 hover:border-amber-300'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="dialog_shipping_area_id"
                                                checked={checked}
                                                onChange={() =>
                                                    setField(
                                                        'shipping_area_id',
                                                        area.id,
                                                    )
                                                }
                                                className="size-4 accent-amber-600"
                                            />
                                            {shippingAreaLabel(area.name)}
                                        </span>
                                        <span className="text-xs text-stone-500">
                                            ৳{area.charge}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        <InputError message={errors.shipping_area_id} />
                    </div>

                    {showQuantity && (
                        <div className="grid gap-2">
                            <Label
                                htmlFor="dialog_quantity"
                                className="font-semibold text-stone-700"
                            >
                                বোতলের সংখ্যা (পরিমাণ)
                            </Label>
                            <div className="flex items-center gap-3">
                                <QuantityStepper
                                    value={data.quantity}
                                    onChange={(value) =>
                                        setField('quantity', value)
                                    }
                                />
                                <span className="text-xs font-medium text-stone-500">
                                    (প্রতি বোতল ৳
                                    {subtotal > 0 && data.quantity > 0
                                        ? (subtotal / data.quantity).toFixed(0)
                                        : '791'}
                                    )
                                </span>
                            </div>
                            <InputError message={errors.quantity} />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label
                            htmlFor="dialog_customer_note"
                            className="text-xs font-medium text-stone-700"
                        >
                            অর্ডার নোট (ঐচ্ছিক)
                        </Label>
                        <Textarea
                            id="dialog_customer_note"
                            rows={2}
                            value={data.customer_note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন"
                            className={fieldClass}
                            maxLength={100}
                        />
                        <InputError message={errors.customer_note} />
                    </div>

                    <div className="space-y-3 rounded-2xl border border-stone-800 bg-stone-950 p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-sm text-neutral-300">
                            <span>পণ্য ({data.quantity}টি বোতল)</span>
                            <span>৳{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-sm text-neutral-300">
                            <span>ডেলিভারি চার্জ</span>
                            <span>৳{shippingCharge.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-base font-bold text-amber-400">
                            <span>সর্বমোট প্রদেয় মূল্য</span>
                            <span className="text-xl font-extrabold">
                                ৳{grandTotal.toFixed(2)}
                            </span>
                        </div>

                        <InputError message={errors.order} />

                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing}
                            className="mt-2 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-[length:200%_auto] text-base font-bold text-stone-950 shadow-xl transition-[background-position] duration-1000 hover:bg-right"
                        >
                            {processing ? 'অর্ডার হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
                        </Button>

                        <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-neutral-400">
                            <Truck className="size-3.5 text-emerald-400" />
                            <span>
                                ক্যাশ অন ডেলিভারি — হাতে পেয়ে মূল্য পরিশোধ করুন
                            </span>
                        </p>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
