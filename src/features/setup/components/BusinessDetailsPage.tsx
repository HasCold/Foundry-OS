
import { Building2, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const businessInfo = [
    { label: 'Legal Business Name', value: 'FoundryOS Manufacturing (Demo)' },
    { label: 'Business Type', value: 'Private Limited Company (Demo)' },
    { label: 'Registration Number', value: 'DEMO-REG-001' },
    { label: 'Tax Identification Number', value: 'DEMO-TAX-001' },
    { label: 'Business Email', value: 'info@example.com' },
    { label: 'Contact Number', value: '+92 300 0000000' },
    { label: 'Website', value: 'https://example.com' },
]

const addressInfo = [
    { label: 'Address Line', value: '123 Industrial Area (Demo)' },
    { label: 'City', value: 'Lahore' },
    { label: 'State / Province', value: 'Punjab' },
    { label: 'Country', value: 'Pakistan' },
    { label: 'Postal Code', value: '54000' },
]

function DetailFields({ fields }: {
    fields: { label: string; value: string }[]
}) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {fields.map((field) => (
                <div key={field.label} className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        {field.label}
                    </label>
                    <Input value={field.value} readOnly />
                </div>
            ))}
        </div>
    )
}

export function BusinessDetailsPage() {
    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                title="Business Details"
                description="View your organization's business, registration and contact details."
                actions={<Badge variant="secondary">Demo Data</Badge>}
            />

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Business Information</CardTitle>
                            <CardDescription className="mt-1">
                                Company registration and contact information.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <DetailFields fields={businessInfo} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Business Address</CardTitle>
                            <CardDescription className="mt-1">
                                Registered business location and mailing address.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <DetailFields fields={addressInfo} />
                    <p className="mt-5 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                        All information on this page is fictional sample data for UI development.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
