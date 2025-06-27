'use client';

import { useState, useRef } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createUploadUrl } from '@/app/actions/mux';
import { UploadCloud, FileVideo, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const categories = [ "Travel", "Tech", "Learning", "Comedy", "Gaming", "Documentary", "Cooking" ];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  category: z.string({ required_error: "Please select a category." }),
  videoFile: z.instanceof(File, { message: "A video file is required" }).refine(f => f.size > 0, "A video file is required"),
});

type FormData = z.infer<typeof formSchema>;
type UploadStatus = 'idle' | 'getting_url' | 'uploading' | 'success' | 'error';

export default function UploadPage() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    }
  });
  
  const selectedFile = form.watch('videoFile');

  const handleUpload: SubmitHandler<FormData> = async (data) => {
    setStatus('getting_url');
    setError(null);
    
    try {
      const { url: uploadUrl, error: createError } = await createUploadUrl({ title: data.title, category: data.category });
      if (createError || !uploadUrl) {
        throw new Error(createError || "Failed to get an upload URL.");
      }

      setStatus('uploading');
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open('PUT', uploadUrl, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setProgress(percentage);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            setStatus('success');
            setProgress(100);
        } else {
            setStatus('error');
            setError(`Upload failed with status: ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        setStatus('error');
        setError("An error occurred during the upload. Please try again.");
      };

      xhr.send(data.videoFile);

    } catch (e) {
      setStatus('error');
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMessage);
      toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
    }
  };

  const handleCancelOrReset = () => {
    if (xhrRef.current && (status === 'uploading' || status === 'getting_url')) {
      xhrRef.current.abort();
    }
    form.reset();
    setStatus('idle');
    setProgress(0);
    setError(null);
  };
  
  const renderFileArea = () => {
    switch(status) {
        case 'uploading':
        case 'getting_url':
            return (
                 <div className="text-center w-full">
                    <Loader className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-muted-foreground">
                        {status === 'uploading' ? `Uploading... ${progress}%` : 'Preparing upload...'}
                    </p>
                    <Progress value={progress} className="w-full mt-2" />
                </div>
            )
        case 'success':
            return (
                <div className="text-center text-green-500">
                    <CheckCircle className="mx-auto h-8 w-8 mb-2" />
                    <p className="font-semibold">Upload Complete</p>
                    <p className="text-sm">Your video is now being processed.</p>
                </div>
            )
        case 'error':
            return (
                 <div className="text-center text-destructive">
                    <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                    <p className="font-semibold">Upload Failed</p>
                    <p className="text-sm">{error}</p>
                </div>
            )
        default:
             return selectedFile ? (
                <div className="text-center">
                    <FileVideo className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 font-semibold">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
             ) : (
                <FormField
                    control={form.control}
                    name="videoFile"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormControl>
                                <div className="text-center w-full">
                                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="mt-2 text-muted-foreground">Drag & drop your video file here or</p>
                                    <Button variant="outline" asChild className="mt-2">
                                        <label>
                                            Choose File
                                            <input 
                                                type="file" 
                                                className="sr-only"
                                                accept="video/*" 
                                                disabled={isUploading}
                                                onChange={(e) => field.onChange(e.target.files?.[0])}
                                            />
                                        </label>
                                    </Button>
                                    <FormMessage className="mt-2" />
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
             )
    }
  }

  const isUploading = status === 'uploading' || status === 'getting_url';

  return (
    <div className="flex justify-center items-start pt-4 sm:pt-8 px-2 w-full">
      <Card className="w-full max-w-lg sm:max-w-2xl">
        <CardHeader>
          <CardTitle>Upload Video</CardTitle>
          <CardDescription>
            Share your content with the world. Your video will be processed by Mux.
          </CardDescription>
        </CardHeader>
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleUpload)}>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted p-4 sm:p-8 rounded-lg min-h-[150px] sm:min-h-[200px] w-full">
                        {renderFileArea()}
                    </div>
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. My Awesome Video" {...field} disabled={isUploading} className="w-full" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isUploading}>
                                <FormControl>
                                    <SelectTrigger className="w-full" />
                                </FormControl>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 w-full">
                    {isUploading ? (
                        <Button variant="destructive" type="button" onClick={handleCancelOrReset} className="w-full sm:w-auto">Cancel</Button>
                    ) : null}
                    {(status === 'success' || status === 'error') ? (
                        <Button variant="outline" type="button" onClick={handleCancelOrReset} className="w-full sm:w-auto">
                        Reset
                        </Button>
                    ) : null}
                    <Button type="submit" disabled={isUploading} className="w-full sm:w-auto">
                        {isUploading ? (
                            <span className="flex items-center gap-2"><Loader className="animate-spin h-4 w-4" /> Uploading...</span>
                        ) : 'Upload'}
                    </Button>
                </CardFooter>
            </form>
        </FormProvider>
      </Card>
    </div>
  );
}
