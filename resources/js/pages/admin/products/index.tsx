import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes/admin';
import products from '@/routes/admin/products';
import type { Paginated } from '@/types';

type ProductRow = {
    id: number;
    name: string;
    sku: string;
    regular_price: string;
    sale_price: string | null;
    stock: number;
    variants_count: number;
    is_active: boolean;
    is_archived: boolean;
};

export default function ProductsIndex({
    products: paginated,
    filters,
    canCreateProducts,
}: {
    products: Paginated<ProductRow>;
    filters: { search?: string; status?: string };
    canCreateProducts: boolean;
}) {
    function archive(id: number) {
        if (confirm('Archive this product?')) {
            router.delete(products.destroy(id), { preserveScroll: true });
        }
    }

    function restore(id: number) {
        router.post(products.restore(id), {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Products" />

            <div className="flex items-center justify-between">
                <Heading title="Products" description="Manage your catalog." />
                {canCreateProducts && (
                    <Button asChild>
                        <Link href={products.create()}>Add product</Link>
                    </Button>
                )}
            </div>

            <form method="get" className="flex flex-wrap gap-2">
                <Input
                    type="search"
                    name="search"
                    placeholder="Search by name or SKU…"
                    defaultValue={filters.search ?? ''}
                    className="max-w-xs"
                />
                <select
                    name="status"
                    defaultValue={filters.status ?? ''}
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                >
                    <option value="">All active/inactive</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                </select>
                <Button type="submit" variant="secondary">
                    Filter
                </Button>
            </form>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Variants</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginated.data.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="text-center text-muted-foreground"
                            >
                                No products found.
                            </TableCell>
                        </TableRow>
                    )}
                    {paginated.data.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium">
                                {product.name}
                            </TableCell>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell>
                                {product.sale_price ? (
                                    <span>
                                        <span className="text-muted-foreground line-through">
                                            ৳{product.regular_price}
                                        </span>{' '}
                                        ৳{product.sale_price}
                                    </span>
                                ) : (
                                    <span>৳{product.regular_price}</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {product.variants_count > 0
                                    ? '—'
                                    : product.stock}
                            </TableCell>
                            <TableCell>{product.variants_count}</TableCell>
                            <TableCell>
                                {product.is_archived ? (
                                    <Badge variant="destructive">
                                        Archived
                                    </Badge>
                                ) : product.is_active ? (
                                    <Badge>Active</Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={products.edit(product.id)}>
                                            Edit
                                        </Link>
                                    </Button>
                                    {product.is_archived ? (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => restore(product.id)}
                                        >
                                            Restore
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => archive(product.id)}
                                        >
                                            Archive
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Pagination links={paginated.links} />
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Products', href: products.index() },
    ],
};
