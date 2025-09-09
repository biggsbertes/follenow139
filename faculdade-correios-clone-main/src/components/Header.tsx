import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, ArrowRight } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full">
      {/* Top bar - Dark gray with Acessibilidade */}
      <div className="bg-gray-800 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 cursor-pointer hover:text-blue-300">Acessibilidade</span>
            <ChevronDown className="w-3 h-3 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Main header - Light beige background */}
      <div className="bg-[#F5F3F0] py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Left side - Menu and Logo */}
          <div className="flex items-center gap-4">
            {/* Hamburger menu */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-blue-600 hover:bg-blue-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>


          </div>

          {/* Right side - Login button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-blue-800 hover:bg-blue-50 px-4 py-2"
            >
              <div className="w-4 h-3 bg-yellow-500 rounded-sm flex items-center justify-center">
                <ArrowRight className="w-2 h-2 text-blue-800" />
              </div>
              <span className="font-medium">Entrar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Yellow separator line */}
      <div className="w-full h-1 bg-yellow-400"></div>
    </header>
  );
};

export default Header;