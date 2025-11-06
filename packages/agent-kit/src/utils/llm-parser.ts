/**
 * LLM Response Parser Utility
 * Shared utilities for parsing and cleaning LLM responses
 */

/**
 * Clean markdown code blocks from LLM response
 * Removes ```json, ```, and other markdown formatting
 *
 * @param response - Raw LLM response
 * @returns Cleaned response
 *
 * @example
 * ```typescript
 * const cleaned = LLMResponseParser.cleanMarkdown('```json\n{"key": "value"}\n```');
 * // Returns: '{"key": "value"}'
 * ```
 */
export function cleanMarkdown(response: string): string {
  let cleaned = response.trim();

  // Remove markdown json blocks (case insensitive)
  if (cleaned.startsWith('```json') || cleaned.startsWith('```JSON')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  }

  // Remove generic markdown code blocks
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }

  // Remove trailing code block markers
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }

  return cleaned.trim();
}

/**
 * Extract JSON array or object from response
 * Attempts to find valid JSON structure even if surrounded by text
 *
 * @param response - Response text
 * @returns Extracted JSON string or original response
 *
 * @example
 * ```typescript
 * const json = extractJSON('Here is the data: [{"id": 1}] and more text');
 * // Returns: '[{"id": 1}]'
 * ```
 */
export function extractJSON(response: string): string {
  // Try to find JSON array
  const arrayMatch = response.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }

  // Try to find JSON object
  const objectMatch = response.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0];
  }

  return response;
}

/**
 * Parse JSON with fallback handling
 * Safely parse JSON with error handling
 *
 * @param jsonString - JSON string to parse
 * @returns Parsed object or null
 */
export function safeJSONParse<T = unknown>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    return null;
  }
}

/**
 * Validate that parsed data is an array
 * Wraps single objects in array if needed
 *
 * @param data - Parsed data
 * @returns Array of data
 */
export function ensureArray<T>(data: T | T[]): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  return [data];
}

/**
 * LLM Response Parser
 * Complete parser with all utilities combined
 */
export class LLMResponseParser {
  /**
   * Parse LLM response into typed array
   * Handles markdown, JSON extraction, and validation
   *
   * @param response - Raw LLM response
   * @param validator - Optional validation function
   * @returns Parsed and validated array
   *
   * @example
   * ```typescript
   * const actions = LLMResponseParser.parse<Action>(
   *   llmResponse,
   *   (item) => 'type' in item && typeof item.type === 'string'
   * );
   * ```
   */
  static parse<T>(
    response: string,
    validator?: (item: unknown) => boolean
  ): T[] {
    // Step 1: Clean markdown
    const cleaned = cleanMarkdown(response);

    // Step 2: Extract JSON
    const jsonStr = extractJSON(cleaned);

    // Step 3: Parse JSON
    const parsed = safeJSONParse(jsonStr);
    if (!parsed) {
      console.warn('Failed to parse LLM response as JSON:', response.substring(0, 100));
      return [];
    }

    // Step 4: Ensure array
    const array = ensureArray(parsed);

    // Step 5: Validate if validator provided
    if (validator) {
      return array.filter(validator) as T[];
    }

    return array as T[];
  }

  /**
   * Parse with strict mode
   * Throws error if parsing fails instead of returning empty array
   *
   * @param response - Raw LLM response
   * @param validator - Optional validation function
   * @returns Parsed array or throws
   */
  static parseStrict<T>(
    response: string,
    validator?: (item: unknown) => boolean
  ): T[] {
    const cleaned = cleanMarkdown(response);
    const jsonStr = extractJSON(cleaned);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (error) {
      throw new Error(
        `Failed to parse LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    const array = ensureArray(parsed);

    if (validator) {
      const filtered = array.filter(validator) as T[];
      if (filtered.length === 0 && array.length > 0) {
        throw new Error('All parsed items failed validation');
      }
      return filtered;
    }

    return array as T[];
  }

  /**
   * Parse with default fallback
   * Returns default value if parsing fails
   *
   * @param response - Raw LLM response
   * @param defaultValue - Default value to return on failure
   * @param validator - Optional validation function
   * @returns Parsed array or default value
   */
  static parseWithDefault<T>(
    response: string,
    defaultValue: T[],
    validator?: (item: unknown) => boolean
  ): T[] {
    try {
      const result = this.parse<T>(response, validator);
      return result.length > 0 ? result : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Extract key-value pairs from response
   * Useful for structured data extraction
   *
   * @param response - LLM response
   * @param keys - Expected keys
   * @returns Object with extracted values
   */
  static extractKeyValues(
    response: string,
    keys: string[]
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const key of keys) {
      // Try various patterns
      const patterns = [
        new RegExp(`${key}\\s*[:=]\\s*["']([^"']+)["']`, 'i'),
        new RegExp(`${key}\\s*[:=]\\s*([^\\n,]+)`, 'i'),
        new RegExp(`["']${key}["']\\s*[:=]\\s*["']([^"']+)["']`, 'i'),
      ];

      for (const pattern of patterns) {
        const match = response.match(pattern);
        if (match && match[1]) {
          result[key] = match[1].trim();
          break;
        }
      }
    }

    return result;
  }
}

/**
 * Type guard helpers
 */
export const TypeGuards = {
  /**
   * Check if object has required properties
   */
  hasProperties<T extends object>(
    obj: unknown,
    props: (keyof T)[]
  ): obj is T {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }
    return props.every((prop) => prop in obj);
  },

  /**
   * Check if object has property of specific type
   */
  hasPropertyOfType<T>(
    obj: unknown,
    prop: string,
    type: 'string' | 'number' | 'boolean' | 'object'
  ): obj is T {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }
    return prop in obj && typeof (obj as any)[prop] === type;
  },
};

