"use client";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

// - `Publish` - Published article
// - `Draft` - Draft article
// - `Thrash` - Trashed article

const formSchema = z.object({
    title: z.string().min(2, {
        message: "title harus minimal 2 karakter.",
    }),
    content: z.string().min(10, {
        message: "title harus minimal 10 karakter.",
    }),
    category: z.string().min(1, {
        message: "category harus minimal 1 karakter",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
            category: "",
        },
    });

    const onSubmitPublish = async (data: FormValues) => {
        console.log("Publishing:", data);
        try {
            let config = {
                url: `http://localhost:8855/api/v1/article`,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({
                    title: data.title,
                    content: data.content,
                    category: data.category,
                    status: "Publish",
                }),
            };

            let response = await axios(config);
            console.log(response);

            setTimeout(() => {
                router.push("/dashboard/articles");
            }, 500);

            toast.success("Successfull to create article", {
                position: "top-right",
            });
        } catch (error) {
            let message: string = "Failed to create article";
            if (axios.isAxiosError(error)) {
                console.log(error.response?.data?.message);
                message = error.response?.data?.message;
            } else if (error instanceof Error) {
                message = error.message;
            } else {
                console.log(String(error));
            }

            toast.error(message, {
                position: "top-right",
            });
        }
    };

    const onSubmitDraft = async (data: FormValues) => {
        console.log("Saving as draft:", data);
        try {
            let config = {
                url: `http://localhost:8855/api/v1/article`,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({
                    title: data.title,
                    content: data.content,
                    category: data.category,
                    status: "Draft",
                }),
            };

            let response = await axios(config);
            console.log(response);

            setTimeout(() => {
                router.push("/dashboard/articles");
            }, 500);

            toast.success("Successfull to create article", {
                position: "top-right",
            });
        } catch (error) {
            let message: string = "Failed to create article";
            if (axios.isAxiosError(error)) {
                console.log(error.response?.data?.message);
                message = error.response?.data?.message;
            } else if (error instanceof Error) {
                message = error.message;
            } else {
                console.log(String(error));
            }

            toast.error(message, {
                position: "top-right",
            });
        }
    };

    return (
        <section className="flex flex-col gap-4">
            <Form {...form}>
                <form className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input
                                        className="border border-gray-400"
                                        placeholder="article a"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Content</FormLabel>
                                <FormControl>
                                    <Input
                                        className="border border-gray-400"
                                        placeholder="lorem ipsum sit dolor amet"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <Input
                                        className="border border-gray-400"
                                        placeholder="cerita"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
            <div className="w-full flex gap-4">
                <Button onClick={form.handleSubmit(onSubmitPublish)}>
                    Publish
                </Button>
                <Button
                    variant="outline"
                    onClick={form.handleSubmit(onSubmitDraft)}
                >
                    Draft
                </Button>
            </div>
        </section>
    );
}
