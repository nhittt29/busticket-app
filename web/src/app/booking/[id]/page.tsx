import { BookingPageContent } from "@/components/booking/BookingPageContent";

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
    // Parse ID from params
    const resolvedParams = await params;
    const scheduleId = parseInt(resolvedParams.id);

    return <BookingPageContent scheduleId={scheduleId} />;
}
