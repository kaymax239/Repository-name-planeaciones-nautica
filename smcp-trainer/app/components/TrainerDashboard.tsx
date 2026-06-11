"use client";

import { useMemo, useState } from "react";
import styles from "../page.module.css";
import { plannedCapabilities, trainingRoutes } from "../data/training";
import type { Rank, TrainingRoute } from "../data/training";

type RouteId = TrainingRoute["id"];
type AnswersByScenario = Record<string, string>;
type CompletedScenariosByRoute = Record<RouteId, string[]>;

const initialRoute = trainingRoutes[0];

function getInitialCompletedScenarios(): CompletedScenariosByRoute {
  return trainingRoutes.reduce((routes, route) => {
    routes[route.id] = [];
    return routes;
  }, {} as CompletedScenariosByRoute);
}

function getRouteXp(route: TrainingRoute, completedScenarioIds: string[]) {
  return route.scenarios
    .filter((scenario) => completedScenarioIds.includes(scenario.id))
    .reduce((total, scenario) => total + scenario.xpReward, 0);
}

function getCurrentRank(ranks: Rank[], xp: number) {
  return ranks.reduce(
    (current, rank) => (xp >= rank.xpRequired ? rank : current),
    ranks[0],
  );
}

function getNextRank(ranks: Rank[], xp: number) {
  return ranks.find((rank) => rank.xpRequired > xp);
}

function getProgressPercent(
  currentRank: Rank,
  nextRank: Rank | undefined,
  xp: number,
) {
  if (!nextRank) {
    return 100;
  }

  const rankSpan = nextRank.xpRequired - currentRank.xpRequired;
  const earnedInRank = xp - currentRank.xpRequired;

  return Math.round((earnedInRank / rankSpan) * 100);
}

export default function TrainerDashboard() {
  const [activeRouteId, setActiveRouteId] = useState<RouteId>(initialRoute.id);
  const [activeScenarioIds, setActiveScenarioIds] = useState<
    Record<RouteId, string>
  >({
    "deck-navigation": trainingRoutes[0].scenarios[0].id,
    "marine-engineering": trainingRoutes[1].scenarios[0].id,
  });
  const [selectedAnswers, setSelectedAnswers] = useState<AnswersByScenario>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<AnswersByScenario>(
    {},
  );
  const [completedScenarioIds, setCompletedScenarioIds] =
    useState<CompletedScenariosByRoute>(getInitialCompletedScenarios);

  const activeRoute =
    trainingRoutes.find((route) => route.id === activeRouteId) ?? initialRoute;

  const activeScenarioId =
    activeScenarioIds[activeRoute.id] ?? activeRoute.scenarios[0].id;
  const activeScenario =
    activeRoute.scenarios.find((scenario) => scenario.id === activeScenarioId) ??
    activeRoute.scenarios[0];

  const activeCompletedScenarioIds = completedScenarioIds[activeRoute.id] ?? [];
  const selectedAnswer = selectedAnswers[activeScenario.id] ?? "";
  const submittedAnswer = submittedAnswers[activeScenario.id] ?? "";
  const routeXp = getRouteXp(activeRoute, activeCompletedScenarioIds);
  const currentRank = getCurrentRank(activeRoute.ranks, routeXp);
  const nextRank = getNextRank(activeRoute.ranks, routeXp);
  const progressPercent = getProgressPercent(currentRank, nextRank, routeXp);

  const routeStats = useMemo(
    () =>
      trainingRoutes.map((route) => {
        const completedIds = completedScenarioIds[route.id] ?? [];
        const xp = getRouteXp(route, completedIds);
        const current = getCurrentRank(route.ranks, xp);
        const next = getNextRank(route.ranks, xp);

        return {
          route,
          completedCount: completedIds.length,
          xp,
          currentRank: current,
          nextRank: next,
          progressPercent: getProgressPercent(current, next, xp),
        };
      }),
    [completedScenarioIds],
  );

  const isSubmitted = submittedAnswer.length > 0;
  const isCorrect =
    submittedAnswer === activeScenario.question.correctOptionId && isSubmitted;

  function handleSelectRoute(routeId: RouteId) {
    setActiveRouteId(routeId);
  }

  function handleSelectScenario(scenarioId: string) {
    setActiveScenarioIds((currentScenarioIds) => ({
      ...currentScenarioIds,
      [activeRoute.id]: scenarioId,
    }));
  }

  function handleSelectAnswer(optionId: string) {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [activeScenario.id]: optionId,
    }));
  }

  function handleSubmit() {
    if (!selectedAnswer) {
      return;
    }

    setSubmittedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [activeScenario.id]: selectedAnswer,
    }));

    if (
      selectedAnswer === activeScenario.question.correctOptionId &&
      !activeCompletedScenarioIds.includes(activeScenario.id)
    ) {
      setCompletedScenarioIds((currentCompletedIds) => ({
        ...currentCompletedIds,
        [activeRoute.id]: [
          ...(currentCompletedIds[activeRoute.id] ?? []),
          activeScenario.id,
        ],
      }));
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.hero} aria-labelledby="page-title">
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Maritime English Simulator</p>
          <h1 id="page-title">SMCP Trainer</h1>

          <div className={styles.routeCards} aria-label="Training routes">
            {routeStats.map((stats) => {
              const isActive = stats.route.id === activeRoute.id;

              return (
                <button
                  className={`${styles.routeCard} ${
                    isActive ? styles.activeRouteCard : ""
                  }`}
                  key={stats.route.id}
                  onClick={() => handleSelectRoute(stats.route.id)}
                  type="button"
                >
                  <span>{stats.route.shortTitle}</span>
                  <strong>{stats.route.title}</strong>
                  <p>{stats.route.summary}</p>
                  <small>
                    {stats.completedCount}/{stats.route.scenarios.length}{" "}
                    scenarios completed
                  </small>
                </button>
              );
            })}
          </div>

          <p className={styles.heroCopy}>
            Practice Standard Marine Communication Phrases through route-based
            deck and engineering simulations with separate local progress.
          </p>

          <div className={styles.primaryActions} aria-label="Main actions">
            <a href="#training" className={styles.actionButton}>
              Start Training
            </a>
            <a href="#scenarios" className={styles.actionButtonSecondary}>
              Scenarios
            </a>
            <a href="#rank" className={styles.actionButtonSecondary}>
              My Rank
            </a>
            <a href="#progress" className={styles.actionButtonSecondary}>
              Progress
            </a>
          </div>
        </div>

        <aside className={styles.commandPanel} aria-label="Current profile">
          <div>
            <span className={styles.panelLabel}>Active Route</span>
            <strong>{activeRoute.shortTitle}</strong>
          </div>
          <div>
            <span className={styles.panelLabel}>Current Rank</span>
            <strong>{currentRank.title}</strong>
          </div>
          <div>
            <span className={styles.panelLabel}>Route XP</span>
            <strong>{routeXp}</strong>
          </div>
          <div>
            <span className={styles.panelLabel}>Next Rank</span>
            <strong>{nextRank?.title ?? currentRank.title}</strong>
          </div>
          <div>
            <span className={styles.panelLabel}>Progress</span>
            <strong>{progressPercent}%</strong>
          </div>
        </aside>
      </section>

      <section className={styles.grid} id="training">
        <article className={styles.scenarioCard} id="scenarios">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Active training route</p>
            <h2>{activeRoute.title}</h2>
            <span>{activeRoute.scenarios.length} local scenarios</span>
          </div>

          <div className={styles.scenarioSelector}>
            {activeRoute.scenarios.map((scenario, index) => {
              const isActive = scenario.id === activeScenario.id;
              const isComplete = activeCompletedScenarioIds.includes(
                scenario.id,
              );

              return (
                <button
                  className={`${styles.scenarioTab} ${
                    isActive ? styles.activeScenarioTab : ""
                  }`}
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario.id)}
                  type="button"
                >
                  <span>Scenario {String(index + 1).padStart(2, "0")}</span>
                  <strong>{scenario.title}</strong>
                  <small>
                    {scenario.xpReward} XP
                    {isComplete ? " earned" : " available"}
                  </small>
                </button>
              );
            })}
          </div>

          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Active simulator scenario</p>
            <h2>{activeScenario.title}</h2>
            <span>{activeScenario.category}</span>
          </div>

          <div className={styles.statusBar}>
            <span>Difficulty: {activeScenario.difficulty}</span>
            <span>Reward: {activeScenario.xpReward} XP</span>
            <span>
              Status:{" "}
              {activeCompletedScenarioIds.includes(activeScenario.id)
                ? "Completed"
                : "Ready"}
            </span>
          </div>

          <div className={styles.situationBlock}>
            <h3>Situation</h3>
            <p>{activeScenario.situation}</p>
          </div>

          <div className={styles.rolePlay}>
            <h3>Role play</h3>
            {activeScenario.rolePlay.map((line, index) => (
              <div
                className={`${styles.dialogueLine} ${
                  line.speaker === "Captain"
                    ? styles.captainLine
                    : line.speaker === "Officer"
                      ? styles.officerLine
                      : line.speaker === "Engineer"
                        ? styles.engineerLine
                        : styles.cadetLine
                }`}
                key={`${line.speaker}-${index}`}
              >
                <span>{line.speaker}</span>
                <p>{line.line}</p>
              </div>
            ))}
          </div>

          <div className={styles.quiz}>
            <h3>{activeScenario.question.prompt}</h3>
            <div className={styles.answerList}>
              {activeScenario.question.options.map((option) => (
                <label
                  className={`${styles.answerOption} ${
                    selectedAnswer === option.id ? styles.selectedOption : ""
                  }`}
                  key={option.id}
                >
                  <input
                    type="radio"
                    name="scenario-answer"
                    value={option.id}
                    checked={selectedAnswer === option.id}
                    onChange={() => handleSelectAnswer(option.id)}
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>

            <button
              className={styles.submitButton}
              type="button"
              onClick={handleSubmit}
              disabled={!selectedAnswer}
            >
              Submit Answer
            </button>

            {isSubmitted ? (
              <div
                className={`${styles.resultBox} ${
                  isCorrect ? styles.correctResult : styles.incorrectResult
                }`}
                role="status"
              >
                <strong>{isCorrect ? "Correct" : "Incorrect"}</strong>
                <p>
                  {isCorrect
                    ? activeScenario.question.correctFeedback
                    : activeScenario.question.incorrectFeedback}
                </p>
              </div>
            ) : null}
          </div>
        </article>

        <aside className={styles.sideColumn}>
          <section className={styles.progressPanel} id="progress">
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Progress</p>
              <h2>{activeRoute.shortTitle}</h2>
            </div>
            <div className={styles.progressStats}>
              <span>Current XP</span>
              <strong>{routeXp}</strong>
            </div>
            <div className={styles.progressStats}>
              <span>Current Rank</span>
              <strong>{currentRank.title}</strong>
            </div>
            <div className={styles.progressStats}>
              <span>Next Rank</span>
              <strong>{nextRank?.title ?? "Complete"}</strong>
            </div>
            <div
              className={styles.xpMeter}
              aria-label={`${progressPercent}% progress to next rank`}
            >
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <p>
              Progress to next rank: <strong>{progressPercent}%</strong>. This
              XP belongs only to the <strong>{activeRoute.shortTitle}</strong>{" "}
              route.
            </p>
          </section>

          <section className={styles.rankPanel} id="rank">
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Training Path</p>
              <h2>Rank progression</h2>
            </div>
            <ol className={styles.rankList}>
              {activeRoute.ranks.map((rank) => {
                const isCurrent = rank.title === currentRank.title;
                const isUnlocked = routeXp >= rank.xpRequired;

                return (
                  <li
                    className={`${styles.rankItem} ${
                      isCurrent ? styles.currentRank : ""
                    } ${isUnlocked ? styles.unlockedRank : ""}`}
                    key={rank.title}
                  >
                    <span>{rank.title}</span>
                    <small>{rank.xpRequired} XP</small>
                    <p>{rank.description}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className={styles.futurePanel}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Planned structure</p>
              <h2>Coming later</h2>
            </div>
            <ul>
              {plannedCapabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
