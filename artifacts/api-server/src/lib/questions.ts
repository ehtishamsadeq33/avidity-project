export interface SurveyQuestion {
  id: string;
  label: string;
  text: string;
  type: "scale";
  min: number;
  max: number;
}

const raw: { label: string; text: string }[] = [
  {
    label: "1",
    text: "How confident are you on the level of support that you will get from your immediate supervisor to Coach?",
  },
  {
    label: "2",
    text: "How confident are you that you have ample opportunities to Coach?",
  },
  {
    label: "3",
    text: "I believe that as a Coach we are supposed to make crucial decisions and take actions for the Coachee.",
  },
  {
    label: "4",
    text: "I noticed that my past bosses whom I regard as good leaders, believe and spend some time on Coaching.",
  },
  {
    label: "5",
    text: "It is vital that a Coach is supportive and provides feedback.",
  },
  { label: "6", text: "How much do you believe in Coaching?" },
  {
    label: "7",
    text: "I have full support from my leaders to Coach my people",
  },
  {
    label: "8",
    text: "I believe that Coaching can be done anywhere; i.e. at the corridor, during lunch, in the lift, on the phone and even at the park.",
  },
  {
    label: "9",
    text: "I believe that the Coachees already have the solutions within them.",
  },
  { label: "10", text: "I Coach but my Leaders don’t Coach." },
  {
    label: "11",
    text: "Coaching challenges me to stretch myself to develop my potential and realize my dreams without degrading me.",
  },
  { label: "12", text: "Anyone can be Coached, as long as they are willing." },
  {
    label: "13",
    text: "It is clearly expressed that every leader in my organization is expected to practice Coaching.",
  },
  {
    label: "14",
    text: "Coaching helps me constructively view difficult issues.",
  },
  {
    label: "15",
    text: "I believe that my organization is ready to create a Coaching culture.",
  },
  {
    label: "16",
    text: "In my organization, Leadership Coaching involves developing the potential of the subordinate",
  },
  {
    label: "17",
    text: "My team is performing at a higher level as a result of me being Coached.",
  },
  {
    label: "18",
    text: "Being able to Coach is an essential part to becoming a good leader.",
  },
  {
    label: "19",
    text: "I find myself energized after Coaching someone.",
  },
  {
    label: "20",
    text: "The Coaching relationship has a lot to do with the chemistry between the Coach and Coachee.",
  },
  {
    label: "21",
    text: "Coaching helps me feel more harmonious with my environment.",
  },
  {
    label: "22",
    text: "To what extent does your immediate supervisor expect you to Coach?",
  },
  {
    label: "23",
    text: "The Coach always chooses the goal for the Coaching session.",
  },
  {
    label: "24",
    text: "I believe that by talking to my Coach, I will get new ideas.",
  },
  {
    label: "25",
    text: "Leaders in my organization TALK about Coaching but don’t DO Coaching.",
  },
  {
    label: "26",
    text: "The Coach should explain to me the step-by-step action to be taken.",
  },
  {
    label: "27",
    text: "Sometimes, all it takes is to trigger the Coachee from a different perspective.",
  },
  {
    label: "28",
    text: "How confident are you on the level of support that you will get from your organization to Coach?",
  },
  {
    label: "29",
    text: "The Coachee needs to engage me only when I am available.",
  },
  {
    label: "30",
    text: "To what extent do you believe that Coaching is required in your organization?",
  },
  {
    label: "31.1",
    text: "Through Coaching, we can improve relationship with our bosses.",
  },
  {
    label: "31.2",
    text: "Through Coaching, we can improve relationship with our peers.",
  },
  {
    label: "31.3",
    text: "Through Coaching, we can improve relationship with our subordinate.",
  },
  {
    label: "32",
    text: "How practical is Coaching in your daily operations?",
  },
  {
    label: "33",
    text: "How confident are you that you have the necessary experience to Coach?",
  },
  {
    label: "34",
    text: "How committed are you to invest time to Coach?",
  },
  {
    label: "35",
    text: "How relevant is Coaching to your work?",
  },
  {
    label: "36",
    text: "Questions are more important than Answers in Coaching.",
  },
  {
    label: "37",
    text: "How much priority would you give to Coaching as compared to your other daily tasks?",
  },
  {
    label: "38",
    text: "How relevant is Coaching to your organization?",
  },
  {
    label: "39",
    text: "Coaching is only related to improving performance.",
  },
  {
    label: "40",
    text: "Coaching is usually for leaders who can spare the time.",
  },
  { label: "41", text: "My organization believes in Coaching." },
  { label: "42", text: "Coaching is only for non-performers." },
  {
    label: "43",
    text: 'I believe in being accessible/ available to my people.  I practice an "Open-Door" policy.',
  },
  {
    label: "44",
    text: "Coaching is already a common practice in my organization.",
  },
  {
    label: "45",
    text: 'Coaching is defined as "the process of helping others for improved performance".',
  },
  {
    label: "46",
    text: "How committed are you to make Coaching a success in your organization?",
  },
  {
    label: "47",
    text: "How well I Coach is evaluated/ discussed during my performance evaluation.",
  },
  {
    label: "48",
    text: "Coaching today is more about enhancing performance rather than fixing weaknesses.",
  },
  { label: "49", text: "How eager are you to start Coaching?" },
  {
    label: "50",
    text: "How do you perceive the value of Coaching to your organization's business performance?",
  },
  {
    label: "51.1",
    text: "To what extent do you believe that Coaching could improve performance?",
  },
  {
    label: "51.2",
    text: "To what extent do you believe that Coaching can improve staff development?",
  },
  {
    label: "51.3",
    text: "To what extent do you believe that Coaching can improve staff retention?",
  },
  {
    label: "52",
    text: "I find myself looking forward to Coaching (someone) and being Coached.",
  },
  {
    label: "53",
    text: "How supportive are you to your organization's Coaching initiatives?",
  },
  {
    label: "54",
    text: "To what extent are resources readily available for a Coaching culture in your organization?",
  },
  {
    label: "55",
    text: "What is your level of exposure to Coaching?",
  },
  {
    label: "56",
    text: "It is important to make time to Coach even when I am very busy.",
  },
  { label: "57", text: " I am expected to Coach on a daily basis." },
  {
    label: "58",
    text: "Coaching is a long-term approach towards developing others.",
  },
  {
    label: "59",
    text: "How confident are you that Coaching would work in your organization?",
  },
  {
    label: "60",
    text: "Coaching is consistent and relevant with the organization's values and vision.",
  },
  {
    label: "61",
    text: "As an effective Coach, we must explicitly offer advice and solutions to the Coachee.",
  },
  {
    label: "62",
    text: "How feasible is a Coaching culture in your organization?",
  },
  {
    label: "63",
    text: "Coaching is perceived positively in my organization.",
  },
  {
    label: "64",
    text: "I must also give a solution after every Coaching session.",
  },
  { label: "65", text: "How positive are you about Coaching?" },
  {
    label: "66",
    text: "To what extent do you agree that Coaching Culture is useful/helpful in your organization?",
  },
  {
    label: "67",
    text: "It is important that I decide on realistic, personally compelling development plans for my Coachee.",
  },
  {
    label: "68",
    text: "I am convinced that Coaching is an approach that works.",
  },
  {
    label: "69",
    text: "The Coaching Culture is effectively implemented in the organization.",
  },
  {
    label: "70",
    text: "How confident are you that you have the necessary skills and know-how to Coach?",
  },
  {
    label: "71",
    text: "How comfortable are you in dealing with confidential information in a Coaching relationship?",
  },
  {
    label: "72",
    text: " To what extent do you think people around you (bosses, peers and subordinates) expect you to Coach?",
  },
  {
    label: "73",
    text: " I use questions to help others discover the answers or gain a new perspective.",
  },
  {
    label: "74",
    text: "How comfortable are you to Coach someone at the present moment?",
  },
  {
    label: "75",
    text: "Coaching has accelerated staff's learning curve.",
  },
  { label: "76", text: "How suitable are you to be a Coach?." },
  {
    label: "77",
    text: "How confident are you that Coaching will benefit you at work?",
  },
  {
    label: "78",
    text: "Coaching has made my staff more passionate in their work.",
  },
  {
    label: "79",
    text: "How would you rate your current readiness to Coaching?",
  },
  { label: "80", text: "How ready are you to be Coached by someone?" },
  {
    label: "81",
    text: "In my organization, Coaching has helped my staff to trust each other.",
  },
  {
    label: "82",
    text: "I am particular about follow-through on promises and goals agreed during a Coaching session.",
  },
  {
    label: "83",
    text: "How ready do you think you are to start Coaching someone?",
  },
  {
    label: "84",
    text: "In my organization, Coachees are reluctant to approach Coaches.",
  },
  {
    label: "85",
    text: "It is essential to build trust and rapport with the Coachee.",
  },
  {
    label: "86",
    text: "I am convinced that Coaching is essential in succession planning.",
  },
  {
    label: "87",
    text: "My team members expect and appreciate Coaching.",
  },
  {
    label: "88",
    text: "It is important to establish clear and specific agreements regarding actions steps and responsibilities.",
  },
  {
    label: "89",
    text: "I believe that a Coach should be able to either energize, inspire or motivate me.",
  },
  { label: "90", text: "People around expect me to Coach." },
  {
    label: "91",
    text: "I have personally benefited from Coaching.",
  },
  { label: "92", text: "People around me regard me as a Coach." },
  {
    label: "93",
    text: " I enjoy challenging others to achieve more than they thought themselves capable of achieving.",
  },
  { label: "94", text: "My leaders are advocate of Coaching." },
  {
    label: "95",
    text: "How would you rate your current understanding of Coaching?",
  },
  {
    label: "96",
    text: " I get inspired when I am able to motivate others during a Coaching session.",
  },
  {
    label: "97.1",
    text: "The most important factor to become a Coach is having the right Skills i.e. Questioning Technique, Experience & Model.",
  },
  {
    label: "97.2",
    text: " The most important factor to become a Coach is having the right Will i.e. Motivation, Commitment & Confidence.",
  },
  {
    label: "97.3",
    text: " The most important factor to become a Coach is having the right Organizational Support i.e. Leaders & Management.",
  },
  {
    label: "98",
    text: " I consistently notice that good leaders spend time on Coaching.",
  },
  {
    label: "99",
    text: "I have spent time on doing Coaching, researching about Coaching or being exposed to Coaching over the past 3 months.",
  },
  {
    label: "100",
    text: "As a Coach, I demonstrate a personal commitment to learning and development.",
  },
  {
    label: "101",
    text: "Leaders in my organization encourage others to pursue their own tactics to achieve the desired results.",
  },
  {
    label: "102",
    text: "I ask pointed questions to help others surface the beliefs and data underlying their positions.",
  },
  {
    label: "103",
    text: "I strive to achieve and maintain a standard of excellence in all of my work.",
  },
  {
    label: "104",
    text: "The leaders in my organization provide Coaching to their subordinates.",
  },
  {
    label: "105",
    text: " I inspire my people to be passionate about their work through Coaching.",
  },
  { label: "106", text: "When I am lost, I reach out to my Coach." },
  {
    label: "107",
    text: "Coaching conversations take place across levels in my organization.",
  },
  {
    label: "108",
    text: "People find me approachable and usually want my help.",
  },
  {
    label: "109",
    text: " I enjoy looking for more information about Coaching.",
  },
  {
    label: "110",
    text: " It is hard to find a conducive environment to Coach in my organization.",
  },
  { label: "111", text: "I am able to Coach on a daily basis." },
  {
    label: "112",
    text: "The practice of Coaching is highly encouraged in my organization.",
  },
  {
    label: "113",
    text: " I have received positive feedback from the Coaching that I have done.",
  },
  {
    label: "114",
    text: " I provide opportunities for others to apply new knowledge and skills.",
  },
  { label: "115", text: "People come to me in times of crisis." },
  {
    label: "116",
    text: "As a Coach, I ensure that there is a clear Coaching relationship across departments.",
  },
  {
    label: "117",
    text: "To what extent are you already Coaching in your organization?",
  },
  { label: "118", text: "Fellow Coaches give feedback to each other." },
  {
    label: "119",
    text: 'As a Coach, I ensure that everyone embraces the belief that "we can win when everyone wins".',
  },
  {
    label: "120",
    text: "Team members are encouraged to Coach one another.",
  },
  { label: "121", text: "The Coach describes how the situation should be." },
  {
    label: "122",
    text: "I keep abreast on latest development of Coaching.",
  },
  {
    label: "123",
    text: "When I Coach, I refrain from giving specific instructions.",
  },
  {
    label: "124",
    text: "I am expected to listen more than I talk when I am Coaching.",
  },
  {
    label: "125",
    text: "A Coach creates a safe and secure environment to talk and discuss about sensitive issues.",
  },
  { label: "126", text: "I accurately interpret the emotions of others." },
  {
    label: "127",
    text: "I utilize a clear Coaching model during my Coaching session.",
  },
  {
    label: "128",
    text: "Years in Position",
  },
];

export const QUESTIONS: SurveyQuestion[] = raw.slice(0, 133).map((q, i) => ({
  id: `q${i + 1}`,
  label: q.label,
  text: q.text,
  type: "scale" as const,
  min: 1,
  max: 10,
}));

export const QUESTION_IDS = QUESTIONS.map((q) => q.id);
