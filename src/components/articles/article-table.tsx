"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import axios from "axios";
import { toast } from "sonner";
import { Trash2, Eye, Pencil } from "lucide-react";

const data: Payment[] = [
    {
        id: "m5gr84i9",
        title: "success",
    },
    {
        id: "3u1reuv4",
        title: "success",
    },
    {
        id: "derv1ws0",
        title: "processing",
    },
    {
        id: "5kma53ae",
        title: "success",
    },
    {
        id: "bhqecj4p",
        title: "failed",
    },
];

export type Payment = {
    id: string;
    title: "pending" | "processing" | "success" | "failed";
};

export function ArticleTable() {
    const queryClient = useQueryClient();

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(10);
    const [category, setCategory] = React.useState("");
    const [debouncedCategory, setDebouncedCategory] = React.useState("");
    const [status, setStatus] = React.useState("");

    const debouncedSetCategory = React.useMemo(
        () =>
            debounce((value: string) => {
                setDebouncedCategory(value);
                setPage(1);
            }, 500),
        []
    );

    React.useEffect(() => {
        return () => {
            debouncedSetCategory.cancel();
        };
    }, [debouncedSetCategory]);

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        debouncedSetCategory(value);
    };

    const columns: ColumnDef<Payment>[] = [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("title")}</div>
            ),
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("category")}</div>
            ),
        },

        {
            id: "actions",
            header: "Actions",
            enableHiding: false,
            cell: ({ row }) => {
                const item = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <Link
                                    className="w-full flex justify-start items-center gap-2"
                                    href={`/dashboard/articles/${item?.id}/show`}
                                >
                                    <Eye className="w-5 h-5" />
                                    <span>View</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Link
                                    className="w-full flex justify-start items-center gap-2"
                                    href={`/dashboard/articles/${item?.id}/update`}
                                >
                                    <Pencil className="w-5 h-5" />
                                    <span>Edit</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer fles items-center justify-start gap-2"
                                onClick={() => handleDelete(item?.id)}
                            >
                                <Trash2 className="w-5 h-5" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const {
        data: dataQuery,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["article-list", page, limit, debouncedCategory, status],
        queryFn: () => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", limit.toString());
            if (debouncedCategory) params.append("search", debouncedCategory);
            if (status) params.append("status", status);

            return fetch(
                `${
                    process.env.NEXT_PUBLIC_API_BASE_URL
                }/article?${params.toString()}`
            ).then((response) => response.json());
        },
    });

    // Extract data dari response structure baru
    const data = dataQuery?.data || [];
    const pagination = dataQuery?.pagination || {
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
    };
    const total = pagination.total;

    const table = useReactTable({
        data,
        columns,
        manualPagination: true,
        pageCount: pagination.total_pages || Math.ceil(total / limit),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: {
                pageIndex: page - 1,
                pageSize: limit,
            },
        },
    });

    const handleDelete = async (id: number | string) => {
        try {
            let config = {
                url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/article/${id}`,
                method: "DELETE",
            };

            await axios(config);

            await queryClient.invalidateQueries({
                queryKey: ["article-list"],
            });

            toast.success("Successfully deleted article", {
                position: "top-right",
            });
        } catch (error) {
            let message: string = "Failed to delete article";
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

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-red-500">Error loading data</div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between gap-4 py-4">
                <div className="flex flex-1 items-center gap-4">
                    <div className="relative max-w-sm">
                        <Input
                            placeholder="Search articles..."
                            value={category}
                            onChange={(event) =>
                                handleCategoryChange(event.target.value)
                            }
                            className="border border-gray-400"
                        />
                        {category !== debouncedCategory && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                            </div>
                        )}
                    </div>

                    <select
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value);
                            setPage(1);
                        }}
                        className="h-10 rounded-md border border-gray-400 px-3"
                    >
                        <option value="">All Status</option>
                        <option value="Draft">Draft</option>
                        <option value="Publish">Publish</option>
                        <option value="Trash">Trash</option>
                    </select>
                </div>

                <div>
                    <Link href={`/dashboard/articles/create`}>
                        <Button className="cursor-pointer">Create</Button>
                    </Link>
                </div>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between py-4">
                <div className="text-muted-foreground text-sm">
                    Showing {data.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
                    {Math.min(page * limit, total)} of {total} entries
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1);
                        }}
                        className="h-9 rounded-md border border-gray-400 px-2"
                    >
                        <option value="3">3</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                    </select>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(1)}
                            disabled={!pagination.has_prev}
                        >
                            First
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={!pagination.has_prev}
                        >
                            Previous
                        </Button>

                        <span className="text-sm">
                            Page {page} of {pagination.total_pages || 1}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={!pagination.has_next}
                        >
                            Next
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(pagination.total_pages)}
                            disabled={!pagination.has_next}
                        >
                            Last
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
