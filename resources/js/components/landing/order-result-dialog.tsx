import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="border-amber-200 font-bengali sm:max-w-md"
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
                                {result.customerName}, আপনার অর্ডারের জন্য ধন্যবাদ।
                                আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।
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
            </DialogContent>
        </Dialog>
    );
}
