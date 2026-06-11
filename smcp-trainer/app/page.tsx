import Link from "next/link";
import styles from "./page.module.css";
import { trainingRoutes } from "./data/training";

export default function Home() {
  const deckRoute = trainingRoutes.find((route) => route.id === "deck-navigation");
  const engineeringRoute = trainingRoutes.find(
    (route) => route.id === "marine-engineering",
  );

  return (
    <main className={styles.shell}>
      <section className={styles.homeHero} aria-labelledby="page-title">
        <div className={styles.homeHeader}>
          <p className={styles.eyebrow}>Maritime English Simulator</p>
          <h1 id="page-title">SMCP Trainer</h1>
          <p>
            Choose your simulator path and practice clear maritime English in
            focused local training modules.
          </p>
        </div>

        <div className={styles.homeRouteCards} aria-label="Training routes">
          {deckRoute ? (
            <Link className={styles.homeRouteCard} href="/deck">
              <span>{deckRoute.shortTitle}</span>
              <strong>{deckRoute.title}</strong>
              <p>{deckRoute.summary}</p>
            </Link>
          ) : null}

          {engineeringRoute ? (
            <Link className={styles.homeRouteCard} href="/engineering">
              <span>{engineeringRoute.shortTitle}</span>
              <strong>{engineeringRoute.title}</strong>
              <p>{engineeringRoute.summary}</p>
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
