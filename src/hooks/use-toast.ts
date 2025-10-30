import { toast } from "sonner"

export const useToast = () => {
  return {
    // Default toast
    toast: (message: string, description?: string) =>
      toast(message, { description }),

    // Variants for convenience
    successToast: (message: string, description?: string) =>
      toast.success(message, { description }),

    errorToast: (message: string, description?: string) =>
      toast.error(message, { description }),

    infoToast: (message: string, description?: string) =>
      toast.info(message, { description }),

    warningToast: (message: string, description?: string) =>
      toast.warning(message, { description }),
  }
}


export const successToast = (message: string, description?: string) =>
  toast.success(message, { description }),

export const errorToast = (message: string, description?: string) =>
  toast.error(message, { description }),

export const infoToast = (message: string, description?: string) =>
  toast.info(message, { description }),

export const warningToast = (message: string, description?: string) =>
  toast.warning(message, { description }),