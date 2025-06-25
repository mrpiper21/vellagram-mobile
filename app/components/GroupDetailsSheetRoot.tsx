import { GroupDetailsSheet } from '@/app/(tabs)/groups/components/GroupDetailsSheet';
import { useGroupDetails } from '@/app/context/GroupDetailsContext';
import { useAppTheme } from '@/context/ThemeContext';

export const GroupDetailsSheetRoot = () => {
    const theme = useAppTheme();
    const colorScheme = theme.isDark ? 'dark' : 'light';
    const { selectedGroup, hideGroupDetails } = useGroupDetails();

    if (!selectedGroup) {
        return null;
    }

    return (
        <GroupDetailsSheet
            isVisible={true}
            onClose={hideGroupDetails}
            colorScheme={colorScheme}
            group={selectedGroup}
        />
    );
}; 