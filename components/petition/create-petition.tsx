import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/constant";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { CheckCircle2 } from "lucide-react";
import * as z from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { CustomField } from "../ui/form-field";
import { zodResolver } from '@hookform/resolvers/zod';

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
    }
  }, [isSuccess, onSuccess]);

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
    <Card className="max-w-2xl mx-auto">
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

            


            {/* <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your petition in detail"
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div> */}


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