import ResponsiveNav from "./ResponsiveNav";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <ResponsiveNav>{children}</ResponsiveNav>;
}
