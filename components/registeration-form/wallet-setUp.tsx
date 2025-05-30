import { IUserRegistrationData } from "@/@types/user-auth-types";
import { Colors } from "@/constants/Colors";
import { Dispatch, FC, SetStateAction } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
    formData: IUserRegistrationData;
    updateFormData: (field: string, value: string) => void;
    walletChoice: string | null
    setWalletChoice: Dispatch<SetStateAction<string | null>>
}

const WalletSetUp: FC<Props> = ({ formData, updateFormData, setWalletChoice, walletChoice }) => {
    return (
        <View style={{ padding: 20 }}>
            <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: Colors.light.text,
                marginBottom: 10
            }}>
                Wallet Setup
            </Text>
            <Text style={{
                fontSize: 16,
                color: Colors.light.icon,
                marginBottom: 30
            }}>
                Choose how you want to manage your wallet
            </Text>

            <TouchableOpacity
                style={{
                    borderWidth: 2,
                    borderColor: walletChoice === 'connect' ? Colors.light.tint : Colors.light.border,
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 16,
                    backgroundColor: walletChoice === 'connect' ? `${Colors.light.tint}10` : Colors.light.card
                }}
                onPress={() => setWalletChoice('connect')}
            >
                <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: Colors.light.text,
                    marginBottom: 8
                }}>
                    🔗 Connect Existing Wallet
                </Text>
                <Text style={{
                    fontSize: 14,
                    color: Colors.light.icon
                }}>
                    Connect your existing wallet (MetaMask, Trust Wallet, etc.)
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={{
                    borderWidth: 2,
                    borderColor: walletChoice === 'create' ? Colors.light.tint : Colors.light.border,
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20,
                    backgroundColor: walletChoice === 'create' ? `${Colors.light.tint}10` : Colors.light.card
                }}
                onPress={() => setWalletChoice('create')}
            >
                <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: Colors.light.text,
                    marginBottom: 8
                }}>
                    ✨ Create New Wallet
                </Text>
                <Text style={{
                    fontSize: 14,
                    color: Colors.light.icon
                }}>
                    We'll create a secure wallet for you automatically
                </Text>
            </TouchableOpacity>

            {walletChoice === 'connect' && (
                <TextInput
                    style={{
                        borderWidth: 1,
                        borderColor: Colors.light.border,
                        borderRadius: 12,
                        padding: 16,
                        fontSize: 14,
                        backgroundColor: Colors.light.card,
                        fontFamily: 'monospace'
                    }}
                    placeholder="0x... (Wallet Address)"
                    value={formData.walletAddress!}
                    onChangeText={(text) => updateFormData('walletAddress', text)}
                />
            )}
        </View>
    )
}

export default WalletSetUp