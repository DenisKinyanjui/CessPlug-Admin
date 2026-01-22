import React from "react";
import {
  Edit,
  Trash2,
  UserPlus,
  Loader2,
  MapPin,
  Building,
  Eye,
} from "lucide-react";
import { Agent } from "../../../types/Agent";

interface AgentTableProps {
  agents: Agent[];
  loading: boolean;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onView: (agentId: string) => void;
  onAddFirst: () => void;
  currentPage: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  loading,
  onEdit,
  onDelete,
  onView,
  onAddFirst,
  currentPage,
  limit,
  total,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Agent
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Contact
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Pickup Station
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Created
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">Loading agents...</p>
                </td>
              </tr>
            ) : agents.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No agents found</p>
                  <button
                    onClick={onAddFirst}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Add your first agent
                  </button>
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr
                  key={agent._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{agent.name}</p>
                      <p className="text-sm text-gray-500">
                        ID: {agent._id.slice(-8)}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-gray-900">{agent.email}</p>
                      <p className="text-sm text-gray-500">{agent.phone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {typeof agent.pickupStation === "object" ? (
                          <Building className="h-4 w-4 text-blue-600" />
                        ) : (
                          <MapPin className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {typeof agent.pickupStation === "string"
                            ? `Station ID: ${agent.pickupStation.slice(-8)}`
                            : agent.pickupStation?.name || "N/A"}
                        </p>
                        {typeof agent.pickupStation === "object" &&
                          agent.pickupStation?.city && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <p className="text-xs text-gray-500">
                                {agent.pickupStation.city}
                                {agent.pickupStation.state &&
                                  `, ${agent.pickupStation.state}`}
                              </p>
                            </div>
                          )}
                        {typeof agent.pickupStation === "object" &&
                          agent.pickupStation?.address && (
                            <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                              {agent.pickupStation.address}
                            </p>
                          )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        agent.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {agent.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-900">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(agent._id)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View agent details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(agent)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit agent"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(agent)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete agent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, total)} of {total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTable;