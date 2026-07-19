import { isAdminAuthenticated } from "@/lib/admin";
import { destinyGuidesArePublic } from "@/lib/destiny-guide-visibility";

export async function canViewDestinyGuides() {
  return destinyGuidesArePublic() || (await isAdminAuthenticated());
}
