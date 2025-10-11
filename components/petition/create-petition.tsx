import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/constants";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import * as z from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { CustomField } from "../ui/form-field";
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from "sonner";

const CreatePetitionForm = ({ onSuccess }: { onSuccess: () => void }) => {

  const Formschema = z.object({
    title: z.string().max(100, "Title must be at most 100 characters").nonempty("Title is required"),
    description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description must be at most 2000 characters").nonempty("Description is required"),
    imageUrl: z.string().url("Must be a valid URL").nonempty("Image URL is required"),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start date" }).nonempty("Start date is required"),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end date" }).nonempty("End date is required")
  });

  type FormData = z.infer<typeof Formschema>;

  const formData = useForm<FormData>({
    resolver: zodResolver(Formschema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      startDate: '',
      endDate: ''
    }
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      formData.reset();
      onSuccess();
      toast.success("Petition has been created", {
        description: "Your petition is now live on the blockchain.",
      });
    }
  }, [isSuccess]);

  const handleSubmit = (formData: FormData) => {

    const startTimestamp = Math.floor(new Date(formData.startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(formData.endDate).getTime() / 1000);

    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'createPetition',
      args: [
        formData.title,
        formData.description,
        formData.imageUrl,
        BigInt(startTimestamp),
        BigInt(endTimestamp)
      ]
    });
  };

  return (
    <Card className="max-w-2xl mx-auto hover:shadow-lg transition-shadow bg-black/10">
      <CardHeader>
        <CardTitle>Create New Petition</CardTitle>
        <CardDescription>Start a petition and gather support for your cause</CardDescription>
      </CardHeader>
      <Form {...formData} >
        <form className="space-y-4" onSubmit={formData.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">

            <CustomField
              primary
              name="title"
              label="Title"
              control={formData.control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter petition title"
                />
              )}
            />

            <CustomField
              primary
              name="description"
              label="Description"
              control={formData.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Describe your petition in detail"
                  rows={5}
                />
              )}
            />

            <CustomField
              primary
              name="imageUrl"
              label="Image URL"
              control={formData.control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                />
              )}
            />

            <CustomField
              primary
              name="startDate"
              label="Start Date"
              control={formData.control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                />
              )}
            />

            <CustomField
              primary
              name="endDate"
              label="End Date"
              control={formData.control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                />
              )}
            />

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Petition'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default CreatePetitionForm;