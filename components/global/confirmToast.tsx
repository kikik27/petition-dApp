import { toast } from "sonner";

export async function confirmToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    toast(message, {
      description:
        "After creating, you CANNOT edit. You can only add progress updates.",
      action: {
        label: "Confirm",
        onClick: () => {
          resolve(true);
          toast.dismiss();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          resolve(false);
          toast.dismiss();
        },
      },
      duration: Infinity,
    });
  });
}
