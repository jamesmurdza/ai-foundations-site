import { redirect } from "@portal/lib/nav";

// Profile editing moved into the multi-section Settings area. Keep this route as
// a redirect so old links/bookmarks (and #readme deep-links) still land somewhere
// sensible.
export default function ProfileEditRedirect() {
  redirect("/settings/profile");
}
