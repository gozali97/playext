import React, { useState, useEffect } from "react";

const E2EScenarioManager = ({ config, onConfigChange }) => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [runOnlySelected, setRunOnlySelected] = useState(false);

  useEffect(() => {
    if (config?.testTypes?.e2e?.scenarios) {
      setScenarios(config.testTypes.e2e.scenarios);
      setSelectedScenarios(config.testTypes.e2e.selectedScenarios || []);
      setRunOnlySelected(config.testTypes.e2e.runOnlySelected || false);
    }
  }, [config]);

  const stepTypes = [
    { value: "navigate", label: "Navigate to URL", icon: "🌐" },
    { value: "click", label: "Click Element", icon: "👆" },
    { value: "fill", label: "Fill Input", icon: "✏️" },
    { value: "fill_form", label: "Fill Form", icon: "📝" },
    { value: "verify", label: "Verify/Assert", icon: "✅" },
    { value: "wait", label: "Wait", icon: "⏳" },
    { value: "custom", label: "Custom Action", icon: "🔧" },
  ];

  const assertionTypes = [
    { value: "url", label: "URL Assertion" },
    { value: "element", label: "Element Assertion" },
    { value: "title", label: "Title Assertion" },
  ];

  const conditionTypes = {
    url: ["contains", "not_contains", "equals"],
    element: ["visible", "hidden", "hasValue", "hasText"],
    title: ["equals", "not_equals", "contains"],
  };

  const createNewScenario = () => {
    const newScenario = {
      id: `scenario-${Date.now()}`,
      name: "New Test Scenario",
      description: "Description of the test scenario",
      enabled: true,
      critical: false,
      isMainScenario: false,
      timeout: 60000,
      retries: 1,
      steps: [],
    };

    const updatedScenarios = [...scenarios, newScenario];
    setScenarios(updatedScenarios);
    updateConfig(updatedScenarios);
    setSelectedScenario(newScenario);
    setIsEditing(true);
  };

  const updateScenario = (scenarioId, updates) => {
    const updatedScenarios = scenarios.map((scenario) => {
      if (scenario.id === scenarioId) {
        const updatedScenario = { ...scenario, ...updates };

        // If setting as main scenario, unset others
        if (updates.isMainScenario) {
          return updatedScenario;
        }

        return updatedScenario;
      } else if (updates.isMainScenario) {
        // Unset main scenario from other scenarios if this one is being set as main
        return { ...scenario, isMainScenario: false };
      }
      return scenario;
    });

    setScenarios(updatedScenarios);
    updateConfig(updatedScenarios);

    if (selectedScenario?.id === scenarioId) {
      setSelectedScenario({ ...selectedScenario, ...updates });
    }
  };

  const setAsMainScenario = (scenarioId) => {
    updateScenario(scenarioId, { isMainScenario: true });
  };

  const toggleScenarioSelection = (scenarioId) => {
    const newSelectedScenarios = selectedScenarios.includes(scenarioId)
      ? selectedScenarios.filter((id) => id !== scenarioId)
      : [...selectedScenarios, scenarioId];

    setSelectedScenarios(newSelectedScenarios);
    updateE2EConfig({ selectedScenarios: newSelectedScenarios });
  };

  const updateRunMode = (runOnlySelectedMode) => {
    setRunOnlySelected(runOnlySelectedMode);
    updateE2EConfig({ runOnlySelected: runOnlySelectedMode });
  };

  const deleteScenario = (scenarioId) => {
    const updatedScenarios = scenarios.filter(
      (scenario) => scenario.id !== scenarioId
    );
    setScenarios(updatedScenarios);
    updateConfig(updatedScenarios);

    // Remove from selected scenarios if present
    const newSelectedScenarios = selectedScenarios.filter(
      (id) => id !== scenarioId
    );
    setSelectedScenarios(newSelectedScenarios);
    updateE2EConfig({ selectedScenarios: newSelectedScenarios });

    if (selectedScenario?.id === scenarioId) {
      setSelectedScenario(null);
    }
  };

  const addStep = (scenarioId) => {
    const newStep = {
      id: `step-${Date.now()}`,
      type: "navigate",
      name: "New Step",
      timeout: 5000,
    };

    setEditingStep(newStep);
    setShowStepModal(true);
  };

  const updateStep = (scenarioId, stepIndex, stepData) => {
    const updatedScenarios = scenarios.map((scenario) => {
      if (scenario.id === scenarioId) {
        const updatedSteps = [...scenario.steps];
        if (stepIndex >= 0) {
          updatedSteps[stepIndex] = stepData;
        } else {
          updatedSteps.push(stepData);
        }
        return { ...scenario, steps: updatedSteps };
      }
      return scenario;
    });

    setScenarios(updatedScenarios);
    updateConfig(updatedScenarios);

    if (selectedScenario?.id === scenarioId) {
      const updatedScenario = updatedScenarios.find((s) => s.id === scenarioId);
      setSelectedScenario(updatedScenario);
    }
  };

  const deleteStep = (scenarioId, stepIndex) => {
    const updatedScenarios = scenarios.map((scenario) => {
      if (scenario.id === scenarioId) {
        const updatedSteps = scenario.steps.filter(
          (_, index) => index !== stepIndex
        );
        return { ...scenario, steps: updatedSteps };
      }
      return scenario;
    });

    setScenarios(updatedScenarios);
    updateConfig(updatedScenarios);

    if (selectedScenario?.id === scenarioId) {
      const updatedScenario = updatedScenarios.find((s) => s.id === scenarioId);
      setSelectedScenario(updatedScenario);
    }
  };

  const updateConfig = (updatedScenarios) => {
    const newConfig = {
      ...config,
      testTypes: {
        ...config.testTypes,
        e2e: {
          ...config.testTypes.e2e,
          scenarios: updatedScenarios,
        },
      },
    };
    onConfigChange(newConfig);
  };

  const updateE2EConfig = (updates) => {
    const newConfig = {
      ...config,
      testTypes: {
        ...config.testTypes,
        e2e: {
          ...config.testTypes.e2e,
          ...updates,
        },
      },
    };
    onConfigChange(newConfig);
  };

  const getScenarioStatusIcon = (scenario) => {
    if (scenario.isMainScenario) return "🌟";
    if (scenario.critical) return "🔴";
    if (scenario.enabled) return "✅";
    return "❌";
  };

  const getScenarioStatusText = (scenario) => {
    if (scenario.isMainScenario) return "Main Scenario";
    if (scenario.critical) return "Critical";
    if (scenario.enabled) return "Enabled";
    return "Disabled";
  };

  const StepModal = () => {
    const [stepData, setStepData] = useState(editingStep || {});

    const handleSave = () => {
      const stepIndex = selectedScenario.steps.findIndex(
        (step) => step.id === stepData.id
      );
      updateStep(selectedScenario.id, stepIndex, stepData);
      setShowStepModal(false);
      setEditingStep(null);
    };

    const addAssertion = () => {
      const newAssertion = {
        type: "url",
        condition: "contains",
        value: "",
        optional: false,
      };

      setStepData({
        ...stepData,
        assertions: [...(stepData.assertions || []), newAssertion],
      });
    };

    const updateAssertion = (index, updates) => {
      const updatedAssertions = [...(stepData.assertions || [])];
      updatedAssertions[index] = { ...updatedAssertions[index], ...updates };
      setStepData({ ...stepData, assertions: updatedAssertions });
    };

    const removeAssertion = (index) => {
      const updatedAssertions = (stepData.assertions || []).filter(
        (_, i) => i !== index
      );
      setStepData({ ...stepData, assertions: updatedAssertions });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingStep ? "Edit Step" : "Add Step"}
            </h3>
            <button
              onClick={() => setShowStepModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Step Name
                </label>
                <input
                  type="text"
                  value={stepData.name || ""}
                  onChange={(e) =>
                    setStepData({ ...stepData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Step Type
                </label>
                <select
                  value={stepData.type || "navigate"}
                  onChange={(e) =>
                    setStepData({ ...stepData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {stepTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step-specific configuration */}
            {stepData.type === "navigate" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={stepData.url || ""}
                    onChange={(e) =>
                      setStepData({ ...stepData, url: e.target.value })
                    }
                    placeholder="https://example.com or {{target.url}}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Basic Auth Configuration */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={stepData.basicAuth?.enabled || false}
                      onChange={(e) =>
                        setStepData({
                          ...stepData,
                          basicAuth: {
                            ...stepData.basicAuth,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      🔐 Require Basic Authentication
                    </label>
                  </div>

                  {stepData.basicAuth?.enabled && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            value={stepData.basicAuth?.username || ""}
                            onChange={(e) =>
                              setStepData({
                                ...stepData,
                                basicAuth: {
                                  ...stepData.basicAuth,
                                  username: e.target.value,
                                },
                              })
                            }
                            placeholder="admin"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={stepData.basicAuth?.password || ""}
                            onChange={(e) =>
                              setStepData({
                                ...stepData,
                                basicAuth: {
                                  ...stepData.basicAuth,
                                  password: e.target.value,
                                },
                              })
                            }
                            placeholder="password"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Login Page (optional)
                        </label>
                        <input
                          type="text"
                          value={stepData.basicAuth?.loginPage || ""}
                          onChange={(e) =>
                            setStepData({
                              ...stepData,
                              basicAuth: {
                                ...stepData.basicAuth,
                                loginPage: e.target.value,
                              },
                            })
                          }
                          placeholder="/login (leave empty to use current page)"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Username Field Selectors
                        </label>
                        <input
                          type="text"
                          value={
                            stepData.basicAuth?.usernameField ||
                            '#username, input[name="username"], input[type="text"]'
                          }
                          onChange={(e) =>
                            setStepData({
                              ...stepData,
                              basicAuth: {
                                ...stepData.basicAuth,
                                usernameField: e.target.value,
                              },
                            })
                          }
                          placeholder="#username, input[name='username']"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Password Field Selectors
                        </label>
                        <input
                          type="text"
                          value={
                            stepData.basicAuth?.passwordField ||
                            '#password, input[name="password"], input[type="password"]'
                          }
                          onChange={(e) =>
                            setStepData({
                              ...stepData,
                              basicAuth: {
                                ...stepData.basicAuth,
                                passwordField: e.target.value,
                              },
                            })
                          }
                          placeholder="#password, input[name='password']"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Submit Button Selectors
                        </label>
                        <input
                          type="text"
                          value={
                            stepData.basicAuth?.submitButton ||
                            'input[type="submit"], button[type="submit"], .btn-login'
                          }
                          onChange={(e) =>
                            setStepData({
                              ...stepData,
                              basicAuth: {
                                ...stepData.basicAuth,
                                submitButton: e.target.value,
                              },
                            })
                          }
                          placeholder="input[type='submit'], button[type='submit']"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        💡 Tip: Use comma-separated selectors for fallbacks.
                        Framework will try each selector until one works.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(stepData.type === "click" || stepData.type === "fill") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selector
                </label>
                <input
                  type="text"
                  value={stepData.selector || ""}
                  onChange={(e) =>
                    setStepData({ ...stepData, selector: e.target.value })
                  }
                  placeholder="#id, .class, input[name='field']"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}

            {stepData.type === "fill" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={stepData.value || ""}
                  onChange={(e) =>
                    setStepData({ ...stepData, value: e.target.value })
                  }
                  placeholder="Text to fill or {{auth.username}}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div className="mt-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={stepData.sensitive || false}
                      onChange={(e) =>
                        setStepData({
                          ...stepData,
                          sensitive: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">
                      Sensitive data (password)
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  value={stepData.timeout || 5000}
                  onChange={(e) =>
                    setStepData({
                      ...stepData,
                      timeout: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wait For
                </label>
                <select
                  value={stepData.waitFor || "none"}
                  onChange={(e) =>
                    setStepData({ ...stepData, waitFor: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="none">No waiting</option>
                  <option value="navigation">Navigation</option>
                  <option value="response">Response</option>
                  <option value="networkidle">Network idle</option>
                </select>
              </div>
            </div>

            {/* Assertions */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">Assertions</h4>
                <button
                  onClick={addAssertion}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Add Assertion
                </button>
              </div>

              {(stepData.assertions || []).map((assertion, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded p-3 mb-2"
                >
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <select
                      value={assertion.type}
                      onChange={(e) =>
                        updateAssertion(index, { type: e.target.value })
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {assertionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={assertion.condition}
                      onChange={(e) =>
                        updateAssertion(index, { condition: e.target.value })
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {conditionTypes[assertion.type]?.map((condition) => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={assertion.value || ""}
                      onChange={(e) =>
                        updateAssertion(index, { value: e.target.value })
                      }
                      placeholder="Expected value"
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />

                    <button
                      onClick={() => removeAssertion(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  {assertion.type === "element" && (
                    <input
                      type="text"
                      value={assertion.selector || ""}
                      onChange={(e) =>
                        updateAssertion(index, { selector: e.target.value })
                      }
                      placeholder="Element selector"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  )}

                  <label className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={assertion.optional || false}
                      onChange={(e) =>
                        updateAssertion(index, { optional: e.target.checked })
                      }
                      className="mr-1"
                    />
                    <span className="text-xs text-gray-600">
                      Optional assertion
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => setShowStepModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Step
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          E2E Test Scenarios
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={createNewScenario}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + New Scenario
          </button>
        </div>
      </div>

      {/* Execution Control Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-3">
          🎯 Execution Control
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">
              Run Mode
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="runMode"
                  checked={!runOnlySelected}
                  onChange={() => updateRunMode(false)}
                  className="mr-2"
                />
                <span className="text-sm">
                  🌟 Run Main Scenario (or all enabled if no main)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="runMode"
                  checked={runOnlySelected}
                  onChange={() => updateRunMode(true)}
                  className="mr-2"
                />
                <span className="text-sm">🎯 Run Only Selected Scenarios</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">
              Current Selection
            </label>
            <div className="text-sm text-blue-600">
              {!runOnlySelected ? (
                <>
                  <div>
                    Mode: <strong>Main Scenario</strong>
                  </div>
                  <div>
                    Will run:{" "}
                    {scenarios.filter((s) => s.isMainScenario).length > 0
                      ? scenarios
                          .filter((s) => s.isMainScenario)
                          .map((s) => s.name)
                          .join(", ")
                      : `All enabled scenarios (${scenarios.filter((s) => s.enabled).length})`}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    Mode: <strong>Selected Scenarios</strong>
                  </div>
                  <div>
                    Will run:{" "}
                    {selectedScenarios.length > 0
                      ? scenarios
                          .filter((s) => selectedScenarios.includes(s.id))
                          .map((s) => s.name)
                          .join(", ")
                      : "None selected"}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenarios List */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Scenarios</h3>
          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-3 border rounded transition-colors ${
                  selectedScenario?.id === scenario.id
                    ? "border-blue-500 bg-blue-50"
                    : scenario.isMainScenario
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {runOnlySelected && (
                      <input
                        type="checkbox"
                        checked={selectedScenarios.includes(scenario.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleScenarioSelection(scenario.id);
                        }}
                        className="mr-1"
                      />
                    )}
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">
                        {getScenarioStatusIcon(scenario)}
                      </span>
                      <span
                        className="font-medium cursor-pointer"
                        onClick={() => setSelectedScenario(scenario)}
                      >
                        {scenario.name}
                      </span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {getScenarioStatusText(scenario)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!scenario.isMainScenario && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsMainScenario(scenario.id);
                        }}
                        className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                        title="Set as Main Scenario"
                      >
                        🌟 Main
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScenario(scenario.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {scenario.steps?.length || 0} steps
                  {scenario.isMainScenario && (
                    <span className="ml-2 text-yellow-600 font-medium">
                      • Main Scenario
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario Details */}
        <div className="lg:col-span-2">
          {selectedScenario ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">
                  {selectedScenario.name}
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  {isEditing ? "View" : "Edit"}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scenario Name
                    </label>
                    <input
                      type="text"
                      value={selectedScenario.name}
                      onChange={(e) =>
                        updateScenario(selectedScenario.id, {
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={selectedScenario.description}
                      onChange={(e) =>
                        updateScenario(selectedScenario.id, {
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows="2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedScenario.enabled}
                          onChange={(e) =>
                            updateScenario(selectedScenario.id, {
                              enabled: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Enabled
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedScenario.critical}
                          onChange={(e) =>
                            updateScenario(selectedScenario.id, {
                              critical: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Critical
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedScenario.isMainScenario}
                          onChange={(e) =>
                            updateScenario(selectedScenario.id, {
                              isMainScenario: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-yellow-700">
                          🌟 Main Scenario
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timeout (ms)
                      </label>
                      <input
                        type="number"
                        value={selectedScenario.timeout}
                        onChange={(e) =>
                          updateScenario(selectedScenario.id, {
                            timeout: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        {selectedScenario.isMainScenario && (
                          <div className="text-yellow-600 font-medium">
                            ⭐ This is the main scenario that will run by
                            default
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-600">
                    {selectedScenario.description}
                  </p>
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span>
                      Enabled: {selectedScenario.enabled ? "✅" : "❌"}
                    </span>
                    <span>
                      Critical: {selectedScenario.critical ? "🔴" : "⚪"}
                    </span>
                    <span>Timeout: {selectedScenario.timeout}ms</span>
                  </div>
                </div>
              )}

              {/* Steps */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Test Steps</h4>
                  <button
                    onClick={() => addStep(selectedScenario.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    + Add Step
                  </button>
                </div>

                <div className="space-y-2">
                  {(selectedScenario.steps || []).map((step, index) => (
                    <div
                      key={step.id}
                      className="border border-gray-200 rounded p-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="font-medium">{step.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {
                                stepTypes.find((t) => t.value === step.type)
                                  ?.icon
                              }{" "}
                              {step.type}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            {step.type === "navigate" &&
                              step.url &&
                              `URL: ${step.url}`}
                            {step.type === "click" &&
                              step.selector &&
                              `Click: ${step.selector}`}
                            {step.type === "fill" &&
                              step.selector &&
                              `Fill: ${step.selector}`}
                            {step.basicAuth?.enabled && (
                              <span className="ml-2 text-orange-600 font-medium">
                                🔐 Basic Auth
                              </span>
                            )}
                            {step.assertions && step.assertions.length > 0 && (
                              <span className="ml-2 text-green-600">
                                ({step.assertions.length} assertions)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setEditingStep(step);
                              setShowStepModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              deleteStep(selectedScenario.id, index)
                            }
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
              <p>Select a scenario to view and edit its details</p>
            </div>
          )}
        </div>
      </div>

      {showStepModal && <StepModal />}
    </div>
  );
};

export default E2EScenarioManager;
