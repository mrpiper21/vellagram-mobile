import { create } from 'zustand';

interface FormState {
    formValues: Record<string, any>;
    setFormValue: (key: string, value: any) => void;
    clearForm: () => void;
    getFormValue: (key: string) => any;
}

const useFormStore = create<FormState>((set, get) => ({
    formValues: {},

    setFormValue: (key: string, value: any) => {
        set((state) => ({
            formValues: {
                ...state.formValues,
                [key]: value
            }
        }));
    },

    clearForm: () => {
        set({ formValues: {} });
    },

    getFormValue: (key: string) => {
        return get().formValues[key];
    }
}));

export default useFormStore;