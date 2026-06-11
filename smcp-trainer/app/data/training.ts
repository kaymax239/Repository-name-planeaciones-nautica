export type Rank = {
  title: string;
  xpRequired: number;
  description: string;
};

export type RolePlayLine = {
  speaker: "Captain" | "Cadet";
  line: string;
};

export type ScenarioQuestion = {
  prompt: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  correctFeedback: string;
  incorrectFeedback: string;
};

export type Scenario = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  xpReward: number;
  situation: string;
  rolePlay: RolePlayLine[];
  question: ScenarioQuestion;
};

export const ranks: Rank[] = [
  {
    title: "Cadet Recruit",
    xpRequired: 0,
    description: "Starting rank for every new SMCP Trainer user.",
  },
  {
    title: "Deck Cadet",
    xpRequired: 100,
    description: "Understands basic bridge and emergency communications.",
  },
  {
    title: "Junior Officer",
    xpRequired: 250,
    description: "Can respond to common operational instructions.",
  },
  {
    title: "Officer of the Watch",
    xpRequired: 500,
    description: "Handles watchkeeping exchanges with confidence.",
  },
  {
    title: "Chief Officer",
    xpRequired: 900,
    description: "Leads safety, cargo, and emergency conversations.",
  },
  {
    title: "Master Mariner",
    xpRequired: 1400,
    description: "Commands full maritime English simulations.",
  },
];

export const scenarios: Scenario[] = [
  {
    id: "fire-engine-room",
    title: "Fire in the Engine Room",
    category: "Emergency SMCP",
    difficulty: "Basic",
    xpReward: 50,
    situation:
      "You are a cadet on board a cargo vessel. A fire alarm has activated in the engine room. The captain needs a clear SMCP-style report and immediate confirmation of the next safety action.",
    rolePlay: [
      {
        speaker: "Captain",
        line: "Cadet, report the situation in the engine room.",
      },
      {
        speaker: "Cadet",
        line: "Captain, fire alarm activated in the engine room. Smoke has been reported near the auxiliary generator.",
      },
      {
        speaker: "Captain",
        line: "Understood. Confirm that the engine room team is mustering and the fire doors are closed.",
      },
      {
        speaker: "Cadet",
        line: "Confirmed. Engine room team is mustering and fire doors are closed.",
      },
    ],
    question: {
      prompt:
        "Which response is the best SMCP-style confirmation to the captain?",
      options: [
        {
          id: "a",
          text: "Maybe the fire doors are closed. I think the team is going there.",
        },
        {
          id: "b",
          text: "Confirmed. Engine room team is mustering and fire doors are closed.",
        },
        {
          id: "c",
          text: "There is a big problem, Captain. Please wait for more news.",
        },
      ],
      correctOptionId: "b",
      correctFeedback:
        "Correct. The answer is clear, confirms the order, and uses precise emergency communication.",
      incorrectFeedback:
        "Incorrect. SMCP emergency communication should be clear, direct, and confirmed without uncertainty.",
    },
  },
];

export const plannedCapabilities = [
  "Video lessons",
  "Audio drills",
  "Voice recognition",
  "AI feedback",
  "Firebase persistence",
];
