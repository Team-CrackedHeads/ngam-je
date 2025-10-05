import { Plus, Sparkles, Puzzle, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { mockAIResponses, MockAIResponse } from "../../../utils/mock-ai-data";

type AIAgentSearchProps = {
  onOpenAI: () => void;
};

function AIAgentSearch({ onOpenAI }: AIAgentSearchProps) {
  const [currentResponse, setCurrentResponse] = useState<MockAIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSearchSection, setShowSearchSection] = useState(false);
  const [showIllustration, setShowIllustration] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setShowTitle(true), 300);
    const t2 = setTimeout(() => setShowSearchSection(true), 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleSearch = async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setShowIllustration(false);

    setTimeout(() => {
      let selected = mockAIResponses[0];
      const q = prompt.toLowerCase();

      if (/(price|cost|value|pay|market|chicago)/.test(q)) selected = mockAIResponses[1];
      else if (/(invest|profit|money|roi|worth)/.test(q)) selected = mockAIResponses[2];
      else if (/(where|buy|shop|store|malaysia)/.test(q)) selected = mockAIResponses[3];
      else if (/(authentic|verify|real|fake|check|legit)/.test(q)) selected = mockAIResponses[0];

      setCurrentResponse({
        prompt,
        answer: selected.answer, keyPoints: selected.keyPoints,
        tips: selected.tips,
      });
      setIsLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }, 1500);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch((e.target as HTMLInputElement).value);
  };

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-y-auto"
      style={{
        background: "linear-gradient(135deg, #f5f5f0 0%, #E8EDDF 50%, #CFDBD5 100%)",
      }}
    >
      <div
        className={`relative z-10 flex flex-col px-4 md:px-8 py-4 md:py-12 flex-1 transition-all duration-700 ${
          currentResponse || isLoading ? "items-start justify-start" : "items-center justify-start"
        }`}
      >
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {/* Title + Illustration */}
          <div
            className={`space-y-2 transition-all duration-1000 ${
              showTitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {showIllustration && !currentResponse && !isLoading && (
              <div className="hidden md:flex justify-center mb-0">
                <img
                  src="/images/ai-image.png"
                  alt="Marketplace illustration"
                  className="w-48 h-48 lg:w-56 lg:h-56 object-contain"
                />
              </div>
            )}

            <h1
              className="text-3xl md:text-4xl lg:text-6xl font-bold text-[#333353] text-center"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.1)" }}
            >
              Ask{" "}
              <span className="text-[#F5CB5C]" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}>
                Ngam
              </span>{" "}
              Anything!
            </h1>

            {!currentResponse && !isLoading && (
              <p className="text-base md:text-lg lg:text-xl text-[#333353]/70 text-center font-medium">
                Your trusted secondhand helper
              </p>
            )}
          </div>

          {/* Search Bar + Quick Actions */}
          <div
            className={`space-y-4 md:space-y-6 transition-all duration-1000 ${
              showSearchSection ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-3 md:p-4 flex items-center space-x-3 md:space-x-4 hover:shadow-xl transition-all duration-300 w-full max-w-3xl mx-auto">
              <div className="flex-shrink-0">
                <button
                  type="button"
                  className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                  onClick={onOpenAI}
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                </button>
              </div>

              <div className="flex-grow min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="How do I verify if sneakers are authentic..."
                  className="w-full text-sm md:text-base lg:text-lg text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0"
                  onKeyDown={onKeyDown}
                  disabled={isLoading}
                />
              </div>

              <div className="flex-shrink-0">
                <button
                  type="button"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-colors duration-200"
                  style={{ backgroundColor: "#F1D688" }}
                  onClick={() => inputRef.current && handleSearch(inputRef.current.value)}
                  disabled={isLoading}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3D172")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F1D688")}
                >
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#333353]" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-4">
              <button className="px-5 py-2 md:px-8 md:py-4 bg-white/90 rounded-full text-sm md:text-base lg:text-lg text-[#333353] font-semibold shadow-xl hover:bg-[#F5CB5C] hover:scale-105 active:scale-95 transition-all duration-200">
                Buy
              </button>
              <button className="px-5 py-2 md:px-8 md:py-4 bg-white/90 rounded-full text-sm md:text-base lg:text-lg text-[#333353] font-semibold shadow-xl hover:bg-[#F5CB5C] hover:scale-105 active:scale-95 transition-all duration-200">
                Browse
              </button>
              <button className="px-5 py-2 md:px-8 md:py-4 bg-white/90 rounded-full text-sm md:text-base lg:text-lg text-[#333353] font-semibold shadow-xl hover:bg-[#F5CB5C] hover:scale-105 active:scale-95 transition-all duration-200">
                Sell
              </button>
            </div>
          </div>

          {/* Results Area */}
          {(currentResponse || isLoading) && (
            <div className="w-full max-w-5xl mx-auto mt-6 md:mt-8">
              {isLoading && (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 md:p-8">
                  <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: "#F1D688" }} />
                    <p className="text-gray-600 text-base md:text-lg">Ngam is thinking...</p>
                  </div>
                </div>
              )}

              {currentResponse && !isLoading && (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 lg:px-8 py-3 md:py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F1D688" }}>
                        <Puzzle className="w-4 h-4 md:w-5 md:h-5 text-[#333353]" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold" style={{ color: "#333353" }}>
                        Ngam Overview
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
                    <p className="text-gray-800 text-base md:text-lg leading-relaxed">{currentResponse.answer}</p>

                    {!!currentResponse.keyPoints?.length && (
                      <div className="space-y-2 md:space-y-3">
                        {currentResponse.keyPoints.map((pt, i) => (
                          <div
                            key={i}
                            className="flex items-start space-x-2 md:space-x-3 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#F1D688] transition-colors duration-200"
                          >
                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#F1D688" }}>
                              <span className="text-[#333353] text-xs md:text-sm font-bold">{i + 1}</span>
                            </div>
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed flex-1">{pt}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {!!currentResponse.tips?.length && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 md:p-6 space-y-3 md:space-y-4">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                          <h4 className="text-base md:text-lg font-semibold text-blue-900">Pro Tips</h4>
                        </div>
                        <ul className="space-y-2">
                          {currentResponse.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-gray-700 text-sm md:text-base">
                              <span className="text-blue-600 mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 px-4 md:px-6 lg:px-8 py-3 md:py-4 border-t border-gray-200">
                    <p className="text-xs md:text-sm text-gray-500 text-center">
                      AI-generated content may contain inaccuracies. Always verify information independently.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIAgentSearch;
