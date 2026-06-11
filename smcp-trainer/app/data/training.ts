export type Rank = {
  title: string;
  xpRequired: number;
  description: string;
};

export type RolePlayLine = {
  speaker: "Captain" | "Officer" | "Cadet";
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
  {
    id: "man-overboard",
    title: "Man Overboard",
    category: "Emergency SMCP",
    difficulty: "Basic",
    xpReward: 60,
    situation:
      "You are on the bridge during daylight navigation. A crew member falls overboard on the starboard side. The bridge team must report the emergency, mark the position, and prepare recovery actions using clear maritime English.",
    rolePlay: [
      {
        speaker: "Cadet",
        line: "Man overboard on starboard side! Position marked on GPS.",
      },
      {
        speaker: "Officer",
        line: "Captain, man overboard reported starboard side. I am initiating Williamson turn.",
      },
      {
        speaker: "Captain",
        line: "Sound the alarm, release lifebuoy with smoke signal, and keep visual contact.",
      },
      {
        speaker: "Cadet",
        line: "Alarm sounded. Lifebuoy released. Visual contact maintained.",
      },
    ],
    question: {
      prompt:
        "Which report gives the captain the clearest immediate information?",
      options: [
        {
          id: "a",
          text: "Someone is in the water, but I am not sure where.",
        },
        {
          id: "b",
          text: "Man overboard on starboard side. Position marked. Visual contact maintained.",
        },
        {
          id: "c",
          text: "There is a dangerous situation outside the vessel.",
        },
      ],
      correctOptionId: "b",
      correctFeedback:
        "Correct. The report states the emergency, side, marked position, and visual contact.",
      incorrectFeedback:
        "Incorrect. The captain needs exact, immediate information for recovery actions.",
    },
  },
  {
    id: "pilot-boarding",
    title: "Pilot Boarding",
    category: "Port Approach",
    difficulty: "Basic",
    xpReward: 40,
    situation:
      "Your vessel is approaching the pilot station before entering port. The pilot boat calls on VHF to confirm boarding arrangements. The bridge team must confirm speed, lee side, and pilot ladder readiness.",
    rolePlay: [
      {
        speaker: "Officer",
        line: "Pilot boat, this is motor vessel Horizon. We are ready to receive pilot.",
      },
      {
        speaker: "Captain",
        line: "Confirm pilot ladder rigged on port side, one meter above water.",
      },
      {
        speaker: "Cadet",
        line: "Pilot ladder rigged on port side, one meter above water. Deck lights are on.",
      },
      {
        speaker: "Officer",
        line: "Speed reduced to six knots. We are making lee on port side.",
      },
    ],
    question: {
      prompt:
        "Which confirmation is most appropriate for pilot boarding preparation?",
      options: [
        {
          id: "a",
          text: "Pilot ladder rigged on port side, one meter above water. Deck lights are on.",
        },
        {
          id: "b",
          text: "The ladder is somewhere on deck and should be ready soon.",
        },
        {
          id: "c",
          text: "Pilot boat may come when convenient. We are busy now.",
        },
      ],
      correctOptionId: "a",
      correctFeedback:
        "Correct. The response confirms the ladder position, height, and lighting.",
      incorrectFeedback:
        "Incorrect. Pilot boarding communication must confirm exact arrangements.",
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
