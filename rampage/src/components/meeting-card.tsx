'use client';

import React, { useState } from 'react';
// import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Presentation, Upload } from 'lucide-react';
import { generatePresignedUrl } from '@/lib/uploadFile';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
// import useProject from '~/hooks/use-project';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export default function MeetingCard() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  // const { project } = useProject();
  const router = useRouter();

  // Mutation for uploading meeting metadata to your backend
  const uploadMeetingMutation = useMutation({
    mutationFn: async ({ projectId, meetingUrl, name }: { projectId: string; meetingUrl: string; name: string }) => {
      const response = await axios.post('/api/upload-meeting', {
        projectId,
        meetingUrl,
        name,
      });
      return response.data; // Expecting { id: string, ... }
    },
    onError: (error: any) => {
      toast.error(`Failed to save meeting metadata: ${error.response?.data?.details || error.message}`);
    },
  });

  // Mutation for processing the meeting
  const processMeetingMutation = useMutation({
    mutationFn: async ({ meetingUrl, meetingId, projectId }: { meetingUrl: string; meetingId: string; projectId: string }) => {
      const response = await axios.post('/api/process-meeting', {
        meetingUrl,
        meetingId,
        projectId,
      });
      return response.data; // Expecting { summariesCount: number, ... }
    },
    onSuccess: (data) => {
      toast.success(`Meeting processed successfully. ${data.summariesCount || 0} summaries generated.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to process meeting: ${error.response?.data?.details || error.message}`);
    },
  });

  const uploadFile = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const presignedUrl = await generatePresignedUrl(file.name, file.type);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presignedUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const fileUrl = presignedUrl.split('?')[0];
            resolve({ success: true, url: fileUrl });
          } else {
            reject(new Error(`Failed to upload file: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('XHR error occurred during upload'));
        };

        xhr.send(file);
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message };
    }
  };

  const handleFileDrop = async (acceptedFiles: File[]) => {
    setIsUploading(true);
    const file = acceptedFiles[0];
    if (!file) {
      toast.error('No file selected', { description: 'Please select a file to upload' });
      setIsUploading(false);
      return;
    }

    // try {
      // if (!project) {
      //   throw new Error('No project selected');
      // }

      // Step 1: Upload file to storage (e.g., S3)
      // const uploadResponse = await uploadFile(file);
      // if (!uploadResponse.success || !uploadResponse.url) {
      //   throw new Error(uploadResponse.error || 'Failed to upload file');
      // }

      // // Step 2: Save meeting metadata to your backend
      // const meeting = await uploadMeetingMutation.mutateAsync({
      //   projectId: project.id,
      //   meetingUrl: uploadResponse.url,
      //   name: file.name,
      // });

      // toast.success('File uploaded successfully');
      // router.push('/meetings');

      // Step 3: Process the meeting
  //     await processMeetingMutation.mutateAsync({
  //       meetingUrl: uploadResponse.url,
  //       meetingId: meeting.id, // Assuming the API returns an ID
  //       projectId: project.id,
  //     });
  //   } catch (error: any) {
  //     console.error('Upload error:', error);
  //     toast.error('Failed to upload file', { description: error.message || 'An unexpected error occurred' });
  //   } finally {
  //     setIsUploading(false);
  //     setProgress(0);
  //   }
  // };

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   accept: {
  //     'audio/*': ['.mp3', '.wav', '.m4a'],
  //   },
  //   multiple: false,
  //   maxSize: 50000000, // 50MB
  //   onDrop: handleFileDrop,
  // });

  return (
    <Card className="flex flex-col items-center justify-center p-8 h-full" >
      {isUploading ? (
        <div className="flex flex-col items-center w-full">
          <Presentation className="h-10 w-10 text-primary animate-bounce mb-4" />
          <p className="text-sm text-gray-500 text-center mb-2">Uploading your meeting...</p>
          <Progress value={progress} className="w-full mb-2" />
          <p className="text-sm text-muted-foreground">{progress.toFixed(0)}%</p>
        </div>
      ) : (
        // <>
        //   <Presentation className={`h-10 w-10 mb-4 ${isDragActive ? 'text-primary animate-bounce' : 'text-muted-foreground'}`} />
        //   <h3 className="text-lg font-semibold mb-2">
        //     {isDragActive ? 'Drop the file here' : 'Create a new meeting'}
        //   </h3>
        //   <p className="text-center text-sm text-muted-foreground mb-6">
        //     {isDragActive ? 'Release to upload' : 'Analyse your meeting with Gitbuddy.'}
        //     <br />
        //     Powered by AI.
        //   </p>
        //   <Button disabled={isUploading}>
        //     <Upload className="mr-2 h-4 w-4" />
        //     Upload Meeting
        //     <input {...getInputProps()} />
        //   </Button>
        // </>
        <>
        dsaf
        </>
      )}
    </Card>
  );
}
}