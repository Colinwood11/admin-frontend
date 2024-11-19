import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ModelDDNSProfile } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { conv } from "@/lib/utils"
import { useState } from "react"
import { KeyedMutator } from "swr"
import { asOptionalField } from "@/lib/utils"
import { IconButton } from "@/components/xui/icon-button"
import { ddnsTypes, ddnsRequestTypes } from "@/types"
import { createDDNSProfile, updateDDNSProfile } from "@/api/ddns"
import { Textarea } from "./ui/textarea"

interface DDNSCardProps {
    data?: ModelDDNSProfile;
    providers: string[];
    mutate: KeyedMutator<ModelDDNSProfile[]>;
}

const ddnsFormSchema = z.object({
    max_retries: z.coerce.number().int().min(1),
    enable_ipv4: asOptionalField(z.boolean()),
    enable_ipv6: asOptionalField(z.boolean()),
    name: z.string().min(1),
    provider: z.string(),
    domains: z.array(z.string()),
    access_id: asOptionalField(z.string()),
    access_secret: asOptionalField(z.string()),
    webhook_url: asOptionalField(z.string().url()),
    webhook_method: asOptionalField(z.coerce.number().int().min(1).max(255)),
    webhook_request_type: asOptionalField(z.coerce.number().int().min(1).max(255).default(1)),
    webhook_request_body: asOptionalField(z.string()),
    webhook_headers: asOptionalField(z.string()),
});

export const DDNSCard: React.FC<DDNSCardProps> = ({ data, providers, mutate }) => {
    const form = useForm<z.infer<typeof ddnsFormSchema>>({
        resolver: zodResolver(ddnsFormSchema),
        defaultValues: data ? data : {
            max_retries: 3,
            name: "",
            provider: "dummy",
            domains: [],
        },
        resetOptions: {
            keepDefaultValues: false,
        }
    })

    const [open, setOpen] = useState(false);

    const onSubmit = async (values: z.infer<typeof ddnsFormSchema>) => {
        data?.id ? await updateDDNSProfile(data.id, values) : await createDDNSProfile(values);
        setOpen(false);
        await mutate();
        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {data
                    ?
                    <IconButton variant="outline" icon="edit" />
                    :
                    <IconButton icon="plus" />
                }
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <ScrollArea className="max-h-[calc(100dvh-5rem)] p-3">
                    <div className="items-center mx-1">
                        <DialogHeader>
                            <DialogTitle>New DDNS Profile</DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 my-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="My DDNS Profile"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="provider"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Provider</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={`${field.value}`}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select service type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {providers.map((v, i) => (
                                                        <SelectItem key={i} value={v}>{v}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="domains"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Domains (separate with comma)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="www.example.com"
                                                    {...field}
                                                    value={conv.arrToStr(field.value ?? [])}
                                                    onChange={e => {
                                                        const arr = conv.strToArr(e.target.value);
                                                        field.onChange(arr);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="access_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Credential 1</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Token ID"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="access_secret"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Credential 2</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Token Secret"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="max_retries"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maximum retry attempts</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="3"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="webhook_url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Webhook URL</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://ddns.example.com/?record=#record#"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="webhook_method"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Webhook Request Method</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={`${field.value}`}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Webhook Request Method" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(ddnsTypes).map(([k, v]) => (
                                                        <SelectItem key={k} value={k}>{v}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="webhook_request_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Webhook Request Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={`${field.value}`}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Webhook Request Type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(ddnsRequestTypes).map(([k, v]) => (
                                                        <SelectItem key={k} value={k}>{v}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="webhook_headers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Webhook Request Headers</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="resize-y"
                                                    placeholder='{"User-Agent":"Nezha-Agent"}'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="webhook_request_body"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Webhook Request Body</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="resize-y"
                                                    placeholder='{&#13;&#10; "ip": #ip#,&#13;&#10; "domain": "#domain#"&#13;&#10;}'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="enable_ipv4"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label className="text-sm">Enable IPv4</Label>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="enable_ipv6"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label className="text-sm">Enable IPv6</Label>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="justify-end">
                                    <DialogClose asChild>
                                        <Button type="button" className="my-2" variant="secondary">
                                            Close
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" className="my-2">Submit</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}