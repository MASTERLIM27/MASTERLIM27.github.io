import type { Metadata } from "next";
import Site from "@/projects/korean/components/Site";

export const metadata: Metadata = {
  title: "Korean Shadowing App — Andreas Lim",
  description:
    "An AI web app that turns any YouTube video into Korean speaking practice: pick a person, take over their lines and get a 100-point voice similarity score. IJIBC 2025, 17(4), 311–320.",
};

export default function Page() {
  return <Site />;
}
