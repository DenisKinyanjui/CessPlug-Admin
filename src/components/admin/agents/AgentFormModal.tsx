import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Agent, CreateAgentData, UpdateAgentData } from "../../../types/Agent";
import {
  getCounties,
  getTownsForCounty,
  searchCounties,
  searchTownsInCounty,
} from "../../../data/kenyanLocations";

interface LocalPickupStationData {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  county: string;
  town: string;
}

interface AgentFormModalProps {
  show: boolean;
  editingAgent: Agent | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAgentData | UpdateAgentData) => void;
}

const AgentFormModal: React.FC<AgentFormModalProps> = ({
  show,
  editingAgent,
  submitting,
  onClose,
  onSubmit,
}) => {
  // Location state
  const [counties, setCounties] = useState<string[]>([]);
  const [filteredCounties, setFilteredCounties] = useState<string[]>([]);
  const [towns, setTowns] = useState<string[]>([]);
  const [filteredTowns, setFilteredTowns] = useState<string[]>([]);
  const [countySearchTerm, setCountySearchTerm] = useState("");
  const [townSearchTerm, setTownSearchTerm] = useState("");
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [showTownDropdown, setShowTownDropdown] = useState(false);

  // Form state
  const [formData, setFormData] = useState<
    CreateAgentData & { pickupStationData: LocalPickupStationData }
  >({
    name: "",
    email: "",
    phone: "",
    pickupStation: "",
    isActive: true,
    pickupStationData: {
      name: "",
      county: "",
      town: "",
      address: "",
      state: "",
      postalCode: "",
      phone: "",
      email: "",
      city: "",
    },
  });

  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Initialize counties on component mount
  useEffect(() => {
    const allCounties = getCounties();
    setCounties(allCounties);
    setFilteredCounties(allCounties);
  }, []);

  // Update filtered counties based on search term
  useEffect(() => {
    const filtered = searchCounties(countySearchTerm);
    setFilteredCounties(filtered);
  }, [countySearchTerm]);

  // Update towns when county changes
  useEffect(() => {
    if (formData.pickupStationData.county) {
      const countyTowns = getTownsForCounty(formData.pickupStationData.county);
      setTowns(countyTowns);
      setFilteredTowns(countyTowns);

      // Reset town selection if it's not valid for the new county
      if (!countyTowns.includes(formData.pickupStationData.town)) {
        setFormData((prev) => ({
          ...prev,
          pickupStationData: {
            ...prev.pickupStationData,
            town: "",
          },
        }));
        setTownSearchTerm("");
      }
    } else {
      setTowns([]);
      setFilteredTowns([]);
    }
  }, [formData.pickupStationData.county]);

  // Update filtered towns based on search term
  useEffect(() => {
    if (formData.pickupStationData.county) {
      const filtered = searchTownsInCounty(
        formData.pickupStationData.county,
        townSearchTerm
      );
      setFilteredTowns(filtered);
    }
  }, [townSearchTerm, formData.pickupStationData.county]);

  // Reset form when agent changes
  useEffect(() => {
    if (editingAgent) {
      setFormData({
        name: editingAgent.name,
        email: editingAgent.email,
        phone: editingAgent.phone,
        pickupStation:
          typeof editingAgent.pickupStation === "string"
            ? editingAgent.pickupStation
            : editingAgent.pickupStation._id,
        isActive: editingAgent.isActive,
        pickupStationData: {
          name: "",
          county: "",
          town: "",
          address: "",
          state: "",
          postalCode: "",
          phone: "",
          email: "",
          city: "",
        },
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        pickupStation: "",
        isActive: true,
        pickupStationData: {
          name: "",
          county: "",
          town: "",
          address: "",
          state: "",
          postalCode: "",
          phone: "",
          email: "",
          city: "",
        },
      });
    }
    setFormErrors({});
    setCountySearchTerm("");
    setTownSearchTerm("");
  }, [editingAgent, show]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Agent validation
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    // Pickup station validation (only for new agents)
    if (!editingAgent) {
      if (!formData.pickupStationData.name.trim()) {
        errors.stationName = "Station name is required";
      }

      if (!formData.pickupStationData.county.trim()) {
        errors.stationCounty = "County is required";
      }

      if (!formData.pickupStationData.town.trim()) {
        errors.stationTown = "Town is required";
      }

      if (!formData.pickupStationData.address.trim()) {
        errors.stationAddress = "Station address is required";
      }
    } else {
      // For editing, we still need a pickup station ID
      if (!formData.pickupStation) {
        errors.pickupStation = "Pickup station is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingAgent) {
      const updateData: UpdateAgentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isActive: formData.isActive,
      };
      onSubmit(updateData);
    } else {
      // For new agents, use the custom station name
      const createData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isActive: formData.isActive,
        pickupStationData: {
          name: formData.pickupStationData.name.trim(),
          address: formData.pickupStationData.address,
          city: formData.pickupStationData.town,
          state:
            formData.pickupStationData.state ||
            formData.pickupStationData.county,
          postalCode: formData.pickupStationData.postalCode,
          phone: formData.phone,
          email: formData.email,
        },
      };
      onSubmit(createData);
    }
  };

  const handleCountySelect = (county: string) => {
    setFormData((prev) => ({
      ...prev,
      pickupStationData: {
        ...prev.pickupStationData,
        county,
        town: "", // Reset town when county changes
      },
    }));
    setCountySearchTerm(county);
    setShowCountyDropdown(false);
  };

  const handleTownSelect = (town: string) => {
    setFormData((prev) => ({
      ...prev,
      pickupStationData: {
        ...prev.pickupStationData,
        town,
      },
    }));
    setTownSearchTerm(town);
    setShowTownDropdown(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {editingAgent ? "Edit Agent" : "Add New Agent"}
          </h2>
        </div>

        <div className="p-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 max-h-96 overflow-y-auto"
          >
            {/* Agent Information */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Agent Information
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter full name"
                  />
                  {formErrors.name && (
                    <p className="text-red-600 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter phone number"
                  />
                  {formErrors.phone && (
                    <p className="text-red-600 text-sm mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.value === "active",
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pickup Station Location - Only show for new agents */}
            {!editingAgent && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Pickup Station Information
                </h3>

                <div className="space-y-3">
                  {/* Station Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Station Name *
                    </label>
                    <input
                      type="text"
                      value={formData.pickupStationData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pickupStationData: {
                            ...formData.pickupStationData,
                            name: e.target.value,
                          },
                        })
                      }
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.stationName
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., Vinsky Pickup Point - Westlands, SafariCom Shop - CBD, KenCom House Station"
                    />
                    {formErrors.stationName && (
                      <p className="text-red-600 text-sm mt-1">
                        {formErrors.stationName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Give your pickup station a unique, recognizable name that
                      customers can easily identify
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* County Dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        County *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={countySearchTerm}
                          onChange={(e) => setCountySearchTerm(e.target.value)}
                          onFocus={() => setShowCountyDropdown(true)}
                          onBlur={() => {
                            // Delay hiding to allow selection
                            setTimeout(() => setShowCountyDropdown(false), 200);
                          }}
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formErrors.stationCounty
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Search and select county"
                        />
                        {showCountyDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredCounties.map((county) => (
                              <button
                                key={county}
                                type="button"
                                onClick={() => handleCountySelect(county)}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50"
                              >
                                {county}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {formErrors.stationCounty && (
                        <p className="text-red-600 text-sm mt-1">
                          {formErrors.stationCounty}
                        </p>
                      )}
                    </div>

                    {/* Town Dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Town *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={townSearchTerm}
                          onChange={(e) => setTownSearchTerm(e.target.value)}
                          onFocus={() => setShowTownDropdown(true)}
                          onBlur={() => {
                            // Delay hiding to allow selection
                            setTimeout(() => setShowTownDropdown(false), 200);
                          }}
                          disabled={!formData.pickupStationData.county}
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                            formErrors.stationTown
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder={
                            formData.pickupStationData.county
                              ? "Search and select town"
                              : "Select county first"
                          }
                        />
                        {showTownDropdown &&
                          formData.pickupStationData.county && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {filteredTowns.map((town) => (
                                <button
                                  key={town}
                                  type="button"
                                  onClick={() => handleTownSelect(town)}
                                  className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50"
                                >
                                  {town}
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                      {formErrors.stationTown && (
                        <p className="text-red-600 text-sm mt-1">
                          {formErrors.stationTown}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exact Address *
                    </label>
                    <input
                      type="text"
                      value={formData.pickupStationData.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pickupStationData: {
                            ...formData.pickupStationData,
                            address: e.target.value,
                          },
                        })
                      }
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.stationAddress
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter exact street address"
                    />
                    {formErrors.stationAddress && (
                      <p className="text-red-600 text-sm mt-1">
                        {formErrors.stationAddress}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Region
                      </label>
                      <input
                        type="text"
                        value={formData.pickupStationData.state}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pickupStationData: {
                              ...formData.pickupStationData,
                              state: e.target.value,
                            },
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter state/region (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.pickupStationData.postalCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pickupStationData: {
                              ...formData.pickupStationData,
                              postalCode: e.target.value,
                            },
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter postal code (optional)"
                      />
                    </div> */}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingAgent ? "Update" : "Create"} Agent
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentFormModal;
