import { Form, Head } from '@inertiajs/react';
import SettingController from '@/actions/App/Http/Controllers/Admin/SettingController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import settings from '@/routes/admin/settings';

type Settings = {
    site_name: string | null;
    site_phone: string | null;
    site_email: string | null;
    currency: string | null;
    order_prefix: string | null;
    whatsapp_number: string | null;
    facebook_page_url: string | null;
    head_code: string | null;
    body_code: string | null;
};

const fields: {
    name: keyof Settings;
    label: string;
    type?: string;
}[] = [
    { name: 'site_name', label: 'Website name' },
    { name: 'site_phone', label: 'Phone' },
    { name: 'site_email', label: 'Email', type: 'email' },
    { name: 'currency', label: 'Currency (e.g. BDT)' },
    { name: 'order_prefix', label: 'Order number prefix' },
    { name: 'whatsapp_number', label: 'WhatsApp number (with country code)' },
    { name: 'facebook_page_url', label: 'Facebook Page URL' },
];

const codeFields: {
    name: keyof Settings;
    label: string;
    description: string;
}[] = [
    {
        name: 'head_code',
        label: 'Head code injection',
        description:
            "Pasted as-is right after <head>. Paste Google Tag Manager's first snippet, a Facebook Pixel snippet, Google Analytics' snippet, or any other vendor script here.",
    },
    {
        name: 'body_code',
        label: 'Body code injection',
        description:
            "Pasted as-is right after <body>. This is where Google Tag Manager's second (noscript) snippet goes.",
    },
];

export default function SettingsEdit({
    settings: values,
}: {
    settings: Settings;
}) {
    return (
        <>
            <Head title="Settings" />

            <Heading
                title="Settings"
                description="General site configuration."
            />

            <Form
                {...SettingController.update.form()}
                className="max-w-lg space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                        {fields.map((field) => (
                            <div key={field.name} className="grid gap-2">
                                <Label htmlFor={field.name}>
                                    {field.label}
                                </Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type ?? 'text'}
                                    defaultValue={values[field.name] ?? ''}
                                />
                                <InputError message={errors[field.name]} />
                            </div>
                        ))}

                        {codeFields.map((field) => (
                            <div key={field.name} className="grid gap-2">
                                <Label htmlFor={field.name}>
                                    {field.label}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {field.description}
                                </p>
                                <Textarea
                                    id={field.name}
                                    name={field.name}
                                    rows={6}
                                    className="font-mono text-xs"
                                    defaultValue={values[field.name] ?? ''}
                                />
                                <InputError message={errors[field.name]} />
                            </div>
                        ))}

                        <Button disabled={processing}>Save settings</Button>
                    </>
                )}
            </Form>
        </>
    );
}

SettingsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Settings', href: settings.edit() },
    ],
};
