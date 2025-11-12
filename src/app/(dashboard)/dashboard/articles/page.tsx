import { DataTable } from "@/components/data-table";
import { TableDashboard } from "@/components/generals/table";

import data from "@/components/data/data.json";

export default function Page() {
    return (
        <section className="w-full bg-white">
            <span>asd</span>
            <TableDashboard data={data} />
        </section>
    );
}
