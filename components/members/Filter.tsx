"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { X } from "lucide-react";

type FilterState = {
  name: string;
  id: string;
  role: string;
  region: string;
};

type MembersFilterProps = {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
};

export function MembersFilter({
  filters,
  onFilterChange,
  onReset
}: MembersFilterProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, name: e.target.value });
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, id: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    onFilterChange({ ...filters, role: value });
  };

  const handleRegionChange = (value: string) => {
    onFilterChange({ ...filters, region: value });
  };

  const isFiltered = Object.values(filters).some(value => value !== "");

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
      <h2 className="text-lg font-semibold">Bộ lọc</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Name Filter */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Tên In-Game
          </label>
          <Input
            id="name"
            placeholder="Tìm kiếm theo tên..."
            value={filters.name}
            onChange={handleNameChange}
            className="h-9"
          />
        </div>

        {/* ID Filter */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="id" className="text-sm font-medium">
            ID
          </label>
          <Input
            id="id"
            placeholder="Tìm kiếm theo ID..."
            value={filters.id}
            onChange={handleIdChange}
            className="h-9"
          />
        </div>

        {/* Role Filter */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="role" className="text-sm font-medium">
            Vai trò
          </label>
          <Select value={filters.role} onValueChange={handleRoleChange}>
            <SelectTrigger id="role" className="h-9 w-full">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="DPS">DPS</SelectItem>
              <SelectItem value="Healer">Healer</SelectItem>
              <SelectItem value="Tank">Tank</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Region Filter */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="region" className="text-sm font-medium">
            Khu vực
          </label>
          <Select value={filters.region} onValueChange={handleRegionChange}>
            <SelectTrigger id="region" className="h-9 w-full">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="NA">NA</SelectItem>
              <SelectItem value="EU">EU</SelectItem>
              <SelectItem value="VN">VN</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isFiltered && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-2 bg-transparent"
          >
            <X className="w-4 h-4" />
            Đặt lại bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
