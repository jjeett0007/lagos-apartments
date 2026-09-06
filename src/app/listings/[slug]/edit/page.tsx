import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageUser } from "@/lib/server/session";
import { getDb } from "@/lib/server/db";
import { ListingWizard } from "../../new/listing-wizard";
import type { ListingDraft } from "@/lib/draft-types";

export const metadata: Metadata = {
  title: "Edit Property Listing — Eko Space",
  description: "Update property details, sectional apartment photos, and room calibrations.",
};
export default async function EditListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await pageUser(true);
  const { slug: id } = await params;
  const draft = await getDb().listing.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      listerId: user.id,
      status: { in: ["DRAFT", "REJECTED", "IN_REVIEW"] },
    },
    include: {
      rooms: { orderBy: { sortOrder: "asc" } },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!draft) notFound();
  return <ListingWizard initialDraft={JSON.parse(JSON.stringify(draft)) as ListingDraft} />;
}
