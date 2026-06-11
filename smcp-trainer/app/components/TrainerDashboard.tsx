"use client";

import { useMemo, useState } from "react";
import styles from "../page.module.css";
import { plannedCapabilities, ranks, scenarios } from "../data/training";

const initialRank = ranks[0];

export default function TrainerDashboard() {
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [submittedAnswers, setSubmittedAnswers] = useState<
    Record<string, string>
  >({});
  const [completedScenarioIds, setCompletedScenarioIds] = useState<string[]>(
    [],
  );

  const activeScenario =
    scenarios.find((scenario) => scenario.id === activeScenarioId) ??
    scenarios[0];

  const selectedAnswer = selectedAnswers[activeScenario.id] ?? "";
  const submittedAnswer = submittedAnswers[activeScenario.id] ?? "";
  const xp = useMemo(
    () =>
      scenarios
        .filter((scenario) => completedScenarioIds.includes(scenario.id))
        .reduce((total, scenario) => total + scenario.xpReward, 0),
    [completedScenarioIds],
  );

  const isSubmitted = submittedAnswer.length > 0;
  const isCorrect =
    submittedAnswer === activeScenario.question.correctOptionId && isSubmitted;

  const currentRank = useMemo(
    () =>
      ranks.reduce(
        (current, rank) => (xp >= rank.xpRequired ? rank : current),
        initialRank,
      ),
    [xp],
  );

  const nextRank = useMemo(
    () => ranks.find((rank) => rank.xpRequired > xp),
    [xp],
  );

  const progressPercent = useMemo(() => {
    if (!nextRank) {
      return 100;
    }

    const rankSpan = nextRank.xpRequired - currentRank.xpRequired;
    const earnedInRank = xp - currentRank.xpRequired;

    return Math.round((earnedInRank / rankSpan) * 100);
  }, [currentRank, nextRank, xp]);

  function handleSelectAnswer(optionId: string) {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [activeScenario.id]: optionId,
    }));
  }

  function handleSelectScenario(scenarioId: string) {
    setActiveScenarioId(scenarioId);
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
      <section className={styles.hero} aria-labelledby="page-title">
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Maritime English Simulator</p>
          <h1 id="page-title">SMCP Trainer</h1>
          <p className={styles.heroCopy}>
            Practice Standard Marine Communication Phrases through structured
            bridge-style role play, emergency scenarios, and rank progression.
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
            <span className={styles.panelLabel}>Current Rank</span>
            <strong>{currentRank.title}</strong>
          </div>
          <div>
            <span className={styles.panelLabel}>XP</span>
            <strong>{xp}</strong>
          </div>
          <div>
            <span className={styles.panelLabel}>Next Rank</span>
            <strong>{nextRank?.title ?? "Master Mariner"}</strong>
          </div>
          <div>
            <span className={styles.panelLabel}>Progress</span>
            <strong>{progressPercent}%</strong>
          </div>
        </aside>
      </section>

      <section className={styles.grid} id="training">
        <article className={styles.scenarioCard} id="scenarios">
          <div className={styles.scenarioSelector}>
            {scenarios.map((scenario, index) => {
              const isActive = scenario.id === activeScenario.id;
              const isComplete = completedScenarioIds.includes(scenario.id);

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
          <section className={styles.rankPanel} id="rank">
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Training Path</p>
              <h2>Rank progression</h2>
            </div>
            <ol className={styles.rankList}>
              {ranks.map((rank) => {
                const isCurrent = rank.title === currentRank.title;
                const isUnlocked = xp >= rank.xpRequired;

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

          <section className={styles.progressPanel} id="progress">
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Progress</p>
              <h2>Simulator dashboard</h2>
            </div>
            <div className={styles.progressStats}>
              <span>Current XP</span>
              <strong>{xp}</strong>
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
              Progress to next rank: <strong>{progressPercent}%</strong>. All
              users begin as <strong>{initialRank.title}</strong>.
            </p>
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
