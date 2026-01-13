/**
 * Object utility functions
 */

/**
 * Deep merges two objects, with source overriding target.
 *
 * Properties from source will override those in target.
 * Nested objects are recursively merged.
 * Arrays are not merged, they are replaced.
 *
 * @param target - The base object to merge into
 * @param source - The object to merge from (takes priority)
 * @returns A new object with merged properties
 */
export function deepMerge<T>(target: T, source: Partial<T> | undefined): T {
  if (!source) return target;

  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      (result as any)[key] = deepMerge(targetValue, sourceValue as any);
    } else if (sourceValue !== undefined) {
      (result as any)[key] = sourceValue;
    }
  }

  return result;
}
