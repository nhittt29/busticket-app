import { Hero } from "@/components/home/Hero";
import { SearchWidget } from "@/components/home/SearchWidget";
import { PopularRoutes } from "@/components/home/PopularRoutes";
import { Offers } from "@/components/home/Offers";
import { Stats } from "@/components/home/Stats";

export default function Home() {
    return (
        <>
            <Hero />
            <SearchWidget />
            <PopularRoutes />
            <Offers />
            <Stats />
        </>
    );
}
