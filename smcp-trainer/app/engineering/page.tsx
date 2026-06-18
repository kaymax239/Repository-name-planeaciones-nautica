import type { Metadata } from "next";
import RouteTrainer from "../components/RouteTrainer";

export const metadata: Metadata = {
  title: "Marine Engineering Simulator | SMCP Trainer",
  description: "Marine engineering maritime English simulator scenarios.",
};

export default function EngineeringPage() {
  return <RouteTrainer routeId="marine-engineering" />;
}
