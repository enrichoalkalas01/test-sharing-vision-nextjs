import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <section className="w-full h-[100vh] flex items-center justify-center">
            <div className="w-auto h-auto">
                <Link href={"/dashboard/articles"}>
                    <Button className="cursor-pointer">
                        Go To Article Dashboard
                    </Button>
                </Link>
            </div>
        </section>
    );
}
