"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FC } from "react";

// Type definitions
interface ArticleDetail {
    id: number;
    title: string;
    content: string;
    category: string;
    status: "Publish" | "Draft";
    created_date: string;
    updated_at: string;
}

interface ApiResponse {
    status: string;
    message: string;
    data: ArticleDetail;
    timestamp: string;
    path: string;
}

const ArticleDetailPage: FC = () => {
    const params = useParams();
    const router = useRouter();
    const id = params.article_id as string;

    const {
        data: dataQuery,
        isLoading,
        isError,
        error,
    } = useQuery<ApiResponse, Error>({
        queryKey: ["article-detail", id],
        queryFn: async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/article/${id}`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Article not found");
                }
                throw new Error(
                    `Failed to fetch article: ${response.statusText}`
                );
            }

            return response.json();
        },
        enabled: !!process.env.NEXT_PUBLIC_API_BASE_URL && !!id,
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    console.log(dataQuery);

    const article: ArticleDetail | null = dataQuery?.data || null;

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Unknown date";
        }
    };

    const getCategoryColor = (category: string): string => {
        const colors: Record<string, string> = {
            Technology: "bg-blue-900/60 text-blue-200",
            Business: "bg-purple-900/60 text-purple-200",
            Marketing: "bg-pink-900/60 text-pink-200",
            Sales: "bg-green-900/60 text-green-200",
        };
        return colors[category] || "bg-gray-800/60 text-gray-300";
    };

    const parseContent = (content: string): string[] => {
        // Split content by newlines or double spaces for better formatting
        return content.split("\n").filter((line) => line.trim().length > 0);
    };

    if (isLoading) {
        return (
            <section className="w-full bg-gray-900 min-h-[100vh] py-24 sm:py-32">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="text-gray-400">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                            <p className="mt-4">Loading article...</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="w-full bg-gray-900 min-h-[100vh] py-24 sm:py-32">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <div className="rounded-lg bg-red-900/20 border border-red-700 p-6">
                        <h2 className="text-2xl font-bold text-red-400 mb-2">
                            Error
                        </h2>
                        <p className="text-red-300 mb-6">
                            {error?.message ||
                                "Failed to load the article. Please try again."}
                        </p>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Retry
                            </Button>
                            <Link href="/">
                                <Button variant="outline">
                                    Back to Articles
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!article) {
        return (
            <section className="w-full bg-gray-900 min-h-[100vh] py-24 sm:py-32">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Article Not Found
                        </h2>
                        <p className="text-gray-400 mb-8">
                            The article you are looking for does not exist.
                        </p>
                        <Link href="/">
                            <Button>Back to Articles</Button>
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-gray-900 min-h-[100vh] py-24 sm:py-32">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
                {/* Back Button */}
                <Link href="/" className="mb-8 inline-block">
                    <Button variant="outline" className="cursor-pointer">
                        ← Back to Articles
                    </Button>
                </Link>

                {/* Article Container */}
                <article className="bg-gray-800/50 rounded-lg border border-gray-700 p-8 sm:p-12">
                    {/* Header Section */}
                    <div className="mb-8 pb-8 border-b border-gray-700">
                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                            {article.title}
                        </h1>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            {/* Category */}
                            <span
                                className={`rounded-full px-4 py-1.5 font-medium ${getCategoryColor(
                                    article.category
                                )} transition-colors`}
                            >
                                {article.category}
                            </span>

                            {/* Created Date */}
                            <div className="flex items-center gap-2 text-gray-400">
                                <span className="text-gray-500">•</span>
                                <span>
                                    Published:{" "}
                                    {formatDate(article.created_date)}
                                </span>
                            </div>

                            {/* Updated Date */}
                            <div className="flex items-center gap-2 text-gray-400">
                                <span className="text-gray-500">•</span>
                                <span>
                                    Updated: {formatDate(article.updated_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Article Content */}
                    <div className="mb-8 prose prose-invert max-w-none">
                        <div className="space-y-6">
                            {parseContent(article.content).map(
                                (paragraph, index) => (
                                    <p
                                        key={index}
                                        className="text-gray-300 leading-relaxed text-lg"
                                    >
                                        {paragraph}
                                    </p>
                                )
                            )}
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="pt-8 border-t border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            {/* Status Badge */}
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400">Status:</span>
                                <span
                                    className={`px-4 py-2 rounded-full font-medium ${
                                        article.status === "Publish"
                                            ? "bg-green-900/60 text-green-200"
                                            : "bg-yellow-900/60 text-yellow-200"
                                    }`}
                                >
                                    {article.status}
                                </span>
                            </div>

                            {/* Article ID */}
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>Article ID: #{article.id}</span>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Navigation Section */}
                <div className="mt-12 flex justify-center">
                    <Link href="/">
                        <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Back to All Articles
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ArticleDetailPage;
