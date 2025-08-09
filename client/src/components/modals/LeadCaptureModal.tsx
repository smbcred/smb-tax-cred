/**
 * @file LeadCaptureModal.tsx
 * @description Lead capture modal for calculator results
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React Hook Form, Lead Service, Modal Components
 * @knowledgeBase Lead capture with email, company, phone validation and storage
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { leadService } from "@/services/api.service";
import { useToast } from "@/hooks/use-toast";
import { leadCaptureSchema, type LeadCaptureData } from "@shared/schema";
import { CalculationResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculationData: CalculationResult | null;
  onSuccess: (leadData: LeadCaptureData) => void;
}

export default function LeadCaptureModal({
  isOpen,
  onClose,
  calculationData,
  onSuccess,
}: LeadCaptureModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<LeadCaptureData>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: {
      email: "",
      companyName: "",
      phoneNumber: "",
    },
  });

  const leadMutation = useMutation({
    mutationFn: leadService.captureLead,
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your information has been saved. Redirecting to create your account...",
      });
      onSuccess(form.getValues());
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: LeadCaptureData) => {
    setIsSubmitting(true);
    try {
      await leadMutation.mutateAsync({
        ...data,
        calculationData,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-rd-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-file-alt text-rd-secondary-500 text-2xl"></i>
            </div>
            <DialogTitle className="text-xl font-semibold text-slate-900 mb-2">
              Get Your Complete Analysis
            </DialogTitle>
            <p className="text-slate-600">
              Enter your information to receive detailed results and next steps
            </p>
          </div>
        </DialogHeader>

        {calculationData && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-rd-primary-200">
            <div className="text-center">
              <div className="text-sm text-rd-primary-700 mb-1">Your Estimated Credit</div>
              <div className="text-2xl font-bold text-rd-primary-600">
                ${calculationData.federalCredit.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email" className="form-label">
              Business Email
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              {...form.register("email")}
              className={`form-input ${
                form.formState.errors.email ? "border-red-500" : ""
              }`}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="companyName" className="form-label">
              Company Name
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Your Company Inc."
              {...form.register("companyName")}
              className={`form-input ${
                form.formState.errors.companyName ? "border-red-500" : ""
              }`}
            />
            {form.formState.errors.companyName && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.companyName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phoneNumber" className="form-label">
              Phone Number
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="(555) 123-4567"
              {...form.register("phoneNumber")}
              className={`form-input ${
                form.formState.errors.phoneNumber ? "border-red-500" : ""
              }`}
            />
            {form.formState.errors.phoneNumber && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.phoneNumber.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || leadMutation.isPending}
            className="w-full btn-primary"
          >
            {isSubmitting || leadMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-arrow-right mr-2"></i>
                Get My Analysis
              </>
            )}
          </Button>
        </form>

        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-4 text-xs text-slate-500 mb-4">
            <div className="flex items-center">
              <i className="fas fa-shield-alt mr-1"></i>
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-clock mr-1"></i>
              <span>2-Minute Setup</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-check mr-1"></i>
              <span>No Spam</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            By submitting, you agree to our{" "}
            <a href="#" className="text-rd-primary-500 hover:underline">
              privacy policy
            </a>{" "}
            and{" "}
            <a href="#" className="text-rd-primary-500 hover:underline">
              terms of service
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
