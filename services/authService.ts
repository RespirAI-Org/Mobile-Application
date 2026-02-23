import { pb } from "../lib/pocketbase";

export const authService = {
  //Log in with email and password
  async login(email: string, password: string) {
    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);
      return { success: true, user: authData.record };
    } catch (error: any) {
      console.error("[Authentication] Login Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred during login",
      };
    }
  },

  // Register a new user with email and password
  async signup(email: string, password: string, passwordConfirm: string) {
    try {
      const record = await pb.collection("users").create({
        email,
        password,
        passwordConfirm,
      });

      // Optionally authenticate the user immediately after sign up
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);

      return { success: true, user: authData.record };
    } catch (error: any) {
      console.error("[Authentication] Signup Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred during sign up",
      };
    }
  },

  // Log out the current user
  logout() {
    pb.authStore.clear();
  },

  // Get the currently logged-in user details
  getCurrentUser() {
    return pb.authStore.record;
  },

  // Check if a user is currently authenticated
  isAuthenticated() {
    return pb.authStore.isValid;
  },

  // Log in via OAuth2 provider (e.g., Google, Zalo)
  async loginWithOAuth2(provider: "google" | "zalo") {
    // PocketBase provides authWithOAuth2, but you need an adapter for RN.
    try {
      // Simplified example; this usually requires expo-web-browser
      const authData = await pb
        .collection("users")
        .authWithOAuth2({ provider });
      return { success: true, user: authData.record };
    } catch (error: any) {
      console.error(`[Authentication] ${provider} Login Error:`, error.message);
      return {
        success: false,
        error: error.message || `An error occurred during ${provider} login`,
      };
    }
  },
};
