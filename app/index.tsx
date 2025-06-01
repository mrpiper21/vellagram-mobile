import { useUserStore } from "@/store/useUserStore";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, isAuthenticated } = useUserStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated
  }));

  if (!isAuthenticated) {
    return <Redirect href="/auth/EmailAuthScreen" />;
  }

  return <Redirect href="/lock-Screen" />;
}