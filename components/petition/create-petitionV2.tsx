import React, { useState, useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { uploadFile, uploadMetadata } from "@/lib/ipfs";
import { CONTRACT_ABI_V2, CONTRACT_ADDRESS, PetitionCategory } from "@/constants/petition";
import { publicClient } from "@/lib/wagmi-client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { CustomField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import useTheme from "@/stores/theme";
import { confirmToast } from "@/components/global/confirmToast";
import { getReadableError, isUserRejected } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import Image from "next/image";
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, X, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ConfirmDialog } from "../global/custom-confirmDialog";

const STEPS = [
  { id: 1, title: "Basic Info", description: "Title & Description" },
  { id: 2, title: "Details", description: "Category & Timeline" },
  { id: 3, title: "Media", description: "Images & Documents" },
  { id: 4, title: "Review", description: "Final Check" },
];

const FormSchema = z
  .object({
    titlePetition: z.string().min(10, "Title must be at least 10 characters").max(100, "Title too long"),
    richText: z.string().min(50, "Description must be at least 50 characters").max(10000, "Description too long"),
    category: z.string().min(1, "Please select a category"),
    startDate: z.string().refine((date) => {
      const selectedDate = new Date(date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return selectedDate >= now;
    }, "Start date must be today or in the future"),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid end date"),
    targetSignatures: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 2, "Minimum target is 2 signatures"),
    tags: z.string(),
    image: z
      .instanceof(File, { message: "Image is required" })
      .refine((file) => file.size <= 500 * 1024, "Image must be less than 500KB")
      .refine(
        (file) => ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type),
        "Only JPEG, PNG, JPG, or WebP images are allowed"
      ),
    documents: z
      .array(z.instanceof(File))
      .optional()
      .refine((files) => !files || files.every((f) => f.size <= 500 * 1024), "Each document < 500KB")
      .refine((files) => !files || files.length <= 5, "Maximum 5 documents allowed"),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type PetitionFormValues = z.infer<typeof FormSchema>;

const CreatePetitionFormV2 = ({ onSuccess }: { onSuccess?: (tokenId: string) => void }) => {
  const { setLoading, setLoadingMessage, setLoadingDescription } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parsedTags, setParsedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirm, setisConfirm] = useState(false);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });
  const [waitingForEvent, setWaitingForEvent] = useState(false);

  const form = useForm<PetitionFormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    shouldUnregister: false, // <--- penting agar nilai tidak hilang antar step
    defaultValues: {
      titlePetition: "",
      richText: "",
      category: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      targetSignatures: "100",
      tags: "",
      image: undefined,
      documents: undefined,
    },
  });

  // === Utility functions ===
  const handleTagsChange = (val: string) => {
    const tags = val.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 10);
    setParsedTags(tags);
  };

  const handleImageChange = (file?: File) => {
    if (!file) return setImagePreview(null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateStep = async () => {
    const fields: Record<number, (keyof PetitionFormValues)[]> = {
      1: ["titlePetition", "richText"],
      2: ["category", "startDate", "endDate", "targetSignatures", "tags"],
      3: ["image"],
    };
    return form.trigger(fields[currentStep] || []);
  };

  const handleNext = async () => {
    if (await validateStep()) setCurrentStep((s) => Math.min(s + 1, STEPS.length));
    else toast.error("Please fill all required fields correctly");
  };

  const handlePrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const removeDocument = (i: number) => {
    const docs = form.getValues("documents") || [];
    form.setValue("documents", docs.filter((_, idx) => idx !== i));
  };

  const removeImage = () => {
    form.setValue("image", new File([], ""));
    setImagePreview(null);
  };

  const handlePublish = async (data: PetitionFormValues) => {
    setisConfirm(false);
    try {
      setIsSubmitting(true);
      setLoading(true);
      setLoadingMessage("Creating Petition...");
      setLoadingDescription("Uploading to IPFS and block chain");

      const { gatewayUrl: gatewayUrlImage } = await uploadFile(data.image);
      const documentMetadata =
        data.documents?.length
          ? await Promise.all(
            data.documents.map(async (doc) => {
              const { url } = await uploadFile(doc);
              return { name: doc.name, url, uploadedAt: Date.now() };
            })
          )
          : [];

      const metadata = {
        name: data.titlePetition,
        description: data.richText,
        image: gatewayUrlImage,
        petitionData: {
          richTextContent: data.richText,
          category: PetitionCategory[parseInt(data.category)],
          tags: parsedTags,
          documents: documentMetadata,
          targetSignatures: data.targetSignatures,
          startDate: data.startDate,
          endDate: data.endDate,
        },
      };

      const { url } = await uploadMetadata(metadata);
      const start = Math.floor(new Date(data.startDate).getTime() / 1000);
      const end = Math.floor(new Date(data.endDate).getTime() / 1000);

      setWaitingForEvent(true);
      setLoadingMessage("Transaction in Progress...");
      setLoadingDescription("Waiting for blockchain confirmation");

      // writeContract will handle errors via useEffect(writeError)
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI_V2,
        functionName: "createPetition",
        args: [url, Number(data.category), parsedTags, BigInt(start), BigInt(end), BigInt(data.targetSignatures || 0)],
      });
    } catch (err) {
      // This only catches IPFS upload errors, not writeContract errors
      console.log("IPFS or preparation error:", err);

      const friendlyMsg = getReadableError(err);
      toast.error("Upload Failed", {
        description: friendlyMsg
      });

      // Reset all loading states immediately on error
      setIsSubmitting(false);
      setLoading(false);
      setWaitingForEvent(false);
      setLoadingMessage("");
      setLoadingDescription("");
    }
  };

  // === Effects ===
  // Listen to PetitionCreated event from smart contract
  useEffect(() => {
    if (!hash || !isSuccess) return;

    const listenForEvent = async () => {
      try {
        setLoadingMessage("Waiting for Event...");
        setLoadingDescription("Listening to smart contract event PetitionCreated");

        const unwatch = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI_V2,
          eventName: "PetitionCreated",
          onLogs: (logs: any[]) => {
            const log = logs[0];
            if (log && log.transactionHash === hash) {
              const tokenId = log.args.tokenId?.toString();

              toast.success("Petition created successfully!", {
                description: `Your petition #${tokenId} is live on blockchain.`
              });

              form.reset();
              setParsedTags([]);
              setCurrentStep(1);
              setImagePreview(null);
              setLoading(false);
              setIsSubmitting(false);
              setWaitingForEvent(false);

              if (onSuccess && tokenId) onSuccess(tokenId);
              unwatch();
            }
          },
        });

        // Timeout after 30 seconds
        setTimeout(() => {
          unwatch();
          if (waitingForEvent) {
            toast.warning("Event timeout", {
              description: "Transaction confirmed but event not received. Please refresh."
            });
            setLoading(false);
            setIsSubmitting(false);
            setWaitingForEvent(false);
          }
        }, 30000);
      } catch (err) {
        console.error("Error listening for event:", err);
        setLoading(false);
        setIsSubmitting(false);
        setWaitingForEvent(false);
      }
    };

    listenForEvent();
  }, [hash, isSuccess, form, onSuccess, setLoading, waitingForEvent]);

  useEffect(() => {
    if (writeError) {
      console.log("Write error detected:", writeError); // Debug log

      const errorMsg = writeError?.message || "";
      const isRejected = errorMsg.includes("User rejected") ||
        errorMsg.includes("user rejected") ||
        errorMsg.includes("User denied") ||
        (writeError as any)?.code === 4001 ||
        (writeError as any)?.code === "ACTION_REJECTED";

      if (isRejected) {
        toast.info("Transaction Cancelled", {
          description: "You cancelled the transaction."
        });
      } else {
        const friendlyMsg = getReadableError(writeError);
        toast.error("Transaction Failed", {
          description: friendlyMsg
        });
      }

      // Reset all loading states on write error
      setIsSubmitting(false);
      setLoading(false);
      setWaitingForEvent(false);
      setLoadingMessage("");
      setLoadingDescription("");
    }
  }, [writeError, setLoading, setLoadingMessage, setLoadingDescription]);

  const isLoading = isPending || isConfirming || isSubmitting;
  const values = form.getValues();

  // === Step sections rendered but hidden (prevent unmount) ===
  const StepSections = (
    <div className="">
      {/* Step 1 */}
      <div className={currentStep === 1 ? "block space-y-4" : "hidden"}>
        <CustomField
          primary
          name="titlePetition"
          label="Petition Title"
          control={form.control}
          render={({ field }) => <Input {...field} placeholder="Your petition title..." />}
        />
        <CustomField
          primary
          name="richText"
          label="Description"
          control={form.control}
          render={({ field }) => (
            <Textarea {...field} placeholder="Explain your petition in detail..." rows={8} />
          )}
        />
      </div>

      {/* Step 2 */}
      <div className={currentStep === 2 ? "block space-y-4" : "hidden"}>
        <CustomField
          primary
          name="category"
          label="Category"
          control={form.control}
          render={({ field }) => (
            <Select
              onValueChange={(id) => {
                form.setValue("category", id);
                field.onChange(id);
              }}
              value={field.value || ""}
            >
              <SelectTrigger className="w-full px-4 py-2 border rounded-lg bg-background">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PetitionCategory.map((cat, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <CustomField
            primary
            name="startDate"
            label="Start Date"
            control={form.control}
            render={({ field }) => <Input {...field} type="date" />}
          />
          <CustomField
            primary
            name="endDate"
            label="End Date"
            control={form.control}
            render={({ field }) => <Input {...field} type="date" />}
          />
        </div>
        <CustomField
          primary
          name="targetSignatures"
          label="Target Signatures"
          control={form.control}
          render={({ field }) => <Input {...field} type="number" min="2" placeholder="e.g. 1000" />}
        />
        <CustomField
          name="tags"
          label="Tags (comma-separated)"
          control={form.control}
          render={({ field }) => (
            <>
              <Input
                {...field}
                placeholder="education, environment..."
                onChange={(e) => {
                  field.onChange(e);
                  handleTagsChange(e.target.value);
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {parsedTags.map((tag, i) => (
                  <Badge key={i}>#{tag}</Badge>
                ))}
              </div>
            </>
          )}
        />
      </div>

      {/* Step 3 */}
      <div className={currentStep === 3 ? "block space-y-4" : "hidden"}>
        <CustomField
          name="image"
          label="Upload Cover Image (Max 500KB)"
          control={form.control}
          render={({ field: { value, onChange } }) => (
            <div className="space-y-3">
              {!imagePreview ? (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size <= 500 * 1024) {
                      onChange(file);
                      handleImageChange(file);
                    } else toast.error("Invalid file size");
                  }}
                />
              ) : (
                <div className="relative">
                  <Image width={500} height={500} src={imagePreview} alt="Preview" className="rounded-md w-full h-64 object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        />

        <CustomField
          name="documents"
          label="Supporting Documents (optional)"
          control={form.control}
          render={({ field: { value, onChange } }) => (
            <div className="space-y-3">
              <Input
                type="file"
                multiple
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  onChange([...(value || []), ...files]);
                }}
              />
              {(value || []).length > 0 && (
                <div className="space-y-2">
                  {(value || []).map((f: File, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{f.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeDocument(i)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        />
      </div>

      {/* Step 4 (Review) */}
      <div className={currentStep === 4 ? "block space-y-4" : "hidden"}>
        <div className="rounded-lg border p-6 space-y-6 bg-muted/10">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Review Your Petition</h3>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Cover Image</p>
              <div className="rounded-lg overflow-hidden border">
                <Image
                  width={500}
                  height={300}
                  src={imagePreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Title</p>
              <p className="font-semibold text-lg">{values.titlePetition}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
              <div className="text-sm bg-background p-4 rounded-lg border max-h-32 overflow-y-auto">
                {values.richText}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                <Badge variant="outline" className="mt-1">
                  {values.category ? PetitionCategory[parseInt(values.category)] : '-'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Target Signatures</p>
                <p className="text-sm font-semibold">{values.targetSignatures} signatures</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Start Date</p>
                <p className="text-sm">{new Date(values.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">End Date</p>
                <p className="text-sm">{new Date(values.endDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </div>

            {parsedTags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {parsedTags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">#{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {values.documents && (values.documents as File[]).length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Supporting Documents</p>
                <div className="space-y-2">
                  {(values.documents as File[]).map((doc: File, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-background border">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{(doc.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      <Card className="max-w-4xl mx-auto bg-black/10">
        <CardHeader>
          <CardTitle>Create New Petition</CardTitle>
          <CardDescription>Complete all steps to publish your petition.</CardDescription>
        </CardHeader>
        <div className="px-6">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${currentStep >= s.id ? "border-primary text-primary" : "border-muted text-muted-foreground"
                      }`}
                  >
                    {currentStep > s.id ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <p className="text-sm mt-1">{s.title}</p>
                </div>
                {i < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-muted mx-2" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Separator />

        <Form {...form}>
          <CardContent>{StepSections}</CardContent>
          <Separator />
          <CardFooter className="flex justify-between">
            <Button onClick={handlePrev} variant="outline" disabled={currentStep === 1 || isLoading}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                if (currentStep < STEPS.length) {
                  handleNext();
                } else {
                  setisConfirm(true);
                }
              }}
              disabled={isLoading}
            >
              {currentStep < STEPS.length ? (
                <>
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : isLoading ? (
                "Processing..."
              ) : (
                "Publish Petition 🚀"
              )}
            </Button>
          </CardFooter>
        </Form>
      </Card>

      <ConfirmDialog
        variant="warning"
        title="🚀 Ready to Publish?"
        description="Your petition will be permanently stored on the blockchain. This action is irreversible and will require a transaction fee."
        confirmLabel="Yes, Publish Now"
        cancelLabel="Not Yet"
        open={isConfirm}
        onCancel={() => setisConfirm(false)}
        onConfirm={() => {
          setisConfirm(false);
          form.handleSubmit(handlePublish)();
        }}
      />
    </>
  );
};

export default CreatePetitionFormV2;
