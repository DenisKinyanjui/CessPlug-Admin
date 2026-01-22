import React from "react";
import { UserPlus } from "lucide-react";
import { Agent } from "../../../types/Agent";

interface AgentStatsProps {
  agents: Agent[];
  total: number;
}

const AgentStats: React.FC<AgentStatsProps> = ({ agents, total }) => {
  const activeCount = agents.filter((agent) => agent.isActive).length;
  const inactiveCount = agents.filter((agent) => !agent.isActive).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Agents</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <UserPlus className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Active Agents</p>
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg">
            <UserPlus className="h-6 w-6 text-gray-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Inactive Agents</p>
            <p className="text-2xl font-bold text-gray-900">{inactiveCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentStats;