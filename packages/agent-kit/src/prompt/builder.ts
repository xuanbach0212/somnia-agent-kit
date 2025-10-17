/**
 * Prompt Builder
 * Dynamic prompt building from templates with placeholder replacement
 */

import type { PromptTemplate } from './templates';
import { getTemplate } from './templates';

/**
 * Build options
 */
export interface BuildOptions {
  strict?: boolean; // Throw error on missing variables (default: false)
  trim?: boolean; // Trim whitespace (default: true)
  maxLength?: number; // Max prompt length (default: unlimited)
  sanitize?: boolean; // Sanitize inputs (default: true)
}

/**
 * Build prompt from template string and data
 * Supports both {{variable}} and ${variable} syntax
 *
 * @param template Template string with placeholders
 * @param data Data to inject into template
 * @param options Build options
 * @returns Built prompt
 */
export function buildPrompt(
  template: string,
  data: Record<string, any>,
  options: BuildOptions = {}
): string {
  const {
    strict = false,
    trim = true,
    maxLength,
    sanitize = true,
  } = options;

  let result = template;

  // Sanitize data if enabled
  const sanitizedData = sanitize ? sanitizeData(data) : data;

  // Replace {{variable}} placeholders
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = sanitizedData[key.trim()];

    if (value === undefined || value === null) {
      if (strict) {
        throw new Error(`Missing required variable: ${key}`);
      }
      return ''; // Replace with empty string
    }

    return String(value);
  });

  // Replace ${variable} placeholders
  result = result.replace(/\$\{(\w+)\}/g, (match, key) => {
    const value = sanitizedData[key.trim()];

    if (value === undefined || value === null) {
      if (strict) {
        throw new Error(`Missing required variable: ${key}`);
      }
      return '';
    }

    return String(value);
  });

  // Handle conditional blocks: {{#if variable}}...{{/if}}
  result = result.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, key, content) => {
      const value = sanitizedData[key.trim()];
      return value ? content : '';
    }
  );

  // Trim if enabled
  if (trim) {
    result = result.trim();
    // Also collapse multiple newlines into max 2
    result = result.replace(/\n{3,}/g, '\n\n');
  }

  // Enforce max length
  if (maxLength && result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  return result;
}

/**
 * Build prompt from named template
 *
 * @param templateName Name of template
 * @param data Data to inject
 * @param options Build options
 * @returns Built prompt
 */
export function buildFromTemplate(
  templateName: string,
  data: Record<string, any>,
  options: BuildOptions = {}
): string {
  const template = getTemplate(templateName);

  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }

  return buildPrompt(template.template, data, options);
}

/**
 * Compose multiple prompts together
 *
 * @param prompts Array of prompts to compose
 * @param separator Separator between prompts (default: double newline)
 * @returns Composed prompt
 */
export function composePrompts(
  prompts: string[],
  separator: string = '\n\n'
): string {
  return prompts.filter((p) => p && p.length > 0).join(separator);
}

/**
 * Inject context into prompt
 *
 * @param prompt Base prompt
 * @param context Context to inject
 * @param position Position to inject ('start' | 'end', default: 'end')
 * @returns Prompt with context
 */
export function injectContext(
  prompt: string,
  context: Record<string, any>,
  position: 'start' | 'end' = 'end'
): string {
  const contextStr = formatContext(context);

  if (position === 'start') {
    return `${contextStr}\n\n${prompt}`;
  } else {
    return `${prompt}\n\n${contextStr}`;
  }
}

/**
 * Format context as readable text
 *
 * @param context Context object
 * @returns Formatted context string
 */
export function formatContext(context: Record<string, any>): string {
  const lines = ['Context:'];

  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined && value !== null) {
      const formatted = formatValue(value);
      lines.push(`- ${key}: ${formatted}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format value for display
 */
function formatValue(value: any): string {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

/**
 * Sanitize data to prevent injection
 *
 * @param data Data to sanitize
 * @returns Sanitized data
 */
export function sanitizeData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      sanitized[key] = value;
      continue;
    }

    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      sanitized[key] = value
        .replace(/[\x00-\x1F\x7F]/g, '') // Control characters
        .trim();
    } else if (typeof value === 'object') {
      // Recursively sanitize objects
      if (Array.isArray(value)) {
        sanitized[key] = value.map((v) =>
          typeof v === 'object' ? sanitizeData(v) : v
        );
      } else {
        sanitized[key] = sanitizeData(value);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate template variables
 *
 * @param template Template to validate
 * @param data Data to check against
 * @returns Validation result with missing variables
 */
export function validateTemplate(
  template: PromptTemplate | string,
  data: Record<string, any>
): { valid: boolean; missing: string[] } {
  let variables: string[];

  if (typeof template === 'string') {
    // Extract variables from template string
    const matches = template.matchAll(/\{\{(\w+)\}\}/g);
    variables = Array.from(matches, (m) => m[1]);
  } else {
    variables = template.variables;
  }

  const missing = variables.filter(
    (v) => data[v] === undefined || data[v] === null
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Extract variables from template string
 *
 * @param template Template string
 * @returns Array of variable names
 */
export function extractVariables(template: string): string[] {
  const variables = new Set<string>();

  // Extract {{variable}}
  const matches1 = template.matchAll(/\{\{(\w+)\}\}/g);
  for (const match of matches1) {
    variables.add(match[1]);
  }

  // Extract ${variable}
  const matches2 = template.matchAll(/\$\{(\w+)\}/g);
  for (const match of matches2) {
    variables.add(match[1]);
  }

  // Extract from conditionals {{#if variable}}
  const matches3 = template.matchAll(/\{\{#if\s+(\w+)\}\}/g);
  for (const match of matches3) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Preview prompt with sample data
 *
 * @param templateName Template name
 * @returns Preview with example data
 */
export function previewTemplate(templateName: string): string {
  const template = getTemplate(templateName);

  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }

  const example = template.examples?.[0];

  if (!example) {
    return `Template: ${templateName}\nNo example data available.`;
  }

  const preview = buildPrompt(template.template, example);

  return `Template: ${templateName}\n\n${preview}`;
}

/**
 * Create custom prompt template
 *
 * @param name Template name
 * @param description Template description
 * @param template Template string
 * @returns PromptTemplate
 */
export function createTemplate(
  name: string,
  description: string,
  template: string
): PromptTemplate {
  const variables = extractVariables(template);

  return {
    name,
    description,
    template,
    variables,
  };
}
