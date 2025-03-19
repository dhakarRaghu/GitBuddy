"use client";
import useRefetch from '@/hooks/use-refetch';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ConfirmDialog from './ConfromDialog'; 

const ArchiveButton: React.FC = () => {
  // const archiveProject = api.project.archiveProject.useMutation();
  // const { projectId } = useProject();
  const refetch = useRefetch();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleArchive = () => {
    // archiveProject.mutate(
    //   { projectId },
    //   {
    //     onSuccess: () => {
    //       toast.success("Project archived");
    //       refetch();
    //       setDialogOpen(false);
    //     },
    //     onError: () => {
    //       toast.error("Failed to archive project");
    //     },
    //   }
    // );
  };

  return (
    <>
      <Button
        // disabled={archiveProject.isPending}
        size="sm"
        variant="destructive"
        onClick={() => setDialogOpen(true)}
      >
        Archive
      </Button>

      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Archive Project"
        description="Are you sure you want to archive this project? This action cannot be undone."
        onConfirm={handleArchive}
        onCancel={() => setDialogOpen(false)}
      />
    </>
  );
};

export default ArchiveButton;
