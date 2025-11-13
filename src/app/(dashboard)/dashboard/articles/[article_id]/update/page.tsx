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
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

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
    status: z.enum(["Publish", "Draft", "Trash"], {
        message: "Status harus dipilih.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
    const params = useParams();
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
            category: "",
            status: "Draft",
        },
    });

    const { data } = useQuery({
        queryKey: ["article-detail"],
        queryFn: () =>
            fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/article/${params.article_id}`
            ).then((response) => response.json()),
    });

    useEffect(() => {
        if (data?.data) {
            console.log(data?.data);
            form.setValue("title", data?.data?.title);
            form.setValue("category", data?.data?.category);
            form.setValue("content", data?.data?.content);
            form.setValue("status", data?.data?.status);
        }
    }, [data?.data, form]);

    const onSubmitPublish = async (data: FormValues) => {
        console.log("Publishing:", data);
        try {
            let config = {
                url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/article/${params.article_id}`,
                method: "PUT",
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
                router.push(`/dashboard/articles/${params.article_id}/show`);
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
                url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/article/${params.article_id}`,
                method: "PUT",
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
                router.push(`/dashboard/articles/${params.article_id}/show`);
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
            <div className="w-full flex items-center gap-4">
                <h1 className="text-3xl font-bold">Article</h1>
                <span className="text-3xl">- {params.article_id} | </span>
                <Badge className="text-md px-8">{form.watch("status")}</Badge>
            </div>
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
                <Button
                    variant={"outline"}
                    className="cursor-pointer"
                    onClick={() => router.back()}
                >
                    <span>Back</span>
                </Button>
            </div>
        </section>
    );
}
