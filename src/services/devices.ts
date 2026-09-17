import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";

const DEVICE_ID_KEY = "@autivity_device_id";

const MAX_ACTIVE_DEVICES = 2;

export const getDeviceId = async (): Promise<string> => {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = Crypto.randomUUID();
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
};

export const registerDevice = async (userId: string) => {
  const deviceId = await getDeviceId();

  // Check if this device is already registered
  const { data: existingDevice, error: existingError } = await supabase
    .from("user_devices")
    .select("id")
    .eq("user_id", userId)
    .eq("device_id", deviceId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  // Existing device - just update activity
  if (existingDevice) {
    const { error } = await supabase
      .from("user_devices")
      .update({
        last_active_at: new Date().toISOString(),
      })
      .eq("id", existingDevice.id);

    if (error) {
      throw new Error(error.message);
    }

    return {
      allowed: true,
      isNewDevice: false,
    };
  }

  // Count currently registered devices
  const { count, error: countError } = await supabase
    .from("user_devices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    throw new Error(countError.message);
  }

  // Maximum of 2 devices
  if ((count ?? 0) >= MAX_ACTIVE_DEVICES) {
    return {
      allowed: false,
      isNewDevice: true,
    };
  }

  // Register new device
  const { error: insertError } = await supabase
    .from("user_devices")
    .insert({
      user_id: userId,
      device_id: deviceId,
      platform: Platform.OS,
      device_name: `${Platform.OS} device`,
      last_active_at: new Date().toISOString(),
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return {
    allowed: true,
    isNewDevice: true,
  };
};