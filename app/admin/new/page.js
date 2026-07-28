import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import ListingForm from "@/components/admin/ListingForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Add Listing" };

export default function NewListingPage() {
  if (!isAuthed(cookies())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-espresso-950">
        Add Listing
      </h1>
      <p className="mt-1 mb-8 text-sm text-espresso-600">
        Leave category blank to let the smart categorizer sort it for you.
      </p>
      <ListingForm />
    </div>
  );
}
