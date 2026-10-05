import { Form, Head } from '@inertiajs/react';
import ProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
import { ProductFormFields } from '@/components/admin/product-form-fields';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes/admin';
import products from '@/routes/admin/products';

export default function ProductCreate({
    canSetVisibility,
}: {
    canSetVisibility: boolean;
}) {
    return (
        <>
            <Head title="Add Product" />

            <Heading
                title="Add product"
                description="Create a new catalog product."
            />

            <Form {...ProductController.store.form()} className="space-y-6">
                {({ processing, errors }) => (
                    <>
                        <ProductFormFields
                            defaults={{
                                name: '',
                                slug: '',
                                sku: '',
                                short_description: '',
                                description: '',
                                regular_price: '',
                                sale_price: '',
                                track_stock: true,
                                stock: 0,
                                weight: '0.5',
                                free_delivery: false,
                                is_active: true,
                                meta_title: '',
                                meta_description: '',
                                sort_order: 0,
                            }}
                            errors={errors}
                            canSetVisibility={canSetVisibility}
                        />

                        <Button disabled={processing}>Create product</Button>
                    </>
                )}
            </Form>
        </>
    );
}

ProductCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Products', href: products.index() },
        { title: 'Add product', href: products.create() },
    ],
};
