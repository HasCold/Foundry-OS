
import { Info } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const basicInfo = [
    { label: 'Company Name', value: 'FoundryOS Manufacturing' },
    { label: 'Company Code', value: 'FOS-001' },
    { label: 'Industry', value: 'Manufacturing' },
    { label: 'Fiscal Year', value: 'January – December 2026' },
    { label: 'Base Currency', value: 'USD - US Dollar' },
    { label: 'System Language', value: 'English' },
    { label: 'Date Format', value: 'DD/MM/YYYY' },
    { label: 'Time Zone', value: 'Asia/Karachi (PKT)' },
]

export function BasicInfoPage() {
    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                title="Basic Info"
                description="Manage the basic configuration and general information of your organization."
                actions={<Badge variant="secondary">Demo Data</Badge>}
            />

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Info className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Organization Information</CardTitle>
                            <CardDescription className="mt-1">
                                General company settings and preferences.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {basicInfo.map((field) => (
                            <div key={field.label} className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    {field.label}
                                </label>
                                <Input value={field.value} readOnly />
                            </div>
                        ))}
                    </div>

                    <p className="mt-5 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                        These are sample values for the UI demo. No real company information is stored.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
