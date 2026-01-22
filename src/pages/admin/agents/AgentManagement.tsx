import React, { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Agent,
  CreateAgentData,
  UpdateAgentData,
  AgentFilters,
  CreateAgentWithStationData,
} from "../../../types/Agent";
import * as agentApi from "../../../services/agentApi";

// Import components
import AgentFilter from "../../../components/admin/agents/AgentFilters";
import AgentStats from "../../../components/admin/agents/AgentStats";
import AgentTable from "../../../components/admin/agents/AgentTable";
import AgentFormModal from "../../../components/admin/agents/AgentFormModal";
import DeleteConfirmationModal from "../../../components/admin/agents/DeleteConfirmationModal";

const AgentManagement: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  // Load agents
  useEffect(() => {
    loadAgents();
  }, [currentPage, searchTerm, statusFilter]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: AgentFilters = {
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
      };

      const response = await agentApi.getAllAgents(filters);
      setAgents(response.data.agents);
      setTotalPages(response.data.pagination.pages);
      setTotal(response.data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    data: CreateAgentWithStationData | UpdateAgentData
  ) => {
    setSubmitting(true);

    try {
      if (editingAgent) {
        await agentApi.updateAgent(editingAgent._id, data as UpdateAgentData);
      } else {
        await agentApi.createAgentWithStation(
          data as CreateAgentWithStationData
        );
      }

      handleCloseModal();
      loadAgents();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save agent");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!agentToDelete) return;

    setSubmitting(true);

    try {
      await agentApi.deleteAgent(agentToDelete._id);
      setShowDeleteModal(false);
      setAgentToDelete(null);
      loadAgents();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete agent");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAgent = (agent: Agent) => {
    setAgentToDelete(agent);
    setShowDeleteModal(true);
  };

  const handleAddAgent = () => {
    setEditingAgent(null);
    setShowModal(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAgent(null);
  };

  const handleViewAgent = (agentId: string) => {
    navigate(`/admin/agents/${agentId}`);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600 mt-1">
            Manage delivery agents and their pickup stations
          </p>
        </div>
        <button
          onClick={handleAddAgent}
          className="mt-3 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters Component */}
      <AgentFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onReset={resetFilters}
      />

      {/* Stats Component */}
      <AgentStats agents={agents} total={total} />

      {/* Table Component */}
      <AgentTable
        agents={agents}
        loading={loading}
        onEdit={handleEditAgent}
        onDelete={handleDeleteAgent}
        onView={handleViewAgent}
        onAddFirst={handleAddAgent}
        currentPage={currentPage}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Form Modal Component */}
      <AgentFormModal
        show={showModal}
        editingAgent={editingAgent}
        submitting={submitting}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal Component */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        agent={agentToDelete}
        submitting={submitting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AgentManagement;
