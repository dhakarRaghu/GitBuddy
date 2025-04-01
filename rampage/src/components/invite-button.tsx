"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface InviteButtonProps {
  projectId: string;
}

const InviteButton: React.FC<InviteButtonProps> = ({ projectId }) => {
  const [open, setOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const inviteLink = `${window.location.origin}/join/${projectId}`;

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen} aria-labelledby="invite-team-dialog">
        <DialogContent className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle
              id="invite-team-dialog"
              className="text-xl font-bold text-gray-800 dark:text-gray-100"
            >
              Invite Team Members
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Ask them to copy and paste this link
          </p>
          <div className="flex items-center mt-4">
            <Input
              className="mr-3 flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500"
              readOnly
              value={inviteLink}
            />
            <Button
              size="sm"
              onClick={handleCopy}
              disabled={isCopying}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-sm disabled:from-orange-400 disabled:to-pink-400 flex items-center gap-2"
            >
              {isCopying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Copying...
                </>
              ) : (
                'Copy'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-sm"
      >
        Invite Member
      </Button>
    </>
  );
};

export default InviteButton;