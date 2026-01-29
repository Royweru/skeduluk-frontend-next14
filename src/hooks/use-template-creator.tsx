// hooks/use-template-creator.ts
/**
 * Custom hook to manage the flow from templates to post creator modal
 * This hook handles:
 * - Storing template data when "Use Template" is clicked
 * - Passing pre-filled data to the post creator modal
 * - Managing the modal state transitions
 */

import { create } from "zustand";
import { Template } from "@/types";

interface TemplateCreatorState {
  // Template being used
  selectedTemplate: Template | null;

  // Variable values filled by user
  variableValues: Record<string, string>;

  // Pre-selected platforms from template
  preSelectedPlatforms: string[];

  // Pre-filled content (after variable replacement)
  preFilledContent: string;

  // Whether to show the post creator modal
  showPostCreator: boolean;

  // Actions
  setSelectedTemplate: (template: Template | null) => void;
  setVariableValues: (values: Record<string, string>) => void;
  setPreSelectedPlatforms: (platforms: string[]) => void;
  setPreFilledContent: (content: string) => void;
  setShowPostCreator: (show: boolean) => void;
  reset: () => void;
}

export const useTemplateCreator = create<TemplateCreatorState>((set) => ({
  selectedTemplate: null,
  variableValues: {},
  preSelectedPlatforms: [],
  preFilledContent: "",
  showPostCreator: false,

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  setVariableValues: (values) => set({ variableValues: values }),
  setPreSelectedPlatforms: (platforms) =>
    set({ preSelectedPlatforms: platforms }),
  setPreFilledContent: (content) => set({ preFilledContent: content }),
  setShowPostCreator: (show) => set({ showPostCreator: show }),

  reset: () =>
    set({
      selectedTemplate: null,
      variableValues: {},
      preSelectedPlatforms: [],
      preFilledContent: "",
      showPostCreator: false,
    }),
}));

/**
 * Helper function to replace variables in template content
 */
export function replaceTemplateVariables(
  template: string,
  values: Record<string, string>,
): string {
  let result = template;

  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(regex, value || `{${key}}`);
  });

  return result;
}

/**
 * Helper function to check if all required variables are filled
 */
export function areRequiredVariablesFilled(
  template: Template,
  values: Record<string, string>,
): boolean {
  const requiredVariables = template.variables?.filter((v) => v.required) || [];

  return requiredVariables.every((variable) => values[variable.name]?.trim());
}

/**
 * Helper function to get missing variables
 */
export function getMissingVariables(
  template: Template,
  values: Record<string, string>,
): string[] {
  const requiredVariables = template.variables?.filter((v) => v.required) || [];

  return requiredVariables
    .filter((variable) => !values[variable.name]?.trim())
    .map((variable) => variable.label);
}
