"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { COLORS } from "../../theme";

// what props this component needs
type AIAgentOverlayProps = {
  isOpen: boolean; // show or hide the overlay
  onClose: () => void; // function to close the overlay
};

// main component - shows ai overlay when opened (75% of screen)
function AIAgentOverlay({ isOpen, onClose }: AIAgentOverlayProps) {
  // don't show anything if overlay is closed
  if (!isOpen) {
    return null;
  }

  return (
    // overlay background - covers full screen but semi-transparent
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      {/* actual ai window - 75% of screen size */}
      <div className="w-full max-w-4xl h-3/4 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* top bar with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">AI Agent</h2>

          {/* close button */}
          <button
            onClick={onClose}
            className="text-gray-600 p-2 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* main content area - placeholder for now */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              AI Agent placeholder
            </h3>
            <p className="text-gray-500">Lorem ipsum refer to figma</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAgentOverlay;
