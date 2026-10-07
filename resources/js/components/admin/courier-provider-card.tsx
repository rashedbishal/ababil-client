import { router, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import courier from '@/routes/admin/courier';

export type ProviderField = {
    key: string;
    label: string;
    secret: boolean;
    value: string | null;
    configured: boolean;
    options: { value: string; label: string }[] | null;
};

export type Provider = {
    name: string;
    label: string;
    enabled: boolean;
    is_default: boolean;
    fields: ProviderField[];
    store: { id: number; name: string | null } | null;
};

export function CourierProviderCard({
    provider,
    canChangeDefault,
    children,
}: {
    provider: Provider;
    canChangeDefault: boolean;
    children?: React.ReactNode;
}) {
    const initial: Record<string, string> = {};
    provider.fields.forEach((field) => {
        initial[field.key] = field.value ?? '';
    });

    const form = useForm(initial);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(courier.update({ provider: provider.name }).url, {
            preserveScroll: true,
        });
    }

    function makeDefault() {
        router.put(
            courier.default().url,
            { provider: provider.name },
            { preserveScroll: true },
        );
    }

    function clearDefault() {
        router.put(
            courier.default().url,
            { provider: null },
            { preserveScroll: true },
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{provider.label}</CardTitle>
                <div className="flex items-center gap-2">
                    {!provider.enabled && (
                        <Badge variant="outline">Disabled</Badge>
                    )}
                    {provider.is_default ? (
                        <>
                            <Badge>Default</Badge>
                            {canChangeDefault && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearDefault}
                                >
                                    Unset
                                </Button>
                            )}
                        </>
                    ) : (
                        provider.enabled &&
                        canChangeDefault && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={makeDefault}
                            >
                                Set as default
                            </Button>
                        )
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!provider.enabled && (
                    <p className="text-sm text-muted-foreground">
                        This provider is disabled. Set ENABLE_
                        {provider.name.toUpperCase()}=true in the environment to
                        configure and use it.
                    </p>
                )}
                <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                    {provider.fields.map((field) => (
                        <div key={field.key} className="grid gap-2">
                            <Label htmlFor={`${provider.name}-${field.key}`}>
                                {field.label}
                                {field.secret && field.configured && (
                                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                                        (set)
                                    </span>
                                )}
                            </Label>
                            {field.options ? (
                                <Select
                                    value={form.data[field.key] ?? ''}
                                    onValueChange={(value) =>
                                        form.setData(field.key, value)
                                    }
                                    disabled={!provider.enabled}
                                >
                                    <SelectTrigger
                                        id={`${provider.name}-${field.key}`}
                                        className="w-full"
                                    >
                                        <SelectValue>
                                            {
                                                field.options.find(
                                                    (option) =>
                                                        option.value ===
                                                        (form.data[field.key] ??
                                                            ''),
                                                )?.label
                                            }
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id={`${provider.name}-${field.key}`}
                                    type={field.secret ? 'password' : 'text'}
                                    value={form.data[field.key] ?? ''}
                                    onChange={(e) =>
                                        form.setData(field.key, e.target.value)
                                    }
                                    disabled={!provider.enabled}
                                    placeholder={
                                        field.secret
                                            ? field.configured
                                                ? '••••••••'
                                                : 'Not set'
                                            : undefined
                                    }
                                    autoComplete="off"
                                />
                            )}
                            <InputError message={form.errors[field.key]} />
                        </div>
                    ))}
                    <div className="sm:col-span-2">
                        <Button
                            type="submit"
                            disabled={form.processing || !provider.enabled}
                        >
                            Save credentials
                        </Button>
                    </div>
                </form>

                {children}
            </CardContent>
        </Card>
    );
}
