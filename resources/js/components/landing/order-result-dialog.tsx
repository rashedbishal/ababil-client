import * as DialogPrimitive from '@radix-ui/react-dialog';
import { CheckCircle2, XCircle, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPortal,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type OrderResult =
    | {
          type: 'success';
          orderNumber: string;
          customerName: string;
          shippingAreaName: string;
          grandTotal: string;
      }
    | {
          type: 'error';
          message: string;
      };

export default function OrderResultDialog({
    result,
    onClose,
}: {
    result: OrderResult | null;
    onClose: () => void;
}) {
    return (
        <Dialog
            open={result !== null}
            modal={false}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogPortal data-slot="dialog-portal">
                <div
                    aria-hidden="true"
                    className="pointer-events-none fixed inset-0 z-50 backdrop-blur-sm"
                />
                <DialogPrimitive.Content
                    data-slot="dialog-content"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    className={cn(
                        'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg',
                        'border-amber-200 font-bengali sm:max-w-md',
                    )}
                >
                    {result?.type === 'success' && (
                        <>
                            <DialogHeader className="items-center text-center sm:text-center">
                                <span className="mb-2 flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                    <CheckCircle2 className="size-9" />
                                </span>
                                <DialogTitle className="font-bengali text-xl text-stone-900">
                                    অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!
                                </DialogTitle>
                                <DialogDescription className="font-bengali text-stone-600">
                                    {result.customerName}, আপনার অর্ডারের জন্য
                                    ধন্যবাদ। আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ
                                    করবেন।
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-1.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
                                <div className="flex justify-between text-stone-600">
                                    <span>অর্ডার নম্বর</span>
                                    <span className="font-semibold text-stone-900">
                                        {result.orderNumber}
                                    </span>
                                </div>
                                <div className="flex justify-between text-stone-600">
                                    <span>ডেলিভারি এলাকা</span>
                                    <span>{result.shippingAreaName}</span>
                                </div>
                                <div className="flex justify-between border-t border-amber-200 pt-1.5 text-base font-semibold text-stone-900">
                                    <span>সর্বমোট</span>
                                    <span>৳{result.grandTotal}</span>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    onClick={onClose}
                                    className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 font-bengali text-stone-950 hover:brightness-105"
                                >
                                    ঠিক আছে
                                </Button>
                            </DialogFooter>
                        </>
                    )}

                    {result?.type === 'error' && (
                        <>
                            <DialogHeader className="items-center text-center sm:text-center">
                                <span className="mb-2 flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    <XCircle className="size-9" />
                                </span>
                                <DialogTitle className="font-bengali text-xl text-stone-900">
                                    অর্ডারটি সম্পন্ন করা যায়নি
                                </DialogTitle>
                                <DialogDescription className="font-bengali text-stone-600">
                                    {result.message}
                                </DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="w-full border-amber-200 font-bengali"
                                >
                                    আবার চেষ্টা করুন
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                    <DialogPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
}
