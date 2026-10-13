import type { Metadata } from "next";
import Site from "@/projects/pic2plate/components/Site";

export const metadata: Metadata = {
  title: "Pic2Plate — Andreas Lim",
  description:
    "Pic2Plate turns a photo of your ingredients and a request into personalized recipes, using a vision-language model and retrieval-augmented generation. Sensors 2025, 25(2), 449.",
};

export default function Page() {
  return <Site />;
}
