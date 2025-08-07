import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ThemeFilters } from "@/lib/types";

interface ThemeFiltersProps {
  filters: ThemeFilters;
  onFiltersChange: (filters: ThemeFilters) => void;
  totalThemes: number;
}

export function ThemeFiltersComponent({ filters, onFiltersChange, totalThemes }: ThemeFiltersProps) {
  const handleFilterChange = (key: keyof ThemeFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="text-blue-600 mr-3" size={20} />
                Filter & Sort Themes
              </div>
              <ArrowUpDown size={16} className="text-gray-400" />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Themes</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by theme name or summary..."
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="flex space-x-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="name">Theme Name</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value) => handleFilterChange('sortOrder', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">High to Low</SelectItem>
                    <SelectItem value="asc">Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Minimum Percentage */}
            <div className="space-y-3">
              <Label>Minimum Percentage: {filters.minPercentage}%</Label>
              <Slider
                value={[filters.minPercentage]}
                onValueChange={(value) => handleFilterChange('minPercentage', value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600 text-center py-2 bg-gray-50 rounded">
              Showing {totalThemes} theme{totalThemes !== 1 ? 's' : ''}
            </div>

            {/* Reset Filters */}
            <Button
              variant="outline"
              onClick={() => onFiltersChange({
                sortBy: 'percentage',
                sortOrder: 'desc',
                minPercentage: 0,
                searchQuery: '',
              })}
              className="w-full"
            >
              Reset Filters
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}