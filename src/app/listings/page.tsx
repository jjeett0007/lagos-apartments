import type { Metadata } from "next";
import { ListingsExplorer } from "./listings-explorer";

export const metadata: Metadata = {
  title: "Browse measured Lagos homes | Eko Space",
  description: "Search Lagos accommodation by location, price, lease term, and measured floor area.",
};

export default function ListingsPage() {
  return <ListingsExplorer />;
}
