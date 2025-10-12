"use client";

import React from "react";
import { X } from "lucide-react";
import { COLORS } from "../../theme";

// what props this component needs
type CreateThreadModalProps = {
  isOpen: boolean; // show or hide the modal
  onClose: () => void; // function to close the modal
};

// create thread modal component
function CreateThreadsSection({ isOpen, onClose }: CreateThreadModalProps) {
  // don't show anything if modal is closed
  if (!isOpen) {
    return null;
  }

  return (
    // full screen overlay
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      {/* modal window */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl">
        {/* header with close button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Create New Thread</h2>

          {/* close button */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* main content - placeholder for now */}
        <div className="p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-400 mb-4">
              Create Thread Goes Here
            </h3>
            <p className="text-gray-500">
              This is where the thread creation form will be implemented
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateThreadsSection;
