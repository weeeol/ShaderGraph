import type { GraphNode, GraphEdge, NodeDefinition } from './types';
import { glslTypeCast, GLSL_LIBRARIES } from './glsl-utils';

export interface CompilerResult {
  glslCode: string;
  error?: string;
}

export type NodeRegistry = Record<string, NodeDefinition>;

export const transpileGraphToGLSL = (
  nodes: GraphNode[],
  edges: GraphEdge[],
  masterOutputNodeId: string,
  nodeRegistry: NodeRegistry
): CompilerResult => {
  const masterNode = nodes.find(n => n.id === masterOutputNodeId);
  if (!masterNode) {
    return { glslCode: '', error: 'Master Output node not found.' };
  }

  const deps = new Map<string, string[]>();
  const incomingEdges = new Map<string, GraphEdge[]>();
  
  nodes.forEach(n => {
    deps.set(n.id, []);
    incomingEdges.set(n.id, []);
  });

  edges.forEach(e => {
    if (deps.has(e.target)) {
      deps.get(e.target)!.push(e.source);
    }
    if (incomingEdges.has(e.target)) {
      incomingEdges.get(e.target)!.push(e);
    }
  });

  const reachable = new Set<string>();
  const stack = [masterOutputNodeId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (!reachable.has(current)) {
      reachable.add(current);
      const dependencies = deps.get(current) || [];
      dependencies.forEach(d => stack.push(d));
    }
  }

  const activeNodes = nodes.filter(n => reachable.has(n.id));

  const inDegree = new Map<string, number>();
  activeNodes.forEach(n => inDegree.set(n.id, 0));

  edges.forEach(e => {
    if (reachable.has(e.source) && reachable.has(e.target)) {
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
  });

  const zeroInDegree = activeNodes.filter(n => inDegree.get(n.id) === 0).map(n => n.id);
  const sortedIds: string[] = [];

  while (zeroInDegree.length > 0) {
    const currentId = zeroInDegree.shift()!;
    sortedIds.push(currentId);

    const outgoing = edges.filter(e => e.source === currentId && reachable.has(e.target));
    for (const edge of outgoing) {
      const targetId = edge.target;
      const count = (inDegree.get(targetId) || 1) - 1;
      inDegree.set(targetId, count);
      if (count === 0) {
        zeroInDegree.push(targetId);
      }
    }
  }

  if (sortedIds.length !== activeNodes.length) {
    return { glslCode: '', error: 'Cycle detected in graph.' };
  }

  let mainBody = '';
  const requiredLibs = new Set<keyof typeof GLSL_LIBRARIES>();

  for (const id of sortedIds) {
    const node = activeNodes.find(n => n.id === id)!;
    const def = nodeRegistry[node.type];
    if (!def) {
      return { glslCode: '', error: "Unknown node type: " + node.type };
    }

    if (node.type === 'simplex2d') requiredLibs.add('simplex2d');
    if (node.type === 'voronoi') requiredLibs.add('voronoi');

    const nodeIncomingEdges = incomingEdges.get(node.id) || [];
    const inputsMap: Record<string, string> = {};

    for (const inputDef of def.inputs) {
      const edge = nodeIncomingEdges.find(e => e.targetHandle === inputDef.id);
      if (edge) {
        const sourceNode = activeNodes.find(n => n.id === edge.source)!;
        const sourceDef = nodeRegistry[sourceNode.type];
        const sourcePortDef = sourceDef.outputs.find(o => o.id === edge.sourceHandle);
        
        let varName = "node_" + edge.source + "_out_" + edge.sourceHandle;
        varName = varName.replace(/-/g, '_'); 

        if (sourcePortDef && sourcePortDef.type !== inputDef.type) {
          varName = glslTypeCast(varName, sourcePortDef.type, inputDef.type);
        }
        inputsMap[inputDef.id] = varName;
      } else {
        const val = node.data[inputDef.id] !== undefined ? node.data[inputDef.id] : inputDef.defaultValue;
        if (inputDef.type === 'float') {
          inputsMap[inputDef.id] = Number(val || 0).toFixed(5);
        } else if (inputDef.type === 'vec2') {
          const v = Array.isArray(val) ? val : [val, val];
          inputsMap[inputDef.id] = "vec2(" + Number(v[0] || 0).toFixed(5) + ", " + Number(v[1] || 0).toFixed(5) + ")";
        } else if (inputDef.type === 'vec3') {
          const v = Array.isArray(val) ? val : [val, val, val];
          inputsMap[inputDef.id] = "vec3(" + Number(v[0] || 0).toFixed(5) + ", " + Number(v[1] || 0).toFixed(5) + ", " + Number(v[2] || 0).toFixed(5) + ")";
        } else if (inputDef.type === 'vec4') {
          const v = Array.isArray(val) ? val : [val, val, val, val];
          inputsMap[inputDef.id] = "vec4(" + Number(v[0] || 0).toFixed(5) + ", " + Number(v[1] || 0).toFixed(5) + ", " + Number(v[2] || 0).toFixed(5) + ", " + Number(v[3] !== undefined ? v[3] : 1).toFixed(5) + ")";
        } else {
          inputsMap[inputDef.id] = String(val);
        }
      }
    }

    let nodeBody = "  // Node: " + def.name + " (" + node.id + ")\n";
    const safeNodeId = node.id.replace(/-/g, '_');
    for (const outputDef of def.outputs) {
      if (node.id === masterOutputNodeId) continue;
      nodeBody += "  " + outputDef.type + " node_" + safeNodeId + "_out_" + outputDef.id + ";\n";
    }

    if (def.glslTemplate) {
      let code = def.glslTemplate;
      
      for (const inputDef of def.inputs) {
        code = code.replace(new RegExp("\\{\\{in_" + inputDef.id + "\\}\\}", 'g'), inputsMap[inputDef.id]);
      }
      for (const outputDef of def.outputs) {
        code = code.replace(new RegExp("\\{\\{out_" + outputDef.id + "\\}\\}", 'g'), "node_" + safeNodeId + "_out_" + outputDef.id);
      }
      
      nodeBody += "  " + code + "\n";
    }

    mainBody += nodeBody + '\n';
  }

  let fullCode = "#version 300 es\n" +
                 "precision highp float;\n\n" +
                 "// Uniforms\n" +
                 "uniform float u_time;\n" +
                 "uniform vec2 u_resolution;\n" +
                 "uniform vec2 u_mouse;\n" +
                 "uniform int u_frame;\n\n" +
                 "// Standard varyings from quad\n" +
                 "in vec2 v_uv;\n" +
                 "out vec4 fragColor;\n\n" +
                 "// Library Functions\n";

  requiredLibs.forEach(lib => {
    fullCode += GLSL_LIBRARIES[lib] + '\n';
  });

  fullCode += "\nvoid main() {\n" + mainBody + "}\n";

  return { glslCode: fullCode };
};
