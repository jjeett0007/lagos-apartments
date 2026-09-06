import type { Metadata, Viewport } from "next";
import { Agentation } from "agentation";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eko Space — Remote room-size checks",
  description:
    "Capture, inspect, and compare room-size estimates for Lagos accommodation listings.",
};

export const viewport: Viewport = {
  themeColor: "#FFF8EC",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
