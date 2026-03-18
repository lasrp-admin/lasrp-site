import type { Resource } from "../types/types"

export const getUniqueZipCodes = (resource: Resource[]): string[] => {
    const zipSet = new Set<string>();

    resource.forEach((resource) => {
        resource.zipcode?.forEach((zip) => {
            if (zip && zip.trim() !== "") {
                zipSet.add(zip.trim());
            }
        });
    });

    return Array.from(zipSet).sort((a, b) => Number(a) - Number(b));
}