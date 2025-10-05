import { Plus, Paperclip } from "lucide-react";

type AIAgentSearchProps = {
  onOpenAI: () => void;
};

function AIAgentSearch({ onOpenAI }: AIAgentSearchProps) {
  return (
    <div className="w-full h-screen flex items-center justify-center px-4 md:px-8 bg-secondary-600">
      {/* Main Container - Flexible Layout */}
      <div className="w-full max-w-none flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {/* Search Section - Responsive */}
        <div className="flex-1 max-w-2xl ml-0 lg:ml-120 space-y-6 lg:space-y-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center lg:text-left text-gray-800">
            Everything Ngam Je!
          </h1>

          {/* Search Input Bar - Responsive */}
          <div
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 md:p-4 flex items-center space-x-3 md:space-x-4 hover:shadow-xl transition-shadow duration-300 cursor-pointer w-full max-w-full lg:w-[900px]"
            onClick={onOpenAI}
          >
            {/* Left Icon - Plus Button */}
            <div className="flex-shrink-0">
              <button className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-200 mr-0 md:mr-2 rounded-xl flex items-center justify-center transition-colors duration-200">
                <Plus className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
              </button>
            </div>

            {/* Text Input - Responsive */}
            <div className="flex-grow min-w-0">
              <input
                type="text"
                placeholder="Ask Ngam anything..."
                className="w-full text-base md:text-lg text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0"
              />
            </div>

            {/* Right Icon - Attachment */}
            <div className="flex-shrink-0">
              <button className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-200">
                <Paperclip className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Action Buttons - Responsive */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4">
            <button className="px-4 py-2 md:px-6 md:py-3 bg-white border border-gray-300 rounded-full text-sm md:text-base text-gray-700 hover:bg-[#CFDBD5] active:bg-[#CFDBD5] transition-all duration-200 font-medium">
              Buy
            </button>
            <button className="px-4 py-2 md:px-6 md:py-3 bg-white border border-gray-300 rounded-full text-sm md:text-base text-gray-700 hover:bg-[#CFDBD5] active:bg-[#CFDBD5] transition-all duration-200 font-medium">
              Browse
            </button>
            <button className="px-4 py-2 md:px-6 md:py-3 bg-white border border-gray-300 rounded-full text-sm md:text-base text-gray-700 hover:bg-[#CFDBD5] active:bg-[#CFDBD5] transition-all duration-200 font-medium">
              Sell
            </button>
          </div>
        </div>

        {/* Image - Hidden on mobile, visible on desktop - KEEPING YOUR MARGINS */}
        <div className="hidden lg:block ml-50 mb-20">
          <img
            src="/images/placeholder-image.png"
            alt="Marketplace Transaction"
            className="w-[1000px] h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default AIAgentSearch;
