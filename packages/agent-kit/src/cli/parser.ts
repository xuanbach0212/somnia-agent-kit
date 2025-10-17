/**
 * Command Parsing Logic
 * Parse command-line arguments
 */

export interface ParsedArgs {
  command?: string;
  options: Record<string, any>;
  positional: string[];
}

/**
 * Parse command-line arguments
 * @param args Array of argument strings
 * @returns Parsed arguments
 *
 * @example
 * parseArgs(['create', '--name', 'myagent', '--model', 'gpt-4'])
 * // Returns: {
 * //   command: 'create',
 * //   options: { name: 'myagent', model: 'gpt-4' },
 * //   positional: []
 * // }
 */
export function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    options: {},
    positional: [],
  };

  if (args.length === 0) {
    return result;
  }

  // First argument is the command
  result.command = args[0];

  // Parse remaining arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      // Long option: --name value
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('-')) {
        result.options[key] = value;
        i++; // Skip next argument
      } else {
        result.options[key] = true;
      }
    } else if (arg.startsWith('-')) {
      // Short option: -n value
      const key = arg.slice(1);
      const value = args[i + 1];
      if (value && !value.startsWith('-')) {
        result.options[key] = value;
        i++; // Skip next argument
      } else {
        result.options[key] = true;
      }
    } else {
      // Positional argument
      result.positional.push(arg);
    }
  }

  return result;
}

/**
 * Parse boolean flag
 * @param value Value to parse
 * @returns Boolean value
 */
export function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }
  return Boolean(value);
}

/**
 * Parse number value
 * @param value Value to parse
 * @returns Number value or undefined if invalid
 */
export function parseNumber(value: any): number | undefined {
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}
