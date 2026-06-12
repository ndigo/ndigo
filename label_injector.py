import json
from pathlib import Path

GRAPH_PATH = Path("graphify-out/graph.json")

LABELS = {
    0: "HTTP Request Headers/Constants",
    1: "Batch Processing & Loading",
    2: "HTTP Response Statuses",
    3: "Content Negotiation",
    4: "Route Error Handling",
    5: "Dispatcher Infrastructure",
    6: "Input Validation & Parsing",
    7: "Route Parameter Conditions",
    8: "HTTP Transport Strategies",
    9: "Theme & Content Resolution",
    10: "Method Argument Resolution",
    11: "HTTP Interceptor Chain",
    12: "Route Condition Logic",
    13: "Event Emission System",
    14: "Browser State Resolution",
    15: "View Controller Adaptation",
    16: "Telemetry Dependencies",
    17: "Route Interceptors",
    18: "URI Parameter Parsing",
    19: "Node.js Argument Resolution",
    20: "Authentication & Authorization",
    21: "Basic Type Utilities",
    22: "Service Interceptor Lifecycle",
    23: "External Utility Dependencies",
    24: "Comparison & Sorting Utilities",
    25: "Application Context Implementation",
    26: "Event Gateway & Namespace Relay",
    27: "Wicket Component Basics",
    28: "Default Resolver Registries",
    29: "ORM Entity Mapping",
    30: "Validation Decorators & Config",
    31: "DOM View Targets & Events",
    32: "Core Object/String Utilities",
    33: "Internal Package Dependencies (Core)",
    34: "Linting & TS Tooling",
    35: "Internal Package Dependencies (Reactive/DOM)",
    36: "Component Lifecycle & Behavior",
    37: "Configuration & Metadata Parsing",
    38: "Environment Abstractions",
    39: "Math & JSON Utilities",
    40: "Argument Value Conversion",
}

def main():
    if not GRAPH_PATH.exists():
        print(f"Error: {GRAPH_PATH} not found")
        return

    with open(GRAPH_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    nodes = data.get("nodes", [])
    count = 0
    for node in nodes:
        cid = node.get("community")
        if cid is not None:
            label = LABELS.get(cid, f"Community {cid}")
            node["community_label"] = label
            if label != f"Community {cid}":
                count += 1

    with open(GRAPH_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Successfully injected labels for {count} nodes across {len(LABELS)} communities.")

if __name__ == "__main__":
    main()
