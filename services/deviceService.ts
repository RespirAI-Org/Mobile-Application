import { pb } from "../lib/pocketbase";

export interface DeviceRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  device_code: string;
  name: string;
  model: string;
  firmware_version: string;
  owner: string;
  status: "active" | "inactive" | "unpaired";
  last_seen: string;
}

export const deviceService = {
  async getDevicesByOwner(
    ownerId: string,
  ): Promise<{ success: boolean; data?: DeviceRecord[]; error?: string }> {
    try {
      const records = await pb
        .collection("devices")
        .getFullList<DeviceRecord>({
          filter: `owner = "${ownerId}"`,
          sort: "-created",
        });
      return { success: true, data: records };
    } catch (error: any) {
      console.error("[DeviceService] Fetch Devices Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching devices.",
      };
    }
  },

  async getDeviceById(
    id: string,
  ): Promise<{ success: boolean; data?: DeviceRecord; error?: string }> {
    try {
      const record = await pb
        .collection("devices")
        .getOne<DeviceRecord>(id);
      return { success: true, data: record };
    } catch (error: any) {
      console.error("[DeviceService] Fetch Device Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching the device.",
      };
    }
  },

  async getDeviceByCode(
    deviceCode: string,
  ): Promise<{ success: boolean; data?: DeviceRecord; error?: string }> {
    try {
      const record = await pb
        .collection("devices")
        .getFirstListItem<DeviceRecord>(`device_code = "${deviceCode}"`);
      return { success: true, data: record };
    } catch (error: any) {
      console.error("[DeviceService] Fetch Device By Code Error:", error.message);
      if (error.status === 404) {
        return { success: false, error: "Device not found." };
      }
      return {
        success: false,
        error: error.message || "An error occurred while fetching the device.",
      };
    }
  },

  async pairDevice(
    deviceCode: string,
    ownerId: string,
  ): Promise<{ success: boolean; data?: DeviceRecord; error?: string }> {
    try {
      const device = await pb
        .collection("devices")
        .getFirstListItem<DeviceRecord>(`device_code = "${deviceCode}"`);

      const updated = await pb
        .collection("devices")
        .update<DeviceRecord>(device.id, {
          owner: ownerId,
          status: "active",
        });
      return { success: true, data: updated };
    } catch (error: any) {
      console.error("[DeviceService] Pair Device Error:", error.message);
      if (error.status === 404) {
        return { success: false, error: "Device not found with this code." };
      }
      return {
        success: false,
        error: error.message || "An error occurred while pairing the device.",
      };
    }
  },

  async unpairDevice(
    deviceId: string,
  ): Promise<{ success: boolean; data?: DeviceRecord; error?: string }> {
    try {
      const updated = await pb
        .collection("devices")
        .update<DeviceRecord>(deviceId, {
          owner: "",
          status: "unpaired",
        });
      return { success: true, data: updated };
    } catch (error: any) {
      console.error("[DeviceService] Unpair Device Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while unpairing the device.",
      };
    }
  },

  async updateDevice(
    deviceId: string,
    data: Partial<Pick<DeviceRecord, "name" | "status">>,
  ): Promise<{ success: boolean; data?: DeviceRecord; error?: string }> {
    try {
      const updated = await pb
        .collection("devices")
        .update<DeviceRecord>(deviceId, data);
      return { success: true, data: updated };
    } catch (error: any) {
      console.error("[DeviceService] Update Device Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while updating the device.",
      };
    }
  },
};
