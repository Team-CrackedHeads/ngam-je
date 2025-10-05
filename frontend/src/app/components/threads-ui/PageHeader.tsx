import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  onCreateThread: () => void;
};

function PageHeader({ onCreateThread }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
      <div>
        {/* main page title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-accent-700">
          Community Threads
        </h1>
        {/* subtitle explaining tokens */}
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Contribute tokens to boost threads and unlock premium features
        </p>
      </div>
      {/* create new thread button */}
      <Button
        onClick={onCreateThread}
        className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 font-medium sm:font-semibold text-sm sm:text-base rounded-lg shadow-lg transition-colors duration-200 bg-secondary-500 text-accent-700 hover:bg-secondary-600 border border-secondary-600"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
        {/* show full text on larger screens, short on mobile */}
        <span className="hidden xs:inline">Create Thread</span>
        <span className="xs:hidden">Create</span>
      </Button>
    </div>
  );
}

export default PageHeader;
