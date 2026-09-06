import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { pageUser } from "@/lib/server/session";
import { ListingWizard } from "./listing-wizard";
export const metadata: Metadata = {
  title: "List a Property — Eko Space",
  description: "Create a verified accommodation listing in Lagos with sectional room photos and floor measurements.",
};
export default async function NewListingPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  await pageUser(true);
  const { edit } = await searchParams;
  if (edit) redirect(`/listings/${encodeURIComponent(edit)}/edit`);
  return <ListingWizard />;
}
