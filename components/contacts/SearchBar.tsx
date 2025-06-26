import React from "react";
import { ActivityIndicator, StyleSheet, TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  appColors: any;
  isChecking: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, appColors, isChecking }) => {
  return (
    <View style={[styles.searchContainer, { borderColor: appColors.border, backgroundColor: appColors.card }]}> 
      <TextInput
        style={[styles.searchInput, { color: appColors.text }]}
        placeholder="Search contacts..."
        placeholderTextColor={appColors.icon}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      {isChecking && <ActivityIndicator size="small" style={styles.loadingIndicator} />}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    margin: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  loadingIndicator: {
    marginLeft: 12,
  },
}); 