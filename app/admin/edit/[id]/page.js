import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getListingById } from "@/lib/listings";
import ListingForm from "@/components/admin/ListingForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Listing" };

export default function EditListingPage({ params }) {
  if (!isAuthed(cookies())) redirect("/admin/login");

  const listing = getListingById(params.id);
  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-espresso-950">
        Edit Listing
      </h1>
      <p className="mt-1 mb-8 text-sm text-espresso-600">{listing.title}</p>
      <ListingForm listing={listing} />
    </div>
  );
}
