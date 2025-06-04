import React, { createContext, useContext, useState } from 'react';

interface Group {
    id: string;
    name: string;
    targetAmount: number;
    startDate: string;
    nextRepaymentDate?: string;
    status: 'active' | 'pending';
    memberCount: number;
}

interface GroupDetailsContextType {
    selectedGroup: Group | null;
    showGroupDetails: (group: Group) => void;
    hideGroupDetails: () => void;
}

const GroupDetailsContext = createContext<GroupDetailsContextType | undefined>(undefined);

export const GroupDetailsProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    const showGroupDetails = (group: Group) => {
        setSelectedGroup(group);
    };

    const hideGroupDetails = () => {
        setSelectedGroup(null);
    };

    return (
        <GroupDetailsContext.Provider
            value={{
                selectedGroup,
                showGroupDetails,
                hideGroupDetails,
            }}
        >
            {children}
        </GroupDetailsContext.Provider>
    );
};

export const useGroupDetails = () => {
    const context = useContext(GroupDetailsContext);
    if (context === undefined) {
        throw new Error('useGroupDetails must be used within a GroupDetailsProvider');
    }
    return context;
}; 