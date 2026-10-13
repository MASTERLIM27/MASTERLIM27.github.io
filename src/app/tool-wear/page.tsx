import type { Metadata } from "next";
import Site from "@/projects/tool-wear/components/Site";

export const metadata: Metadata = {
  title: "MCT Tool Wear Prediction — Andreas Lim",
  description:
    "An AI system that reads an MCT machine's signals over OPC UA and AAS, scores tool health with a small neural network and raises an alarm before a worn tool causes defects. IJIBC 2026, 18(1), 361–369.",
};

export default function Page() {
  return <Site />;
}
