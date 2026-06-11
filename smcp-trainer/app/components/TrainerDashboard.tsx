"use client";

import { useMemo, useState } from "react";
import styles from "../page.module.css";
import { plannedCapabilities, ranks, scenarios } from "../data/training";

const initialRank = ranks[0];
const firstScenario = scenarios[0];

export default function TrainerDashboard() {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [xp, setXp] = useState(0);

  const isSubmitted = submittedAnswer.length > 0;
  const isCorrect =
    submittedAnswer === firstScenario.question.correctOptionId && isSubmitted;

  const nextRank = useMemo(
    () => ranks.find((rank) => rank.xpRequired > xp),
    [xp],
  );

  function handleSubmit() {
    if (!selectedAnswer) {
      return;
    }

    setSubmittedAnswer(selectedAnswer);

    if (selectedAnswer === firstScenario.question.correctOptionId) {
      setXp(firstScenario.xpReward);
      return;
    }

    setXp(0);
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
            <strong>{initialRank.title}</strong>
          </div>
          <div>
            <span className={styles.panelLabel}>XP</span>
            <strong>{xp}</strong>
          </div>
          <div>
            <span className={styles.panelLabel}>Next Rank</span>
            <strong>{nextRank?.title ?? "Master Mariner"}</strong>
          </div>
        </aside>
      </section>

      <section className={styles.grid} id="training">
        <article className={styles.scenarioCard} id="scenarios">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Scenario 01</p>
            <h2>{firstScenario.title}</h2>
            <span>{firstScenario.category}</span>
          </div>

          <div className={styles.statusBar}>
            <span>Difficulty: {firstScenario.difficulty}</span>
            <span>Reward: {firstScenario.xpReward} XP</span>
          </div>

          <div className={styles.situationBlock}>
            <h3>Situation</h3>
            <p>{firstScenario.situation}</p>
          </div>

          <div className={styles.rolePlay}>
            <h3>Role play</h3>
            {firstScenario.rolePlay.map((line, index) => (
              <div
                className={`${styles.dialogueLine} ${
                  line.speaker === "Captain"
                    ? styles.captainLine
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
            <h3>{firstScenario.question.prompt}</h3>
            <div className={styles.answerList}>
              {firstScenario.question.options.map((option) => (
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
                    onChange={() => setSelectedAnswer(option.id)}
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
                    ? firstScenario.question.correctFeedback
                    : firstScenario.question.incorrectFeedback}
                </p>
              </div>
            ) : null}
          </div>
        </article>

        <aside className={styles.sideColumn}>
          <section className={styles.rankPanel} id="rank">
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>My Rank</p>
              <h2>Rank ladder</h2>
            </div>
            <ol className={styles.rankList}>
              {ranks.map((rank) => {
                const isCurrent = rank.title === initialRank.title;
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
              <h2>Basic XP</h2>
            </div>
            <div className={styles.xpMeter} aria-label={`${xp} XP earned`}>
              <span style={{ width: `${Math.min(xp, 100)}%` }} />
            </div>
            <p>
              All users begin as <strong>{initialRank.title}</strong>. Complete
              scenarios to earn XP and prepare for future rank advancement.
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
