import { useTheme } from "@/hooks/useTheme";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const AvatarPlaceholder = ({ 
    size = 100, 
    style = {} 
  }) => {
    const {theme} = useTheme()
    
    return (
      <View style={[styles.container, { 
        width: size, 
        height: size,
        backgroundColor: theme.card,
        borderColor: theme.border,
      }, style]}>
        <Svg width={size * 0.6} height={size * 0.4} viewBox="0 0 24 24">
          {/* Simple person icon */}
          <Circle
            cx="12"
            cy="8"
            r="4"
            fill={theme.icon}
            opacity="0.6"
          />
          <Path
            d="M12 14c-4.5 0-8 2.5-8 5.5V22h16v-2.5c0-3-3.5-5.5-8-5.5z"
            fill={theme.icon}
            opacity="0.6"
          />
        </Svg>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      borderRadius: 12,
      borderWidth: .5,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
  });
  
  export default AvatarPlaceholder;