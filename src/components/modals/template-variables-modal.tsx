// components/templates/template-variables-modal.tsx
/**
 * Template Variables Modal
 *
 * This modal appears when a user clicks "Use Template" on a template card.
 * It collects variable values from the user and then passes the pre-filled
 * content to the post creator modal.
 *
 * Flow:
 * 1. User clicks "Use Template" -> Opens this modal
 * 2. User fills in template variables
 * 3. User clicks "Continue to Post Creator"
 * 4. This modal closes and post creator modal opens with pre-filled content
 */

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Info,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Template } from "@/types";
import {
  useTemplateCreator,
  replaceTemplateVariables,
  areRequiredVariablesFilled,
  getMissingVariables,
} from "@/hooks/use-template-creator";
import toast from "react-hot-toast";

interface TemplateVariablesModalProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueToPostCreator: () => void;
}

export const TemplateVariablesModal: React.FC<TemplateVariablesModalProps> = ({
  template,
  open,
  onOpenChange,
  onContinueToPostCreator,
}) => {
  const [localVariableValues, setLocalVariableValues] = useState<
    Record<string, string>
  >({});
  const [showPreview, setShowPreview] = useState(false);

  const {
    setVariableValues,
    setPreFilledContent,
    setPreSelectedPlatforms,
    setSelectedTemplate,
  } = useTemplateCreator();

  // Early return if no template - MUST be before any hook that directly accesses template properties
  // Note: We cannot put this before hooks (useEffect, useMemo), so we guard inside them

  // Initialize default values when template changes
  useEffect(() => {
    if (template) {
      const defaults: Record<string, string> = {};
      template.variables?.forEach((variable) => {
        if (variable.default_value) {
          defaults[variable.name] = variable.default_value;
        }
      });
      setLocalVariableValues(defaults);
    }
  }, [template]);

  // Generate preview content - with null guard
  const previewContent = useMemo(() => {
    if (!template) return "";
    return replaceTemplateVariables(
      template.content_template,
      localVariableValues,
    );
  }, [template, localVariableValues]);

  // Form validation - with null guards to prevent crashes
  const isFormValid = useMemo(() => {
    if (!template) return false;
    return areRequiredVariablesFilled(template, localVariableValues);
  }, [template, localVariableValues]);

  const missingVariables = useMemo(() => {
    if (!template) return [];
    return getMissingVariables(template, localVariableValues);
  }, [template, localVariableValues]);

  // Now safe to return null after all hooks have been called
  if (!template) return null;

  const handleVariableChange = (name: string, value: string) => {
    setLocalVariableValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    if (!isFormValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check for unfilled template variables (only {word} patterns, not general braces)
    if (/\{[a-zA-Z_][a-zA-Z0-9_]*\}/.test(previewContent)) {
      toast.error("Some variables are still unfilled");
      return;
    }

    // Store data in the template creator state
    setSelectedTemplate(template);
    setVariableValues(localVariableValues);
    setPreFilledContent(previewContent);
    setPreSelectedPlatforms(template.supported_platforms);

    // Close this modal
    onOpenChange(false);

    // Open post creator modal
    onContinueToPostCreator();

    // Reset local state
    setLocalVariableValues({});
    setShowPreview(false);

    toast.success("Template loaded! Customize your post below.");
  };

  const handleCancel = () => {
    setLocalVariableValues({});
    setShowPreview(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: template.color_scheme + "20" }}
            >
              {template.category === "product_launch"
                ? "🚀"
                : template.category === "event_promotion"
                  ? "📅"
                  : template.category === "blog_post"
                    ? "📝"
                    : template.category === "engagement"
                      ? "💬"
                      : template.category === "educational"
                        ? "💡"
                        : template.category === "promotional"
                          ? "🎁"
                          : template.category === "seasonal"
                            ? "🎄"
                            : template.category === "announcement"
                              ? "📢"
                              : template.category === "behind_scenes"
                                ? "🎬"
                                : template.category === "user_generated"
                                  ? "📸"
                                  : template.category === "testimonial"
                                    ? "⭐"
                                    : template.category === "inspirational"
                                      ? "✨"
                                      : "📄"}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">
                {template.name}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                {template.description ||
                  "Fill in the variables below to customize your post"}
              </DialogDescription>

              {/* Platforms supported */}
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="text-xs">
                  {template.category.replace("_", " ")}
                </Badge>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600">
                  {template.supported_platforms.length} platform
                  {template.supported_platforms.length !== 1 ? "s" : ""}{" "}
                  supported
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    How it works
                  </p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Fill in the template variables below. Once complete, you'll
                    be taken to the post creator where you can customize the
                    content further, add media, select specific platforms, and
                    schedule your post.
                  </p>
                </div>
              </div>
            </div>

            {/* Variables Form */}
            {template.variables && template.variables.length > 0 ? (
              <div>
                <Label className="text-base font-semibold mb-4 block">
                  Template Variables
                  <span className="text-xs text-gray-500 ml-2 font-normal">
                    ({template.variables.filter((v) => v.required).length}{" "}
                    required)
                  </span>
                </Label>
                <div className="space-y-4">
                  {template.variables.map((variable, idx) => (
                    <div
                      key={variable.name}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all",
                        localVariableValues[variable.name]
                          ? "border-green-200 bg-green-50/30"
                          : variable.required
                            ? "border-amber-200 bg-amber-50/30"
                            : "border-gray-200 bg-white",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Label
                          htmlFor={variable.name}
                          className="flex items-center gap-2 font-medium"
                        >
                          {variable.label}
                          {variable.required && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] px-1.5 py-0"
                            >
                              Required
                            </Badge>
                          )}
                        </Label>
                        {localVariableValues[variable.name]?.trim() && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </div>

                      {variable.type === "text" || variable.type === "url" ? (
                        variable.placeholder.length > 50 ? (
                          <Textarea
                            id={variable.name}
                            placeholder={variable.placeholder}
                            value={localVariableValues[variable.name] || ""}
                            onChange={(e) =>
                              handleVariableChange(
                                variable.name,
                                e.target.value,
                              )
                            }
                            className="min-h-[100px] text-sm"
                          />
                        ) : (
                          <Input
                            id={variable.name}
                            type={variable.type === "url" ? "url" : "text"}
                            placeholder={variable.placeholder}
                            value={localVariableValues[variable.name] || ""}
                            onChange={(e) =>
                              handleVariableChange(
                                variable.name,
                                e.target.value,
                              )
                            }
                            className="text-sm"
                          />
                        )
                      ) : variable.type === "date" ? (
                        <Input
                          id={variable.name}
                          type="date"
                          value={localVariableValues[variable.name] || ""}
                          onChange={(e) =>
                            handleVariableChange(variable.name, e.target.value)
                          }
                          className="text-sm"
                        />
                      ) : variable.type === "number" ? (
                        <Input
                          id={variable.name}
                          type="number"
                          placeholder={variable.placeholder}
                          value={localVariableValues[variable.name] || ""}
                          onChange={(e) =>
                            handleVariableChange(variable.name, e.target.value)
                          }
                          className="text-sm"
                        />
                      ) : (
                        <Input
                          id={variable.name}
                          placeholder={variable.placeholder}
                          value={localVariableValues[variable.name] || ""}
                          onChange={(e) =>
                            handleVariableChange(variable.name, e.target.value)
                          }
                          className="text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl border-2 border-dashed border-gray-300">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  This template has no variables
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click continue to start customizing your post
                </p>
              </div>
            )}

            {/* Preview Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">
                  Content Preview
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="gap-2"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Show
                    </>
                  )}
                </Button>
              </div>

              {showPreview && (
                <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {previewContent}
                  </p>

                  {/* Show unfilled variables warning */}
                  {previewContent.includes("{") && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          Variables in{" "}
                          <code className="bg-amber-100 px-1 rounded">
                            {"{"}curly braces{"}"}
                          </code>{" "}
                          need to be filled in the form above
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Validation Messages */}
            {missingVariables.length > 0 && (
              <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-900 mb-2">
                      Please fill in the following required fields:
                    </p>
                    <ul className="text-xs text-red-700 space-y-1">
                      {missingVariables.map((varName) => (
                        <li key={varName} className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-red-500"></span>
                          {varName}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!isFormValid}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
          >
            <span>Continue to Post Creator</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
