class ExecutionStep {
  constructor({ data }) {
    this.data = data;
  }

  static get toolbox() {
    return {
      title: "Execution Step",
      icon: "<svg>...</svg>", // Your SVG icon
    };
  }

  render() {
    // Container for all inputs
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("flex", "flex-col", "gap-4");

    // Name input
    this.nameInput = document.createElement("input");
    this.nameInput.value = this.data.name || "";
    this.nameInput.placeholder = "Name";
    this.nameInput.classList.add(
      "w-full",
      "px-3",
      "py-2",
      "border",
      "border-gray-300",
      "rounded-md"
    );
    this.wrapper.appendChild(this.nameInput);

    // Input textarea
    this.inputTextArea = document.createElement("textarea");
    this.inputTextArea.value = this.data.input || "";
    this.inputTextArea.placeholder = "Input";
    this.inputTextArea.classList.add(
      "w-full",
      "px-3",
      "py-2",
      "border",
      "border-gray-300",
      "rounded-md"
    );
    this.wrapper.appendChild(this.inputTextArea);

    // Description input
    this.descriptionInput = document.createElement("input");
    this.descriptionInput.value = this.data.description || "";
    this.descriptionInput.placeholder = "Description";
    this.descriptionInput.classList.add(
      "w-full",
      "px-3",
      "py-2",
      "border",
      "border-gray-300",
      "rounded-md"
    );
    this.wrapper.appendChild(this.descriptionInput);

    // Dependencies input
    this.dependenciesInput = document.createElement("input");
    this.dependenciesInput.value = this.data.dependencies?.join(", ") || "";
    this.dependenciesInput.placeholder = "Dependencies (comma-separated)";
    this.dependenciesInput.classList.add(
      "w-full",
      "px-3",
      "py-2",
      "border",
      "border-gray-300",
      "rounded-md"
    );
    this.wrapper.appendChild(this.dependenciesInput);

    // Execution order input
    this.executionOrderInput = document.createElement("input");
    this.executionOrderInput.type = "number";
    this.executionOrderInput.value = this.data.execution_order || "";
    this.executionOrderInput.placeholder = "Execution Order";
    this.executionOrderInput.classList.add(
      "w-full",
      "px-3",
      "py-2",
      "border",
      "border-gray-300",
      "rounded-md"
    );
    this.wrapper.appendChild(this.executionOrderInput);

    // Status select
    this.statusSelect = document.createElement("select");
    this.statusSelect.classList.add(
      "w-full",
      "px-3",
      "py-2",
      "border",
      "border-gray-300",
      "rounded-md"
    );
    ["pending", "done", "error"].forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.text = status.charAt(0).toUpperCase() + status.slice(1);
      option.selected = this.data.status === status;
      this.statusSelect.appendChild(option);
    });
    this.wrapper.appendChild(this.statusSelect);

    return this.wrapper;
  }

  save() {
    return {
      name: this.nameInput.value,
      input: this.inputTextArea.value,
      description: this.descriptionInput.value,
      dependencies: this.dependenciesInput.value
        .split(",")
        .map((dep) => parseInt(dep.trim()))
        .filter((dep) => !isNaN(dep)),
      execution_order: parseInt(this.executionOrderInput.value),
      status: this.statusSelect.value,
    };
  }
}

export default ExecutionStep;
