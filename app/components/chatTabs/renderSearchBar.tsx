import { Ionicons } from '@expo/vector-icons';
import { Dispatch, SetStateAction } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface Props {
    theme: any
    searchQuery: string,
    setSearchQuery: Dispatch<SetStateAction<string>>
}

const renderSearchBar = ({theme, searchQuery, setSearchQuery}: Props) => (
            <View
                style={[styles.searchContainer, { backgroundColor: theme.background }]}
            >
                <View
                    style={[
                        styles.searchBar,
                        {
                            backgroundColor: theme.isDark
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(0, 0, 0, 0.05)",
                        },
                    ]}
                >
                    <Ionicons
                        name="search"
                        size={20}
                        color={theme.textSecondary}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search conversations..."
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={(text) => setSearchQuery(text)}
                        // clearButtonMode="while-editing"
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                        blurOnSubmit={false}
                        // enablesReturnKeyAutomatically={true}
                        keyboardType="default"
                        textContentType="none"
                        autoComplete="off"
                        spellCheck={false}
                    />
                </View>
            </View>
        );

const styles = StyleSheet.create({
     searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        width: 410
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 45,
    },
     searchIcon: {
        marginRight: 12,
    },
        searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '400',
    },
})

export default renderSearchBar