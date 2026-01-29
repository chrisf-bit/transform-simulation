import { Scenario } from './types.js';

export const scenarios: Scenario[] = [
  {
    roundNumber: 1,
    title: "The Case for Change",
    scenarioText: "The board has announced a major digital transformation. Employees are uncertain. How will you establish the foundation?",
    decisions: [
      {
        id: "r1_budget",
        prompt: "Financial Investment: Allocate £500K transformation budget",
        type: 'budget-allocation',
        budgetAllocation: {
          categories: ['Training & Skills', 'Communication', 'Tech & Tools', 'Change Support'],
          totalBudget: 500000,
          minPerCategory: 50000
        },
        outcomeText: "Budget allocated across transformation priorities."
      },
      {
        id: "r1_time",
        prompt: "Time Investment: Weekly hours dedicated to transformation (per person)",
        type: 'budget-allocation',
        budgetAllocation: {
          categories: ['Change Champions', 'Line Managers', 'Team Members'],
          totalBudget: 40,
          minPerCategory: 5
        },
        outcomeText: "Time commitments established."
      },
      {
        id: "r1_people",
        prompt: "People Investment: Assign FTEs to transformation roles",
        type: 'budget-allocation',
        budgetAllocation: {
          categories: ['Program Team', 'Change Network', 'Technical Specialists'],
          totalBudget: 15,
          minPerCategory: 2
        },
        outcomeText: "Transformation team structure defined."
      },
      {
        id: "r1_d1",
        prompt: "Communication Strategy: How do you announce the transformation?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Town halls with honest Q&A sessions", deltas: { BP: 0, CA: 5, EE: 3, TR: 8, RS: -5, LC: 6, MO: 4 }, theme: "acknowledge_loss", outcomeText: "Transparency builds trust." },
          { id: "B", label: "CEO video focusing on opportunities", deltas: { BP: 2, CA: 2, EE: -4, TR: -6, RS: 8, LC: -3, MO: 1 }, theme: "overconfident", outcomeText: "Message feels one-sided." },
          { id: "C", label: "Written briefing cascaded through managers", deltas: { BP: 0, CA: 3, EE: 1, TR: 2, RS: -2, LC: 2, MO: 2 }, outcomeText: "Mixed reception across teams." }
        ]
      },
      {
        id: "r1_d2",
        prompt: "Engagement Approach: How do you involve employees?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Form cross-functional design groups", deltas: { BP: -2, CA: 7, EE: 5, TR: 6, RS: -6, LC: 4, MO: 6 }, theme: "acknowledge_loss", outcomeText: "People feel valued and heard." },
          { id: "B", label: "Present consultant-designed solution", deltas: { BP: 3, CA: 1, EE: -5, TR: -5, RS: 9, LC: -4, MO: 0 }, theme: "overconfident", outcomeText: "Feels imposed from above." },
          { id: "C", label: "Survey input then decide centrally", deltas: { BP: 1, CA: 3, EE: 0, TR: 1, RS: -1, LC: 1, MO: 2 }, outcomeText: "Input gathered but influence unclear." }
        ]
      },
      {
        id: "r1_d3",
        prompt: "Implementation Pace: What speed do you set?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Aggressive: 12 months, maximum pressure", deltas: { BP: 5, CA: -3, EE: -8, TR: -5, RS: 12, LC: -4, MO: 3 }, outcomeText: "Speed creates stress and resistance." },
          { id: "B", label: "Measured: 18 months, phased rollout", deltas: { BP: -2, CA: 6, EE: 4, TR: 5, RS: -5, LC: 5, MO: 5 }, outcomeText: "Sustainable pace allows adaptation." },
          { id: "C", label: "Adaptive: Adjust based on readiness", deltas: { BP: 0, CA: 4, EE: 2, TR: 3, RS: -2, LC: 3, MO: 3 }, outcomeText: "Flexible approach maintains options." }
        ]
      }
    ]
  },
  {
    roundNumber: 2,
    title: "Letting Go",
    scenarioText: "Reality is setting in. Roles changing, systems being decommissioned. Anger and resistance surface.",
    decisions: [
      {
        id: "r2_budget",
        prompt: "Additional Budget: Allocate from remaining transformation fund",
        type: 'budget-allocation',
        budgetAllocation: {
          categories: ['Change Support', 'Communication', 'Training', 'Technical Help'],
          totalBudget: 300000,
          minPerCategory: 0
        },
        outcomeText: "Budget allocated for resistance management."
      },
      {
        id: "r2_time",
        prompt: "Time Investment: Weekly hours per person for transition support",
        type: 'budget-allocation',
        budgetAllocation: {
          categories: ['One-on-Ones', 'Team Workshops', 'Coaching Sessions'],
          totalBudget: 25,
          minPerCategory: 0
        },
        outcomeText: "Time allocated for emotional support."
      },
      {
        id: "r2_d1",
        prompt: "How handle rising resistance?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Listen actively, address concerns", deltas: { BP: -3, CA: 4, EE: 5, TR: 8, RS: -12, LC: 6, MO: 3 }, theme: "listen", outcomeText: "Difficult but trust builds." },
          { id: "B", label: "Crack down on negativity", deltas: { BP: 5, CA: -2, EE: -8, TR: -9, RS: 10, LC: -7, MO: -4 }, theme: "force", outcomeText: "Resistance goes underground." },
          { id: "C", label: "Increase positive messaging", deltas: { BP: 1, CA: 1, EE: -3, TR: -4, RS: 5, LC: -2, MO: 0 }, outcomeText: "People feel unheard." }
        ]
      },
      {
        id: "r2_d2",
        prompt: "How support affected roles?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Comprehensive reskilling and support", deltas: { BP: -4, CA: 3, EE: 6, TR: 9, RS: -8, LC: 7, MO: 4 }, theme: "listen", outcomeText: "Fair treatment acknowledged." },
          { id: "B", label: "Minimal support", deltas: { BP: 3, CA: -3, EE: -10, TR: -12, RS: 15, LC: -9, MO: -5 }, theme: "force", outcomeText: "Morale crashes." },
          { id: "C", label: "Standard HR package", deltas: { BP: 0, CA: 1, EE: -2, TR: -1, RS: 2, LC: 0, MO: 0 }, outcomeText: "Meets minimum expectations." }
        ]
      }
    ]
  },
  {
    roundNumber: 3,
    title: "The Neutral Zone",
    scenarioText: "In the messy middle. Old ways gone, new ways not yet working. Confusion is high.",
    decisions: [
      {
        id: "r3_d1",
        prompt: "How build capability?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Invest in hands-on training", deltas: { BP: -2, CA: 8, EE: 6, TR: 5, RS: -7, LC: 4, MO: 8 }, theme: "capability", outcomeText: "Teams gain confidence." },
          { id: "B", label: "Detailed procedures and oversight", deltas: { BP: 2, CA: -1, EE: -10, TR: -6, RS: 12, LC: -6, MO: -5 }, theme: "control", outcomeText: "Micromanagement stifles learning." },
          { id: "C", label: "Online modules and practice", deltas: { BP: 0, CA: 3, EE: 1, TR: 1, RS: -2, LC: 1, MO: 2 }, outcomeText: "Standard results." }
        ]
      },
      {
        id: "r3_d2",
        prompt: "Allocate 200 staff hours this week across competing priorities:",
        type: 'budget-allocation',
        budgetAllocation: {
          categories: ['Business As Usual', 'Learning New Systems', 'Peer Coaching'],
          totalBudget: 200,
          minPerCategory: 30
        },
        outcomeText: "Time allocation complete. Balance will affect both current performance and future capability."
      },
      {
        id: "r3_d3",
        prompt: "How handle productivity dip?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Normalize dip, encourage experimentation", deltas: { BP: -3, CA: 6, EE: 5, TR: 7, RS: -8, LC: 5, MO: 6 }, theme: "capability", outcomeText: "Permission to struggle reduces stress." },
          { id: "B", label: "Demand immediate recovery", deltas: { BP: 3, CA: -3, EE: -9, TR: -8, RS: 13, LC: -7, MO: -6 }, theme: "control", outcomeText: "Pressure creates panic." },
          { id: "C", label: "Extend some timelines", deltas: { BP: -1, CA: 2, EE: 0, TR: 1, RS: -1, LC: 0, MO: 1 }, outcomeText: "Partial relief helps some." }
        ]
      }
    ]
  },
  {
    roundNumber: 4,
    title: "Early Adoption",
    scenarioText: "Pockets of success emerging. Early adopters demonstrate results. Scale what's working.",
    decisions: [
      {
        id: "r4_budget",
        prompt: "Scaling Budget: Allocate resources to spread success",
        type: 'budget-allocation',
        budgetAllocation: {
          categories: ['Champion Network', 'Best Practice Sharing', 'Additional Training'],
          totalBudget: 250000,
          minPerCategory: 0
        },
        outcomeText: "Resources allocated for scaling adoption."
      },
      {
        id: "r4_time",
        prompt: "Scaling Time: Weekly hours for adoption activities",
        type: 'budget-allocation',
        budgetAllocation: {
          categories: ['Peer Coaching', 'Knowledge Transfer', 'Practice Sessions'],
          totalBudget: 20,
          minPerCategory: 0
        },
        outcomeText: "Time committed to spreading success."
      },
      {
        id: "r4_d1",
        prompt: "How accelerate adoption?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Deploy change champions to coach", deltas: { BP: 2, CA: 9, EE: 5, TR: 6, RS: -10, LC: 5, MO: 9 }, theme: "capability", outcomeText: "Peer support proves powerful." },
          { id: "B", label: "Set firm deadlines with consequences", deltas: { BP: 4, CA: 2, EE: -8, TR: -7, RS: 11, LC: -6, MO: -3 }, theme: "control", outcomeText: "Forced compliance, not commitment." },
          { id: "C", label: "Let adoption happen organically", deltas: { BP: 0, CA: 4, EE: 2, TR: 2, RS: -3, LC: 1, MO: 3 }, outcomeText: "Some adopt, many wait." }
        ]
      },
      {
        id: "r4_d2",
        prompt: "How handle laggards?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Understand barriers, provide support", deltas: { BP: -1, CA: 6, EE: 4, TR: 7, RS: -9, LC: 5, MO: 5 }, theme: "listen", outcomeText: "Many resisters become advocates." },
          { id: "B", label: "Make examples of persistent resisters", deltas: { BP: 3, CA: 0, EE: -9, TR: -10, RS: 8, LC: -8, MO: -4 }, theme: "force", outcomeText: "Fear-based compliance." },
          { id: "C", label: "Focus on willing adopters", deltas: { BP: 1, CA: 5, EE: 1, TR: 0, RS: -2, LC: 0, MO: 4 }, outcomeText: "Two-speed organization." }
        ]
      }
    ]
  },
  {
    roundNumber: 5,
    title: "Embedding New Ways",
    scenarioText: "New ways taking hold. Make changes stick through systems and culture.",
    decisions: [
      {
        id: "r5_budget",
        prompt: "Embedding Budget: Invest in making changes permanent",
        type: 'budget-allocation',
        budgetAllocation: {
          categories: ['System Updates', 'Process Redesign', 'Culture Programs'],
          totalBudget: 200000,
          minPerCategory: 0
        },
        outcomeText: "Resources committed to institutionalization."
      },
      {
        id: "r5_time",
        prompt: "Embedding Time: Weekly hours for sustainability",
        type: 'budget-allocation',
        budgetAllocation: {
          categories: ['Process Refinement', 'Documentation', 'Capability Building'],
          totalBudget: 15,
          minPerCategory: 0
        },
        outcomeText: "Time dedicated to embedding changes."
      },
      {
        id: "r5_d1",
        prompt: "How reinforce behaviors?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Align metrics, rewards, consequences", deltas: { BP: 6, CA: 8, EE: 3, TR: 6, RS: -8, LC: 7, MO: 8 }, theme: "reinforce", outcomeText: "Systems alignment removes ambiguity." },
          { id: "B", label: "Talk change, don't update systems", deltas: { BP: 2, CA: -2, EE: -6, TR: -9, RS: 10, LC: -10, MO: -6 }, theme: "inconsistent", outcomeText: "Rhetoric-reality gap erodes trust." },
          { id: "C", label: "Update some systems, plan broader change", deltas: { BP: 3, CA: 3, EE: 0, TR: 0, RS: -2, LC: 1, MO: 2 }, outcomeText: "Partial reinforcement." }
        ]
      },
      {
        id: "r5_d2",
        prompt: "Handle old culture remnants?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Actively dismantle conflicting practices", deltas: { BP: 5, CA: 9, EE: 4, TR: 7, RS: -10, LC: 8, MO: 9 }, theme: "reinforce", outcomeText: "Clear message: no going back." },
          { id: "B", label: "Allow old and new to coexist", deltas: { BP: 1, CA: -3, EE: -4, TR: -6, RS: 8, LC: -7, MO: -5 }, theme: "inconsistent", outcomeText: "Cultural tug-of-war." },
          { id: "C", label: "Gradually phase out old practices", deltas: { BP: 3, CA: 4, EE: 1, TR: 2, RS: -3, LC: 2, MO: 3 }, outcomeText: "Gentle transition." }
        ]
      }
    ]
  },
  {
    roundNumber: 6,
    title: "Outcomes and Reflection",
    scenarioText: "Approaching transformation complete. Transition from program to continuous evolution.",
    decisions: [
      {
        id: "r6_budget",
        prompt: "Final Budget: Allocate remaining funds for sustainability",
        type: 'budget-allocation',
        budgetAllocation: {
          categories: ['Continuous Improvement', 'Knowledge Management', 'Celebration & Recognition'],
          totalBudget: 150000,
          minPerCategory: 0
        },
        outcomeText: "Final resources allocated for transition to BAU."
      },
      {
        id: "r6_time",
        prompt: "Transition Time: Weekly hours for handover and closure",
        type: 'budget-allocation',
        budgetAllocation: {
          categories: ['Documentation', 'Knowledge Transfer', 'Team Recognition'],
          totalBudget: 10,
          minPerCategory: 0
        },
        outcomeText: "Time committed to proper closure."
      },
      {
        id: "r6_d1",
        prompt: "Transition to BAU?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Integrate change capability into roles", deltas: { BP: 8, CA: 10, EE: 5, TR: 8, RS: -8, LC: 9, MO: 10 }, theme: "reinforce", outcomeText: "Change becomes how you work." },
          { id: "B", label: "Disband team, return to operations", deltas: { BP: 5, CA: -5, EE: -6, TR: -8, RS: 10, LC: -9, MO: -10 }, theme: "inconsistent", outcomeText: "Abrupt ending creates regression." },
          { id: "C", label: "Keep small transformation office", deltas: { BP: 6, CA: 5, EE: 2, TR: 3, RS: -3, LC: 3, MO: 4 }, outcomeText: "Safety net provides continuity." }
        ]
      },
      {
        id: "r6_d2",
        prompt: "Recognize the journey?",
        type: 'multiple-choice',
        options: [
          { id: "A", label: "Major celebration and lessons learned", deltas: { BP: 3, CA: 5, EE: 8, TR: 7, RS: -5, LC: 7, MO: 8 }, theme: "reinforce", outcomeText: "People feel valued." },
          { id: "B", label: "No special recognition", deltas: { BP: 2, CA: -2, EE: -8, TR: -7, RS: 8, LC: -8, MO: -6 }, theme: "inconsistent", outcomeText: "Sacrifice unacknowledged." },
          { id: "C", label: "Thank-you notes and reviews", deltas: { BP: 2, CA: 2, EE: 3, TR: 3, RS: -2, LC: 3, MO: 3 }, outcomeText: "Appreciated but insufficient." }
        ]
      }
    ]
  }
];
