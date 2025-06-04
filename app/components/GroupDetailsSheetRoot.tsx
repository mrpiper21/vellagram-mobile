import { GroupDetailsSheet } from '@/app/(tabs)/groups/components/GroupDetailsSheet';
import { useGroupDetails } from '@/app/context/GroupDetailsContext';
import { useTheme } from '@/hooks/useTheme';

export const GroupDetailsSheetRoot = () => {
    const { theme } = useTheme();
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