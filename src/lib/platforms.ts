import { REPO } from "./registry";

/** Platforms named on each component page. `soon` is a label, not a link. */
export type PlatformStatus = "available" | "soon";

export type Platform = {
  id: string;
  name: string;
  status: PlatformStatus;
};

export const PLATFORMS: readonly Platform[] = [
  { id: "react", name: "React", status: "available" },
  { id: "swiftui", name: "SwiftUI", status: "soon" },
  { id: "react-native", name: "React Native", status: "soon" },
];

export const LICENSE_NAME = "MIT";

/** The license file in the repository. The docs site does not host a second copy. */
export const LICENSE_HREF = `${REPO}/blob/main/LICENSE`;

export function platformStatusLabel(status: PlatformStatus): "Available" | "Soon" {
  return status === "soon" ? "Soon" : "Available";
}
