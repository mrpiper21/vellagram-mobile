import { createContext, useContext, useState } from 'react';

interface FilterSheetContextType {
    isAmountSheetVisible: boolean;
    isDateSheetVisible: boolean;
    showAmountSheet: () => void;
    showDateSheet: () => void;
    hideAmountSheet: () => void;
    hideDateSheet: () => void;
}

const FilterSheetContext = createContext<FilterSheetContextType | undefined>(undefined);

export const FilterSheetProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAmountSheetVisible, setIsAmountSheetVisible] = useState(false);
    const [isDateSheetVisible, setIsDateSheetVisible] = useState(false);

    const showAmountSheet = () => setIsAmountSheetVisible(true);
    const showDateSheet = () => setIsDateSheetVisible(true);
    const hideAmountSheet = () => setIsAmountSheetVisible(false);
    const hideDateSheet = () => setIsDateSheetVisible(false);

    return (
        <FilterSheetContext.Provider
            value={{
                isAmountSheetVisible,
                isDateSheetVisible,
                showAmountSheet,
                showDateSheet,
                hideAmountSheet,
                hideDateSheet,
            }}
        >
            {children}
        </FilterSheetContext.Provider>
    );
};

export const useFilterSheet = () => {
    const context = useContext(FilterSheetContext);
    if (context === undefined) {
        throw new Error('useFilterSheet must be used within a FilterSheetProvider');
    }
    return context;
}; 