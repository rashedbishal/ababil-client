import { Form, Head } from '@inertiajs/react';
import ProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
import { ProductFormFields } from '@/components/admin/product-form-fields';
import {
    VariantsManager,
    type Variant,
} from '@/components/admin/variants-manager';
import {
    ProductImagesManager,
    type ProductImage,
    type ImageSpec,
} from '@/components/admin/product-images-manager';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { dashboard } from '@/routes/admin';
import products from '@/routes/admin/products';

type ProductDetail = {
    id: number;
    name: string;
    slug: string;
    sku: string;
    short_description: string | null;
    description: string | null;
    regular_price: string;
    sale_price: string | null;
    track_stock: boolean;
    stock: number;
    weight: string;
    free_delivery: boolean;
    is_active: boolean;
    meta_title: string | null;
    meta_description: string | null;
    sort_order: number;
    variants: Variant[];
};

export default function ProductEdit({
    product,
    images,
    imageSpec,
    sizes,
    canSetVisibility,
    sizeManagementEnabled,
}: {
    product: ProductDetail;
    images: ProductImage[];
    imageSpec: ImageSpec;
    sizes: { id: number; name: string }[];
    canSetVisibility: boolean;
    sizeManagementEnabled: boolean;
}) {
    return (
        <>
            <Head title={`Edit ${product.name}`} />

            <Heading
                title={`Edit ${product.name}`}
                description="Update this product's details."
            />

            <Form
                {...ProductController.update.form(product.id)}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <ProductFormFields
                            defaults={product}
                            errors={errors}
                            canSetVisibility={canSetVisibility}
                        />
                        <Button disabled={processing}>Save changes</Button>
                    </>
                )}
            </Form>

            <Separator />

            <ProductImagesManager
                productId={product.id}
                images={images}
                imageSpec={imageSpec}
            />

            {sizeManagementEnabled && (
                <>
                    <Separator />

                    <VariantsManager
                        productId={product.id}
                        variants={product.variants}
                        sizes={sizes}
                    />
                </>
            )}
        </>
    );
}

ProductEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Products', href: products.index() },
        { title: 'Edit', href: '#' },
    ],
};
