import { StateCreator, create } from "zustand";
import { persist, PersistOptions, createJSONStorage } from "zustand/middleware";

type LoginState =
  | {
      loggedIn: false;
    }
  | {
      loggedIn: true;
      account: string;
    };

type Store = {
  loginState: LoginState;
};

type Actions = {
  logIn: (account: string) => void;
  logOut: () => void;
};

type LoginStore = Store & Actions;

type LoginPersist = (
  config: StateCreator<LoginStore>,
  options: PersistOptions<LoginStore>,
) => StateCreator<LoginStore>;

export const useLoginStore = create<LoginStore>(
  (persist as LoginPersist)(
    (set) => ({
      loginState: { loggedIn: false },
      logIn: (account: string) =>
        set({ loginState: { loggedIn: true, account } }),
      logOut: () => set({ loginState: { loggedIn: false } }),
    }),
    {
      name: "",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
