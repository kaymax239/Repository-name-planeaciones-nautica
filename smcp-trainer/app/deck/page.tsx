import type { Metadata } from "next";
import RouteTrainer from "../components/RouteTrainer";

export const metadata: Metadata = {
  title: "Deck / Navigation Simulator | SMCP Trainer",
  description: "Deck and navigation maritime English simulator scenarios.",
};

export default function DeckPage() {
  return <RouteTrainer routeId="deck-navigation" />;
}
