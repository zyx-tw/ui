import { BottomCorners, LegalLinks } from "@/registry/zyx/components/corners";
import { enterFooter } from "@/registry/zyx/lib/layout";

// Privacy and Terms, shared by every zyx.tw site at www.zyx.tw.
export function SiteFooter() {
  return <BottomCorners fade className={enterFooter} links={<LegalLinks />} />;
}
