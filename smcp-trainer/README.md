# SMCP Trainer

SMCP Trainer is a standalone Next.js + TypeScript prototype for maritime
English classes in a simulator style.

## First version

- Main screen with the title "SMCP Trainer"
- Professional maritime bridge-style visual theme
- Main actions: Start Training, Scenarios, My Rank, Progress
- Two main training routes:
  - Deck / Navigation Simulator
  - Marine Engineering Simulator
- Deck / Navigation scenarios: "Fire in the Engine Room", "Man Overboard",
  "Pilot Boarding", "Collision Avoidance", and "VHF Communication"
- Marine Engineering scenarios: "Auxiliary Generator Failure", "High
  Temperature Alarm", "Bilge Pump Failure", "Fuel Leak", and "Engine Room Fire"
- English situations, Captain/Officer/Engineer/Cadet role play, multiple-choice
  questions, submit action, Correct/Incorrect result, short feedback, and XP
  rewards
- Separate XP, current rank, next rank, and percentage progress for each route
- Deck / Navigation ranks from Cadet Recruit to Master Mariner
- Marine Engineering ranks from Cadet Recruit to Chief Engineer
- Every user starts as Cadet Recruit and all progress is local

## Future structure

The UI includes placeholders for later additions:

- Videos
- Audio
- Voice recognition
- AI feedback
- Firebase persistence

These features are intentionally not implemented in this first local version.

## Getting started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
