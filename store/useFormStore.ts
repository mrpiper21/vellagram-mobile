 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pick } from "lodash";
import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

interface IFormStore {
  formValues: {
    [key: string]: any;
  };
  formProperties: {
    [key: string]: any;
  };
  setFormValues: (key: string, data: any) => void;
  resetFormValue: (key: string) => void;
  setFormProperties: (key: string, data: any) => void;
}

export const formStore = create(
  persist<IFormStore>(
    (set, get) => ({
      formValues: {},
      formProperties: {},
      setFormValues: (key: string, data: any) =>
        set({
          formValues: {
            ...get().formValues,
            [key]: data,
          },
        }),
      setFormProperties: (key: string, data: any) =>
        set({
          formProperties: {
            ...get().formProperties,
            [key]: data,
          },
        }),
      resetFormValue: (key: string) => {
        const selectedFormValues = get().formValues;
        delete selectedFormValues[key];

        const selectedFormProperties = get().formProperties;
        delete selectedFormProperties[key];

        set({
          formValues: { ...selectedFormValues },
          formProperties: { ...selectedFormProperties },
        });
      },
    }),
    {
      name: "upsl-form",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

const useFormStore = (selector: Array<keyof IFormStore>) => {
  const memo = useMemo(() => selector, [selector]);
  return formStore(useShallow((state) => pick(state, memo)));
};
export default useFormStore;