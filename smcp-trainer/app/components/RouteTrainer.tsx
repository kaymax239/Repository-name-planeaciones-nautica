"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../page.module.css";
import { trainingRoutes } from "../data/training";
import type { Rank, TrainingRoute } from "../data/training";

type RouteId = TrainingRoute["id"];
type AnswersByScenario = Record<string, string>;

const studentProfile = {
  name: "Cadet Student",
  enrollment: "SMCP-0001",
};

function getRoute(routeId: RouteId) {
  return trainingRoutes.find((route) => route.id === routeId) ?? trainingRoutes[0];
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

export default function RouteTrainer({ routeId }: { routeId: RouteId }) {
  const activeRoute = getRoute(routeId);
  const [activeScenarioId, setActiveScenarioId] = useState(
    activeRoute.scenarios[0].id,
  );
  const [selectedAnswers, setSelectedAnswers] = useState<AnswersByScenario>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<AnswersByScenario>(
    {},
  );
  const [completedScenarioIds, setCompletedScenarioIds] = useState<string[]>([]);

  const activeScenario =
    activeRoute.scenarios.find((scenario) => scenario.id === activeScenarioId) ??
    activeRoute.scenarios[0];
  const selectedAnswer = selectedAnswers[activeScenario.id] ?? "";
  const submittedAnswer = submittedAnswers[activeScenario.id] ?? "";
  const routeXp = getRouteXp(activeRoute, completedScenarioIds);
  const currentRank = getCurrentRank(activeRoute.ranks, routeXp);
  const nextRank = getNextRank(activeRoute.ranks, routeXp);
  const progressPercent = getProgressPercent(currentRank, nextRank, routeXp);
  const isSubmitted = submittedAnswer.length > 0;
  const isCorrect =
    submittedAnswer === activeScenario.question.correctOptionId && isSubmitted;

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
      !completedScenarioIds.includes(activeScenario.id)
    ) {
      setCompletedScenarioIds((currentIds) => [
        ...currentIds,
        activeScenario.id,
      ]);
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.routeHeader} aria-labelledby="route-title">
        <div>
          <p className={styles.eyebrow}>SMCP Trainer</p>
          <h1 id="route-title">{activeRoute.title}</h1>
          <p>{activeRoute.summary}</p>
        </div>

        <Link className={styles.backButton} href="/">
          Back to Home
        </Link>
      </section>

      <section className={styles.studentOverview} aria-label="Student progress">
        <div className={styles.profileCard}>
          <span>Nombre del alumno</span>
          <strong>{studentProfile.name}</strong>
        </div>
        <div className={styles.profileCard}>
          <span>Matricula</span>
          <strong>{studentProfile.enrollment}</strong>
        </div>
        <div className={styles.profileCard}>
          <span>Rango actual</span>
          <strong>{currentRank.title}</strong>
        </div>
        <div className={styles.profileCard}>
          <span>XP</span>
          <strong>{routeXp}</strong>
        </div>
      </section>

      <section className={styles.grid} id="training">
        <article className={styles.scenarioCard} id="scenarios">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Scenarios</p>
            <h2>{activeRoute.shortTitle}</h2>
            <span>{activeRoute.scenarios.length} local scenarios</span>
          </div>

          <div className={styles.scenarioSelector}>
            {activeRoute.scenarios.map((scenario, index) => {
              const isActive = scenario.id === activeScenario.id;
              const isComplete = completedScenarioIds.includes(scenario.id);

              return (
                <button
                  className={`${styles.scenarioTab} ${
                    isActive ? styles.activeScenarioTab : ""
                  }`}
                  key={scenario.id}
                  onClick={() => setActiveScenarioId(scenario.id)}
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
              {completedScenarioIds.includes(activeScenario.id)
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
              Progress to next rank: <strong>{progressPercent}%</strong>.
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
        </aside>
      </section>
    </main>
  );
}
