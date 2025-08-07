import { HelpCircle, User, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white text-sm" size={16} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">DropOffLens</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <HelpCircle size={16} />
            </Button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="text-gray-600 text-sm" size={16} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
