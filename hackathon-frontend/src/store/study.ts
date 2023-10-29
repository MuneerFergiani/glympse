import { StateCreator, create } from "zustand";
import { persist, PersistOptions, createJSONStorage } from "zustand/middleware";

type Study = {
  studyName: string;
  studyDescription: string;
  studyHypothesis: string;
  dataAnalysisMethod: string;
  minimumParticipants: number;
  maximumParticipants: number;
  surveyQuestions: {
    question: string;
  }[];
  timeLimit: number;
  tags: { tag: string }[];
  proposingAccount: string;
};

type CompletedStudy = {
  studyName: string;
  studyDescription: string;
  studyHypothesis: string;
  dataAnalysisMethod: string;
  minimumParticipants: number;
  maximumParticipants: number;
  surveyQuestions: {
    question: string;
    answers: boolean;
  }[];
  timeLimit: number;
  tags: { tag: string }[];
  proposingAccount: string;
};

type StudyState =
  | {
      state: "uninitialized";
    }
  | {
      state: "onboarding" | "confirming" | "voting";
      study: Study;
    }
  | {
      state: "completed";
      study: CompletedStudy;
    };

type Store = {
  study: StudyState;
};

type Actions = {
  addStudy: (props: {
    studyName: string;
    studyDescription: string;
    studyHypothesis: string;
    dataAnalysisMethod: string;
    minimumParticipants: number;
    maximumParticipants: number;
    surveyQuestions: {
      question: string;
    }[];
    timeLimit: number;
    tags: { tag: string }[];
    proposingAccount: string;
  }) => void;
  joinStudy: () => void;
  confirmStudy: () => void;
  voteOnStudy: (
    vote: {
      question: string;
      answers: boolean;
    }[],
  ) => void;
};

type StudyStore = Store & Actions;

type StudyPersist = (
  config: StateCreator<StudyStore>,
  options: PersistOptions<StudyStore>,
) => StateCreator<StudyStore>;

export const useStudyStore = create<StudyStore>(
  (persist as StudyPersist)(
    (set) => ({
      study: { state: "uninitialized" },
      addStudy: (props) =>
        set(({ study }) => ({
          study: {
            state: "onboarding",
            study: props,
          },
        })),

      joinStudy: () =>
        set(({ study }) => {
          if (study.state !== "onboarding") return { study };

          study["state"] = "confirming";

          return {
            study: {
              ...study,
            },
          };
        }),

      confirmStudy: () =>
        set(({ study }) => {
          if (study.state !== "confirming") return { study };

          study["state"] = "voting";

          return {
            study: {
              ...study,
            },
          };
        }),

      voteOnStudy: (vote) =>
        // @ts-ignore
        set(({ study }) => {
          if (study.state !== "voting") return { study };

          return {
            study: {
              state: "completed",
              study: {
                studyName: study.study.studyName,
                studyDescription: study.study.studyDescription,
                studyHypothesis: study.study.studyDescription,
                dataAnalysisMethod: study.study.studyDescription,
                minimumParticipants: study.study.studyDescription,
                maximumParticipants: study.study.studyDescription,
                surveyQuestions: vote,
                timeLimit: study.study.studyDescription,
                tags: study.study.studyDescription,
                proposingAccount: study.study.studyDescription,
              },
            },
          };
        }),
    }),
    {
      name: "study-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
