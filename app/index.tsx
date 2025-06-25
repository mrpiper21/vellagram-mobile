import { useUserStore } from "@/store/useUserStore";
import { Redirect } from "expo-router";

export default function Index() {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  if (!user) {
    return <Redirect href="/auth/EmailAuthScreen" />;
  }

  return <Redirect href="/lock-Screen" />;
}