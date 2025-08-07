import { HelpCircle, User, TrendingUp, History, Users, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white text-sm" size={16} />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">DropOffLens</h1>
              </div>
            </Link>
            
            {isAuthenticated && (
              <nav className="flex items-center space-x-6">
                <Link href="/">
                  <Button 
                    variant={location === "/" ? "default" : "ghost"} 
                    size="sm"
                    className="flex items-center"
                  >
                    <BarChart3 className="mr-2" size={16} />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/history">
                  <Button 
                    variant={location === "/history" ? "default" : "ghost"} 
                    size="sm"
                    className="flex items-center"
                  >
                    <History className="mr-2" size={16} />
                    History
                  </Button>
                </Link>
                <Link href="/teams">
                  <Button 
                    variant={location === "/teams" ? "default" : "ghost"} 
                    size="sm"
                    className="flex items-center"
                  >
                    <Users className="mr-2" size={16} />
                    Teams
                  </Button>
                </Link>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <HelpCircle size={16} />
            </Button>
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.firstName?.[0] || user.email[0].toUpperCase()}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.email}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => window.location.href = '/api/logout'}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => window.location.href = '/api/login'}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
