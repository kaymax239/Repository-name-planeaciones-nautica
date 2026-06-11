export type Rank = {
  title: string;
  xpRequired: number;
  description: string;
};

export type RolePlayLine = {
  speaker: "Captain" | "Officer" | "Engineer" | "Cadet";
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

export type TrainingRoute = {
  id: "deck-navigation" | "marine-engineering";
  title: string;
  shortTitle: string;
  summary: string;
  ranks: Rank[];
  scenarios: Scenario[];
};

const deckRanks: Rank[] = [
  {
    title: "Cadet Recruit",
    xpRequired: 0,
    description: "Starting rank for every new deck simulator user.",
  },
  {
    title: "Deck Cadet",
    xpRequired: 100,
    description: "Understands basic bridge and navigation communications.",
  },
  {
    title: "Junior Officer",
    xpRequired: 250,
    description: "Can respond to common bridge team instructions.",
  },
  {
    title: "Officer of the Watch",
    xpRequired: 500,
    description: "Handles watchkeeping exchanges with confidence.",
  },
  {
    title: "Chief Officer",
    xpRequired: 900,
    description: "Leads safety, cargo, and bridge communications.",
  },
  {
    title: "Master Mariner",
    xpRequired: 1400,
    description: "Commands full deck and navigation simulations.",
  },
];

const engineeringRanks: Rank[] = [
  {
    title: "Cadet Recruit",
    xpRequired: 0,
    description: "Starting rank for every new engineering simulator user.",
  },
  {
    title: "Engine Cadet",
    xpRequired: 100,
    description: "Understands basic engine room reports and alarms.",
  },
  {
    title: "Junior Engineer",
    xpRequired: 250,
    description: "Can assist with routine machinery communication.",
  },
  {
    title: "Third Engineer",
    xpRequired: 500,
    description: "Responds to machinery failures and safety instructions.",
  },
  {
    title: "Second Engineer",
    xpRequired: 900,
    description: "Coordinates engine room troubleshooting and watch handovers.",
  },
  {
    title: "Chief Engineer",
    xpRequired: 1400,
    description: "Leads technical operations and emergency engineering reports.",
  },
];

const deckScenarios: Scenario[] = [
  {
    id: "deck-fire-engine-room",
    title: "Fire in the Engine Room",
    category: "Emergency SMCP",
    difficulty: "Basic",
    xpReward: 50,
    situation:
      "You are on the bridge of a cargo vessel. A fire alarm has activated in the engine room. The captain needs a clear SMCP-style report and confirmation that safety actions are in progress.",
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
        speaker: "Officer",
        line: "Fire doors are closed and the emergency team is mustering.",
      },
      {
        speaker: "Captain",
        line: "Maintain communication with the engine room and keep me informed.",
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
          text: "Confirmed. Fire doors are closed and the emergency team is mustering.",
        },
        {
          id: "c",
          text: "There is a big problem, Captain. Please wait for more news.",
        },
      ],
      correctOptionId: "b",
      correctFeedback:
        "Correct. The answer confirms the order clearly and uses precise emergency communication.",
      incorrectFeedback:
        "Incorrect. Bridge emergency communication should be clear, direct, and confirmed without uncertainty.",
    },
  },
  {
    id: "deck-man-overboard",
    title: "Man Overboard",
    category: "Emergency SMCP",
    difficulty: "Basic",
    xpReward: 60,
    situation:
      "You are on the bridge during daylight navigation. A crew member falls overboard on the starboard side. The bridge team must report the emergency, mark the position, and prepare recovery actions.",
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
    id: "deck-pilot-boarding",
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
  {
    id: "deck-collision-avoidance",
    title: "Collision Avoidance",
    category: "Navigation Watch",
    difficulty: "Basic",
    xpReward: 55,
    situation:
      "A target vessel is crossing from starboard at close range. The officer of the watch asks the cadet to report CPA information and prepare a clear communication before altering course.",
    rolePlay: [
      {
        speaker: "Officer",
        line: "Cadet, report the closest point of approach for the vessel on starboard bow.",
      },
      {
        speaker: "Cadet",
        line: "CPA is 0.4 nautical miles in eight minutes. Risk of collision exists.",
      },
      {
        speaker: "Captain",
        line: "Call the vessel on VHF and state our intention to alter course to starboard.",
      },
      {
        speaker: "Officer",
        line: "Understood. Calling vessel and preparing alteration to starboard.",
      },
    ],
    question: {
      prompt:
        "Which phrase best reports the navigation risk to the bridge team?",
      options: [
        {
          id: "a",
          text: "The other ship looks close, but maybe it will pass.",
        },
        {
          id: "b",
          text: "CPA is 0.4 nautical miles in eight minutes. Risk of collision exists.",
        },
        {
          id: "c",
          text: "I can see a vessel somewhere on the starboard side.",
        },
      ],
      correctOptionId: "b",
      correctFeedback:
        "Correct. The report gives measurable CPA data and states the collision risk.",
      incorrectFeedback:
        "Incorrect. Collision avoidance reports must include clear, measurable information.",
    },
  },
  {
    id: "deck-vhf-communication",
    title: "VHF Communication",
    category: "Radio Procedure",
    difficulty: "Basic",
    xpReward: 45,
    situation:
      "The bridge must contact a nearby vessel on VHF Channel 16 to arrange a safe passing agreement. The message must identify both vessels and request confirmation.",
    rolePlay: [
      {
        speaker: "Officer",
        line: "Prepare a VHF call to motor vessel Atlantic Star on our port bow.",
      },
      {
        speaker: "Cadet",
        line: "Motor vessel Atlantic Star, this is motor vessel Horizon on your starboard quarter.",
      },
      {
        speaker: "Captain",
        line: "Request agreement for port-to-port passing and ask them to confirm.",
      },
      {
        speaker: "Cadet",
        line: "Request port-to-port passing. Please confirm.",
      },
    ],
    question: {
      prompt: "Which VHF phrase is the clearest request for a passing agreement?",
      options: [
        {
          id: "a",
          text: "Atlantic Star, this is Horizon. Request port-to-port passing. Please confirm.",
        },
        {
          id: "b",
          text: "Hello ship, move away from us please.",
        },
        {
          id: "c",
          text: "We are coming. You should know what to do.",
        },
      ],
      correctOptionId: "a",
      correctFeedback:
        "Correct. The call identifies the vessels, states the request, and asks for confirmation.",
      incorrectFeedback:
        "Incorrect. VHF communication must identify vessels and request confirmation clearly.",
    },
  },
];

const engineeringScenarios: Scenario[] = [
  {
    id: "engine-auxiliary-generator-failure",
    title: "Auxiliary Generator Failure",
    category: "Power Management",
    difficulty: "Basic",
    xpReward: 50,
    situation:
      "During sea passage, auxiliary generator number two trips unexpectedly. The engine room team must report the failure, confirm standby generator status, and keep the bridge informed.",
    rolePlay: [
      {
        speaker: "Engineer",
        line: "Bridge, engine control room. Auxiliary generator number two has tripped.",
      },
      {
        speaker: "Officer",
        line: "Engine control room, bridge. Confirm electrical load and standby generator status.",
      },
      {
        speaker: "Cadet",
        line: "Standby generator is starting. Essential load remains supplied.",
      },
      {
        speaker: "Engineer",
        line: "We are investigating the cause and will report when generator is back online.",
      },
    ],
    question: {
      prompt: "Which report best confirms the immediate generator status?",
      options: [
        {
          id: "a",
          text: "Something stopped, but power may be fine.",
        },
        {
          id: "b",
          text: "Auxiliary generator number two has tripped. Standby generator is starting and essential load remains supplied.",
        },
        {
          id: "c",
          text: "We will check later when there is time.",
        },
      ],
      correctOptionId: "b",
      correctFeedback:
        "Correct. The report names the failed unit and confirms standby power status.",
      incorrectFeedback:
        "Incorrect. Engineering reports must identify the equipment and current operational status.",
    },
  },
  {
    id: "engine-high-temperature-alarm",
    title: "High Temperature Alarm",
    category: "Machinery Alarm",
    difficulty: "Basic",
    xpReward: 45,
    situation:
      "A high temperature alarm activates for the main engine cooling water. The watch engineer asks the cadet to report the alarm and the first corrective action.",
    rolePlay: [
      {
        speaker: "Engineer",
        line: "Cadet, identify the active alarm on the monitoring panel.",
      },
      {
        speaker: "Cadet",
        line: "Main engine cooling water high temperature alarm is active.",
      },
      {
        speaker: "Engineer",
        line: "Check cooling water pressure and start the standby pump.",
      },
      {
        speaker: "Cadet",
        line: "Cooling water pressure is low. Standby pump started.",
      },
    ],
    question: {
      prompt: "Which response gives the clearest alarm and action report?",
      options: [
        {
          id: "a",
          text: "The engine is hot and I pressed something.",
        },
        {
          id: "b",
          text: "Main engine cooling water high temperature alarm is active. Standby pump started.",
        },
        {
          id: "c",
          text: "Temperature is not normal, but I do not know the system.",
        },
      ],
      correctOptionId: "b",
      correctFeedback:
        "Correct. The response identifies the alarm and confirms the corrective action.",
      incorrectFeedback:
        "Incorrect. Alarm communication must name the system and action taken.",
    },
  },
  {
    id: "engine-bilge-pump-failure",
    title: "Bilge Pump Failure",
    category: "Engine Room Safety",
    difficulty: "Basic",
    xpReward: 55,
    situation:
      "The bilge level is rising in the engine room, but the duty bilge pump fails to start. The engineering team must report the failure and switch to the standby pump.",
    rolePlay: [
      {
        speaker: "Cadet",
        line: "Engineer, bilge level is rising and duty bilge pump failed to start.",
      },
      {
        speaker: "Engineer",
        line: "Start standby bilge pump and monitor the level.",
      },
      {
        speaker: "Cadet",
        line: "Standby bilge pump started. Bilge level is decreasing.",
      },
      {
        speaker: "Captain",
        line: "Engine room, bridge. Keep bridge informed if bilge level rises again.",
      },
    ],
    question: {
      prompt: "Which confirmation is best after starting the standby bilge pump?",
      options: [
        {
          id: "a",
          text: "Standby bilge pump started. Bilge level is decreasing.",
        },
        {
          id: "b",
          text: "The water may go down if the pump works.",
        },
        {
          id: "c",
          text: "The pump area is noisy and I cannot confirm.",
        },
      ],
      correctOptionId: "a",
      correctFeedback:
        "Correct. The confirmation states the action and the observed result.",
      incorrectFeedback:
        "Incorrect. The bridge and engineer need a confirmed action and current bilge status.",
    },
  },
  {
    id: "engine-fuel-leak",
    title: "Fuel Leak",
    category: "Pollution Prevention",
    difficulty: "Basic",
    xpReward: 60,
    situation:
      "A small fuel leak is discovered near a transfer line in the engine room. The team must stop the transfer, contain the leak, and report the situation clearly.",
    rolePlay: [
      {
        speaker: "Cadet",
        line: "Engineer, fuel leak detected near the transfer line.",
      },
      {
        speaker: "Engineer",
        line: "Stop fuel transfer immediately and place absorbent pads around the leak.",
      },
      {
        speaker: "Cadet",
        line: "Fuel transfer stopped. Leak is contained with absorbent pads.",
      },
      {
        speaker: "Engineer",
        line: "Good. Prepare a report for the chief engineer and monitor for further leakage.",
      },
    ],
    question: {
      prompt: "Which report best communicates the fuel leak response?",
      options: [
        {
          id: "a",
          text: "There is fuel somewhere. We are looking at it.",
        },
        {
          id: "b",
          text: "Fuel transfer stopped. Leak is contained with absorbent pads.",
        },
        {
          id: "c",
          text: "Fuel leak is probably not serious, so no action is needed.",
        },
      ],
      correctOptionId: "b",
      correctFeedback:
        "Correct. The response confirms the transfer is stopped and containment is in place.",
      incorrectFeedback:
        "Incorrect. Fuel leak reports must include immediate action and containment status.",
    },
  },
  {
    id: "engine-room-fire",
    title: "Engine Room Fire",
    category: "Engineering Emergency",
    difficulty: "Basic",
    xpReward: 70,
    situation:
      "Smoke and flames are reported near an auxiliary engine. The engineering team must raise the alarm, isolate fuel supply, and report status to the bridge.",
    rolePlay: [
      {
        speaker: "Engineer",
        line: "Bridge, engine control room. Fire detected near auxiliary engine number one.",
      },
      {
        speaker: "Captain",
        line: "Engine control room, bridge. Confirm alarm, fuel isolation, and team mustering.",
      },
      {
        speaker: "Cadet",
        line: "Fire alarm activated. Fuel supply isolated. Fire team is mustering.",
      },
      {
        speaker: "Engineer",
        line: "Portable extinguishers are ready and ventilation is being stopped.",
      },
    ],
    question: {
      prompt: "Which confirmation best fits an engine room fire emergency?",
      options: [
        {
          id: "a",
          text: "Fire alarm activated. Fuel supply isolated. Fire team is mustering.",
        },
        {
          id: "b",
          text: "There is smoke and we are not sure what to do.",
        },
        {
          id: "c",
          text: "The bridge should wait until the situation is over.",
        },
      ],
      correctOptionId: "a",
      correctFeedback:
        "Correct. The confirmation covers alarm, isolation, and emergency team status.",
      incorrectFeedback:
        "Incorrect. Fire emergency communication must confirm immediate safety actions.",
    },
  },
];

export const trainingRoutes: TrainingRoute[] = [
  {
    id: "deck-navigation",
    title: "Deck / Navigation Simulator",
    shortTitle: "Deck / Navigation",
    summary:
      "Bridge team communication for navigation watch, emergencies, pilotage, collision avoidance, and VHF procedures.",
    ranks: deckRanks,
    scenarios: deckScenarios,
  },
  {
    id: "marine-engineering",
    title: "Marine Engineering Simulator",
    shortTitle: "Marine Engineering",
    summary:
      "Engine room communication for alarms, machinery failures, fuel safety, bilge control, and engineering emergencies.",
    ranks: engineeringRanks,
    scenarios: engineeringScenarios,
  },
];

export const plannedCapabilities = [
  "Video lessons",
  "Audio drills",
  "Voice recognition",
  "AI feedback",
  "Firebase persistence",
];
