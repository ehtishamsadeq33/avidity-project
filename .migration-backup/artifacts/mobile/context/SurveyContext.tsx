import React, { createContext, useContext, useMemo, useState } from "react";

export interface PersonalInfo {
  name: string;
  email: string;
  company: string;
  date: string;
  gender: string;
  ageGroup: string;
  yearsInOrganization: string;
  yearsInPosition: string;
  numberOfReports: string;
  icNumber?: string;
  groupCode?: string;
  groupId?: string;
  groupName?: string;
  phase?: "pre" | "post" | null;
  submissionType?: "individual" | "group";
}

const empty: PersonalInfo = {
  name: "",
  email: "",
  company: "",
  date: "",
  gender: "",
  ageGroup: "",
  yearsInOrganization: "",
  numberOfReports: "",
  yearsInPosition: "",
  icNumber: "",
  groupCode: "",
  groupId: "",
  groupName: "",
  phase: null,
  submissionType: "individual",
};

interface Ctx {
  personal: PersonalInfo;
  setPersonal: (p: PersonalInfo) => void;
  answers: Record<string, number>;
  setAnswer: (id: string, value: number) => void;
  reset: () => void;
}

const SurveyCtx = createContext<Ctx | null>(null);

export function SurveyProvider({ children }: { children: React.ReactNode }) {
  const [personal, setPersonal] = useState<PersonalInfo>(empty);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const value = useMemo<Ctx>(
    () => ({
      personal,
      setPersonal,
      answers,
      setAnswer: (id, v) => setAnswers((prev) => ({ ...prev, [id]: v })),
      reset: () => {
        setPersonal(empty);
        setAnswers({});
      },
    }),
    [personal, answers],
  );

  return <SurveyCtx.Provider value={value}>{children}</SurveyCtx.Provider>;
}

export function useSurvey() {
  const ctx = useContext(SurveyCtx);
  if (!ctx) throw new Error("useSurvey must be used inside SurveyProvider");
  return ctx;
}
