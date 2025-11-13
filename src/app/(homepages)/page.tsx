"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, FC } from "react";

interface Article {
    id: number;
    title: string;
    category: string;
    status: "Publish" | "Draft";
    created_date: string;
    updated_at: string;
}

interface PaginationData {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

interface ApiResponse {
    status: string;
    message: string;
    data: Article[];
    pagination: PaginationData;
    timestamp: string;
    path: string;
}

const Page: FC = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [category, setCategory] = useState<string>("");

    const [debouncedCategory, setDebouncedCategory] = useState<string>("");

    useMemo(() => {
        const timer = setTimeout(() => {
            setDebouncedCategory(category);
        }, 300);

        return () => clearTimeout(timer);
    }, [category]);

    const {
        data: dataQuery,
        isLoading,
        isError,
        error,
    } = useQuery<ApiResponse, Error>({
        queryKey: ["article-list", page, limit, debouncedCategory],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", limit.toString());
            params.append("status", "Publish");
            if (debouncedCategory) params.append("search", debouncedCategory);

            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_BASE_URL
                }/article?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch articles: ${response.statusText}`
                );
            }

            return response.json();
        },
        enabled: !!process.env.NEXT_PUBLIC_API_BASE_URL,
        retry: 2,
        staleTime: 5 * 60 * 1000,
    });

    const articles: Article[] = dataQuery?.data || [];
    const pagination: PaginationData = dataQuery?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
    };

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
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

    return (
        <section className="w-full">
            <div className="bg-gray-900 min-h-[100vh] py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Header */}
                    <div className="mx-auto max-w-2xl lg:mx-0 mb-10">
                        <h2 className="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
                            Articles
                        </h2>
                        <p className="mt-2 text-gray-400">
                            Explore our latest articles and insights (
                            {pagination.total} total)
                        </p>
                    </div>

                    {/* Filter Section */}
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none mb-10 flex flex-col gap-4 sm:flex-row">
                        <input
                            type="text"
                            placeholder="Search by category..."
                            value={category}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setCategory(e.target.value);
                                setPage(1);
                            }}
                            className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-400 border border-gray-700 focus:border-gray-500 focus:outline-none"
                        />
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <div className="text-gray-400">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                                <p className="mt-4">Loading articles...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {isError && (
                        <div className="rounded-lg bg-red-900/20 border border-red-700 p-4 mb-6">
                            <p className="text-red-400">
                                Error loading articles:{" "}
                                {error?.message || "Unknown error"}
                            </p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="mt-4 bg-red-600 hover:bg-red-700"
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Articles Grid */}
                    {!isLoading && !isError && (
                        <>
                            {articles.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-400 text-lg">
                                        No articles found. Try adjusting your
                                        filters.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-700 pt-10 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                                    {articles.map((post: Article) => (
                                        <article
                                            key={post.id}
                                            className="flex max-w-xl flex-col items-start justify-between group hover:bg-gray-800/50 p-4 rounded-lg transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-x-4 text-xs">
                                                <time
                                                    dateTime={post.created_date}
                                                    className="text-gray-400"
                                                >
                                                    {formatDate(
                                                        post.created_date
                                                    )}
                                                </time>
                                                <span
                                                    className={`relative z-10 rounded-full px-3 py-1.5 font-medium ${getCategoryColor(
                                                        post.category
                                                    )} transition-colors`}
                                                >
                                                    {post.category}
                                                </span>
                                            </div>
                                            <div className="relative grow w-full">
                                                <h3 className="mt-3 text-lg/6 font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                    <Link
                                                        href={`/articles/${post.id}`}
                                                    >
                                                        <span className="absolute inset-0" />
                                                        {post.title}
                                                    </Link>
                                                </h3>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-700 w-full text-xs text-gray-500">
                                                Updated:{" "}
                                                {formatDate(post.updated_at)}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {articles.length > 0 && (
                                <div className="mt-10 flex justify-center items-center gap-4">
                                    <Button
                                        onClick={() =>
                                            setPage((p: number) =>
                                                Math.max(1, p - 1)
                                            )
                                        }
                                        disabled={
                                            !pagination.has_prev || isLoading
                                        }
                                        variant="outline"
                                    >
                                        ← Previous
                                    </Button>

                                    <div className="flex items-center gap-2 px-4 text-gray-400">
                                        <span>Page</span>
                                        <span className="font-semibold text-white">
                                            {pagination.page}
                                        </span>
                                        <span>of</span>
                                        <span className="font-semibold text-white">
                                            {pagination.total_pages}
                                        </span>
                                    </div>

                                    <Button
                                        onClick={() =>
                                            setPage((p: number) => p + 1)
                                        }
                                        disabled={
                                            !pagination.has_next || isLoading
                                        }
                                        variant="outline"
                                    >
                                        Next →
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Page;
