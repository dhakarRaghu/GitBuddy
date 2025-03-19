"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const InviteButton = () => {
  // const { projectId } = useProject(); // Extract projectId if useProject() returns an object
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen} aria-labelledby="invite-team-dialog">
        <DialogContent>
          <DialogHeader>
            <DialogTitle id="invite-team-dialog">Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-gray-500'>
            Ask them to copy and paste this link
          </p>
          <div className="flex items-center">
            <Input
              className="mr-2"
              readOnly
              // value={`${window.location.origin}/join/${projectId}`}
            />
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/join/`)
                  .then(() => toast.success('Link copied to clipboard'))
                  .catch(() => toast.error('Failed to copy link'));
              }}
            >
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button size='sm' onClick={() => setOpen(true)}>Invite Member</Button>
    </>
  );
};

export default InviteButton;
