// React Components for Petition NFT V2
import React, { useState, useEffect } from 'react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransaction, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { toast } from "sonner";
import ConntractABI from "@/abi/petitionV2.json"

import { uploadFile, uploadMetadata } from '@/lib/ipfs';
import { CONTRACT_ABI_V2, CONTRACT_ADDRESS, PetitionCategory } from "@/constants/petition";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import useTheme from '@/stores/theme';
import { confirmToast } from '../global/confirmToast';
import { getReadableError, isUserRejected } from '@/lib/utils';

const CreatePetitionFormV2 = ({ onSuccess }: { onSuccess?: (tokenId: string) => void }) => {
  const { setLoading, setLoadingMessage, setLoadingDescription } = useTheme();

  const FormSchema = z.object({
    title: z.string()
      .min(10, "Title must be at least 10 characters")
      .max(200, "Title must not exceed 200 characters"),

    richText: z.string()
      .min(50, "Description must be at least 50 characters")
      .max(10000, "Description must not exceed 10,000 characters"),

    category: z.string()
      .min(1, "Please select a category"),

    startDate: z.string()
      .refine((date) => {
        const selectedDate = new Date(date);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return selectedDate >= now;
      }, {
        message: "Start date must be today or in the future"
      }),

    endDate: z.string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid end date"
      }),

    targetSignatures: z.string()
      .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Target must be a positive number"
      })
      .refine(val => Number(val) >= 100, {
        message: "Minimum target is 100 signatures"
      }),

    tags: z.string(),

    // Image file upload
    image: z
      .instanceof(File, { message: "Image is required" })
      .refine((file) => file.size <= 500 * 1024, {
        message: "Image must be less than 500KB",
      })
      .refine(
        (file) =>
          ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
            file.type
          ),
        {
          message: "Only JPEG, PNG, JPG, or WebP images are allowed",
        }
      ),

    // Multiple document uploads (optional)
    documents: z.array(z.instanceof(File))
      .optional()
      .refine((files) => !files || files.every(file => file.size <= 500 * 1024), {
        message: "Each document must be less than 500KB"
      })
      .refine((files) => !files || files.length <= 5, {
        message: "Maximum 5 documents allowed"
      }),

  }).refine(data => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  }, {
    message: "End date must be after start date",
    path: ["endDate"]
  });

  // Type inference from schema
  type PetitionFormValues = z.infer<typeof FormSchema>;

  const form = useForm<PetitionFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      richText: '',
      category: '0',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      targetSignatures: '1000',
      tags: '',
      image: undefined,
      documents: undefined
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [parsedTags, setParsedTags] = useState<string[]>([]);

  // Wagmi hooks
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // Handle tags parsing
  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(t => t.trim()).filter(Boolean).slice(0, 10);
    setParsedTags(tags);
  };

  // Success handler
  useEffect(() => {
    if (isSuccess && hash) {
      form.reset();
      setParsedTags([]);
      setCurrentDraftId(null);

      setLoading(false);
      setLoadingMessage('');
      setLoadingDescription('');

      toast.success("Petition created successfully!", {
        description: "Your petition is now live on the blockchain.",
      });

      if (onSuccess) {
        onSuccess(hash);
      }
    }
  }, [isSuccess, hash]);

  // Error handler
  useEffect(() => {
    if (!writeError) return;
    const msg = getReadableError(writeError);
    setIsSubmitting(false);
    setLoading(false);
    setLoadingMessage("Transaction Failed");
    setLoadingDescription(msg);
    toast.error("Transaction failed", { description: msg });
    // eslint-disable-next-line no-console
    console.log(msg);
  }, [writeError]);


  const handlePublish = async (data: PetitionFormValues) => {
    const confirmed = confirmToast("⚠️ WARNING: Creating is IRREVERSIBLE!");
    if (!confirmed) return;

    try {
      setIsSubmitting(true);

      setLoading(true)
      setLoadingMessage("Creating Petition...");
      setLoadingDescription("Uploading to IPFS and blockchain");

      // Upload image to IPFS
      const { gatewayUrl: gatewayUrlImage } = await uploadFile(data.image);
  
      // Upload documents to IPFS
      const documentMetadata = data.documents && data.documents.length > 0
        ? await Promise.all(
          data.documents.map(async (doc: File) => {
            const { url } = await uploadFile(doc);
            return {
              name: doc.name,
              url,
              uploadedAt: Date.now()
            };
          })
        )
        : [];

      // Create metadata
      const metadata = {
        name: data.title,
        description: data.richText,
        image: gatewayUrlImage,
        petitionData: {
          richTextContent: data.richText,
          category: PetitionCategory[parseInt(data.category)],
          tags: parsedTags,
          documents: documentMetadata,
          targetSignatures: data.targetSignatures,
          startDate: data.startDate,
          endDate: data.endDate
        }
      };

      const { url } = await uploadMetadata(metadata);

      // Convert dates to timestamps
      const startTimestamp = Math.floor(new Date(data.startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(data.endDate).getTime() / 1000);

      setLoadingDescription("Uploading petition to blockchain...");

      const args = [
        url,
        0,
        parsedTags,
        BigInt(startTimestamp),
        BigInt(endTimestamp),
        data.targetSignatures ? BigInt(data.targetSignatures) : BigInt(0)
      ];

      // Call smart contract - Publish Petition
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI_V2,
        functionName: 'createPetition',
        args
      });

    } catch (error) {
      const readable = getReadableError(error);
      if (isUserRejected(error)) {
        toast.info("Transaction cancelled", { description: "You rejected the request." });
        setLoadingMessage("Transaction cancelled");
        setLoadingDescription("You rejected the wallet prompt.");
      } else {
        toast.error("Transaction failed", { description: readable });
        setLoadingMessage("Transaction Failed");
        setLoadingDescription(readable);
        console.error("Error creating petition:", error);
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false)
    }
  };

  const isLoading = isPending || isConfirming || isSubmitting;

  return (
    <Card className="max-w-4xl mx-auto hover:shadow-lg transition-shadow bg-black/10">
      <CardHeader>
        <CardTitle className="text-3xl">
          {currentDraftId ? 'Edit Draft' : 'Create New Petition'}
        </CardTitle>
        <CardDescription>
          Start a petition and gather support for your cause
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form className="space-y-4">
          <CardContent className="space-y-6">

            {/* Title */}
            <CustomField
              primary
              name="title"
              label="Petition Title"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter a clear and compelling title..."
                  maxLength={200}
                />
              )}
            />

            {/* Rich Text Description */}
            <CustomField
              primary
              name="richText"
              label="Petition Description"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Describe your petition in detail. Explain why this matters and what you hope to achieve..."
                  rows={8}
                  maxLength={10000}
                />
              )}
            />

            {/* Category */}
            <CustomField
              primary
              name="category"
              label="Category"
              control={form.control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                >
                  {PetitionCategory.map((cat, idx) => (
                    <option key={idx} value={idx}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <CustomField
                primary
                name="startDate"
                label="Start Date"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                  />
                )}
              />

              {/* End Date */}
              <CustomField
                primary
                name="endDate"
                label="End Date"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                  />
                )}
              />
            </div>

            {/* Target Signatures */}
            <CustomField
              primary
              name="targetSignatures"
              label="Target Signatures"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="100"
                  placeholder="e.g., 1000"
                />
              )}
            />

            {/* Tags */}
            <CustomField
              name="tags"
              label="Tags (Max 10)"
              control={form.control}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    placeholder="climate, environment, urgent (comma-separated)"
                    onChange={(e) => {
                      field.onChange(e);
                      handleTagsChange(e.target.value);
                    }}
                  />
                  {parsedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {parsedTags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            />

            {/* Cover Image Upload */}
            <CustomField
              name="image"
              label="Or Upload Cover Image (Max 500KB)"
              control={form.control}
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <>
                  <Input
                    {...fieldProps}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 500 * 1024) {
                          toast.error("Image must be less than 500KB");
                          e.target.value = '';
                          return;
                        }
                        onChange(file);
                      }
                    }}
                  />
                  {value && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {(value as File).name} ({((value as File).size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </>
              )}
            />

            {/* Supporting Documents */}
            <CustomField
              name="documents"
              label="Supporting Documents (Max 5 files, 500KB each)"
              control={form.control}
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <>
                  <Input
                    {...fieldProps}
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        const fileArray = Array.from(files).slice(0, 5);

                        // Validate file sizes
                        const invalidFiles = fileArray.filter(f => f.size > 500 * 1024);
                        if (invalidFiles.length > 0) {
                          toast.error("Each document must be less than 500KB");
                          e.target.value = '';
                          return;
                        }

                        onChange(fileArray);
                      }
                    }}
                  />
                  {value && (value as File[]).length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {(value as File[]).map((doc: File, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          📄 {doc.name} ({(doc.size / 1024).toFixed(1)} KB)
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            />

          </CardContent>

          <CardFooter className="flex gap-4">
            {/* Save as Draft Button */}
            <Button
              type="button"
              variant="outline"
              // onClick={form.handleSubmit(handleSaveDraft)}
              disabled={true}
              className="flex-1"
            >
              Draft (Coming Soon)
            </Button>

            {/* Publish Button */}
            <Button
              type="button"
              onClick={form.handleSubmit(handlePublish)}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : '🚀 Publish Petition'}
            </Button>
          </CardFooter>
        </form>
      </Form>

      <div className="px-6 pb-6">
        {/* <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Save as draft first to test, review carefully, then publish when ready.
          Published petitions cannot be edited!
        </p> */}
      </div>
    </Card>
  );
}

export default CreatePetitionFormV2;
