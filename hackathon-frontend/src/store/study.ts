import { StateCreator, create } from "zustand";
import { persist, PersistOptions, createJSONStorage } from "zustand/middleware";

type Store = {
  confirmed: number[];
  voted: number[];
};

type Actions = {
  addConfirmed: (id: number) => void;
  addVoted: (id: number) => void;
};

type StudyStore = Store & Actions;

type StudyPersist = (
  config: StateCreator<StudyStore>,
  options: PersistOptions<StudyStore>,
) => StateCreator<StudyStore>;

export const useStudyStore = create<StudyStore>(
  (persist as StudyPersist)(
    (set) => ({
      confirmed: [],
      voted: [],
      addConfirmed: (id: number) =>
        set(({ confirmed }) => ({ confirmed: [id, ...confirmed] })),
      addVoted: (id: number) => set(({ voted }) => ({ voted: [id, ...voted] })),
    }),
    {
      name: "study-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
