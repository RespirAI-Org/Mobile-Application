import PocketBase, { AsyncAuthStore } from "pocketbase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EventSource from "react-native-sse";

// PocketBase uses EventSource (SSE) for real-time subscriptions.
// React Native doesn't include EventSource natively, so we polyfill it.
// @ts-ignore
global.EventSource = EventSource;

// The AsyncStorage needs to be passed to an AsyncAuthStore instance
// so that PocketBase knows how to save and retrieve the authentication tokens
const store = new AsyncAuthStore({
  save: async (serialized) => AsyncStorage.setItem("pb_auth", serialized),
  initial: AsyncStorage.getItem("pb_auth"),
  clear: async () => AsyncStorage.removeItem("pb_auth"),
});

export const PB_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL;

// Instantiate the PocketBase client with the custom auth store
export const pb = new PocketBase(PB_URL, store);
