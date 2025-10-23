'use client';

import React, { useState } from 'react';
import { Search, Upload, Sparkles, X } from 'lucide-react';
import CreateBuyListingModal from './CreateBuyListingModal';
import CreateSellListingModal from './CreateSellListingModal';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateListingModal({ isOpen, onClose }: CreateListingModalProps) {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  const handleBuyClick = () => {
    setIsBuyModalOpen(true);
  };

  const handleSellClick = () => {
    setIsSellModalOpen(true);
  };

  const handleCloseBuyModal = () => {
    setIsBuyModalOpen(false);
  };

  const handleCloseSellModal = () => {
    setIsSellModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Choice Modal */}
      {!isBuyModalOpen && !isSellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-primary-100 rounded-2xl shadow-2xl overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-lg"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-accent-700" />
            </button>

            {/* Content */}
            <div className="relative min-h-[60vh] flex flex-col justify-center">
              <div className="absolute inset-0 bg-primary-gradient opacity-10"></div>
              <div className="relative max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 shadow-lg bg-primary-gradient">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold mb-4 text-accent-700">
                    Create Your Listing
                  </h1>
                  <p className="text-lg max-w-2xl mx-auto leading-relaxed text-accent-500">
                    Join thousands of users buying and selling with AI-powered matching
                  </p>
                </div>

                {/* Modern A/B Door Interface */}
                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Buy Option */}
                    <div
                      onClick={handleBuyClick}
                      className="group relative cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-primary-gradient rounded-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
                      <div className="relative bg-neutral-white rounded-2xl p-6 shadow-xl border-2 border-primary-200 group-hover:shadow-2xl hover:border-secondary-400 transition-all duration-300 flex flex-col justify-between">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-secondary-100 group-hover:scale-110 transition-transform duration-300">
                            <Search className="w-8 h-8 text-primary-600" />
                          </div>
                          <h2 className="text-2xl font-bold mb-3 text-accent-700">
                            I&apos;m Looking to Buy
                          </h2>
                          <p className="text-base leading-relaxed mb-4 text-accent-500">
                            Set your budget and let sellers compete to fulfill your needs
                          </p>

                          <div className="space-y-2 text-left mb-6">
                            <div className="flex items-center text-accent-500">
                              <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                              <span className="text-sm">Describe what you&apos;re looking for</span>
                            </div>
                            <div className="flex items-center text-accent-500">
                              <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                              <span className="text-sm">Set your budget range</span>
                            </div>
                            <div className="flex items-center text-accent-500">
                              <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                              <span className="text-sm">Get matched with sellers</span>
                            </div>
                            <div className="flex items-center text-accent-500">
                              <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                              <span className="text-sm">Secure escrow protection</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-accent-700 font-semibold text-base bg-secondary-500 hover:bg-secondary-600 group-hover:scale-105 transition-all duration-300 shadow-lg">
                            Start Buying
                            <Search className="w-5 h-5 ml-2" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sell Option */}
                    <div
                      onClick={handleSellClick}
                      className="group relative cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-primary-gradient-reverse rounded-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
                      <div className="relative bg-neutral-white rounded-2xl p-6 shadow-xl border-2 border-primary-200 group-hover:shadow-2xl hover:border-secondary-400 transition-all duration-300 flex flex-col justify-between">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-secondary-100 group-hover:scale-110 transition-transform duration-300">
                            <Upload className="w-8 h-8 text-primary-600" />
                          </div>
                          <h2 className="text-2xl font-bold mb-3 text-accent-700">
                            I Want to Sell
                          </h2>
                          <p className="text-base leading-relaxed mb-4 text-accent-500">
                            List your items and connect with interested buyers automatically
                          </p>

                          <div className="space-y-2 text-left mb-6">
                            <div className="flex items-center text-accent-500">
                              <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                              <span className="text-sm">Upload photos of your item</span>
                            </div>
                            <div className="flex items-center text-accent-500">
                              <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                              <span className="text-sm">AI optimizes your listing</span>
                            </div>
                            <div className="flex items-center text-accent-500">
                              <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                              <span className="text-sm">Get intelligent price suggestions</span>
                            </div>
                            <div className="flex items-center text-accent-500">
                              <div className="w-2 h-2 rounded-full mr-3 bg-primary-500"></div>
                              <span className="text-sm">Connect with verified buyers</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-accent-700 font-semibold text-base bg-primary-500 hover:bg-primary-600 group-hover:scale-105 transition-all duration-300 shadow-lg">
                            Start Selling
                            <Upload className="w-5 h-5 ml-2" />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Bottom Feature Highlight */}
                  <div className="text-center mt-8 pb-8">
                    <div className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-accent-600/20 bg-primary-100/80 shadow-lg backdrop-blur-sm">
                      <Sparkles className="w-5 h-5 mr-2 text-accent-600" />
                      <span className="font-medium text-base text-accent-700">
                        AI-powered matching ensures fair deals for everyone
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modals */}
      <CreateBuyListingModal
        isOpen={isBuyModalOpen}
        onClose={handleCloseBuyModal}
      />
      <CreateSellListingModal
        isOpen={isSellModalOpen}
        onClose={handleCloseSellModal}
      />
    </>
  );
}
