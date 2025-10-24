"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RobotLottie } from "../lottie/lottieAnim";
import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "warning" | "danger" | "success" | "info";
}

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmDialogProps) {

  // Variant configurations
  const variantConfig = {
    default: {
      icon: <Sparkles className="w-12 h-12 text-purple-500" />,
      iconBg: "bg-purple-500/10",
      iconRing: "ring-purple-500/20",
      buttonClass: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30",
      titleColor: "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400",
    },
    warning: {
      icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
      iconBg: "bg-yellow-500/10",
      iconRing: "ring-yellow-500/20",
      buttonClass: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg shadow-yellow-500/30",
      titleColor: "text-yellow-400",
    },
    danger: {
      icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
      iconBg: "bg-red-500/10",
      iconRing: "ring-red-500/20",
      buttonClass: "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/30",
      titleColor: "text-red-400",
    },
    success: {
      icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
      iconBg: "bg-green-500/10",
      iconRing: "ring-green-500/20",
      buttonClass: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/30",
      titleColor: "text-green-400",
    },
    info: {
      icon: <Info className="w-12 h-12 text-blue-500" />,
      iconBg: "bg-blue-500/10",
      iconRing: "ring-blue-500/20",
      buttonClass: "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30",
      titleColor: "text-blue-400",
    },
  };

  const config = variantConfig[variant];

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700/50 text-gray-100 animate-in fade-in-0 zoom-in-95 duration-300 shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 animate-pulse" />

        {/* Content */}
        <div className="relative">
          <DialogHeader className="space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className={`relative ${config.iconBg} ${config.iconRing} ring-2 rounded-full p-4 animate-in zoom-in-50 duration-500`}>
                {/* Animated rings */}
                <div className={`absolute inset-0 ${config.iconBg} rounded-full animate-ping opacity-30`} />
                <div className="relative">
                  {config.icon}
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center space-y-2 px-4">
              {title && (
                <DialogTitle className={`text-2xl font-bold ${config.titleColor} animate-in slide-in-from-top-4 duration-500`}>
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription className="text-gray-400 text-sm leading-relaxed animate-in slide-in-from-bottom-4 duration-500">
                  {description}
                </DialogDescription>
              )}
            </div>
          </DialogHeader>

          <DialogFooter className="flex flex-row justify-between gap-3 pt-6 animate-in slide-in-from-bottom-8 duration-700">
            <Button
              variant="outline"
              className="flex-1 border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-300 hover:scale-105"
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
            <Button
              className={`flex-1 ${config.buttonClass} transition-all duration-300 hover:scale-105 font-semibold`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
