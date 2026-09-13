import type { GraphNode, GraphEdge, NodeDefinition } from './types';
import type {
  ShaderIR,
  ShaderIRResult,
  IRNodeBlock,
  IRStatement,
  IRExpression,
  ShaderType,
  UnlitSurfaceContract
} from './ir';
import { dataTypeToShaderType } from './ir';

export type NodeRegistry = Record<string, NodeDefinition>;

const createZeroLiteral = (type: ShaderType): IRExpression => {
  switch (type) {
    case 'float':
      return { kind: 'literal', type: 'float', value: 0.0 };
    case 'vector2':
      return { kind: 'literal', type: 'vector2', value: [0.0, 0.0] };
    case 'vector3':
      return { kind: 'literal', type: 'vector3', value: [0.0, 0.0, 0.0] };
    case 'vector4':
      return { kind: 'literal', type: 'vector4', value: [0.0, 0.0, 0.0, 0.0] };
    default:
      return { kind: 'literal', type: 'float', value: 0.0 };
  }
};

export const resolveGraphToShaderIR = (
  nodes: GraphNode[],
  edges: GraphEdge[],
  masterOutputNodeId: string,
  nodeRegistry: NodeRegistry
): ShaderIRResult => {
  const masterNode = nodes.find(n => n.id === masterOutputNodeId);
  if (!masterNode) {
    return { success: false, error: 'Master Output node not found.' };
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

  // Reverse reachability from masterOutput
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

  // Validate active nodes exist in registry
  for (const node of activeNodes) {
    if (!nodeRegistry[node.type]) {
      return { success: false, error: 'Unknown node type: ' + node.type, errorNodeId: node.id };
    }
  }

  // Cycle detection via Kahn's algorithm
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
    return { success: false, error: 'Cycle detected in graph.' };
  }

  // Validate edge ports and connections
  for (const node of activeNodes) {
    const def = nodeRegistry[node.type];
    const nodeIncomingEdges = incomingEdges.get(node.id) || [];
    for (const edge of nodeIncomingEdges) {
      if (!reachable.has(edge.source)) continue;
      const inputDef = def.inputs.find(i => i.id === edge.targetHandle);
      if (!inputDef) {
        return {
          success: false,
          error: `Invalid input port '${edge.targetHandle}' on node '${node.id}' (${node.type})`,
          errorNodeId: node.id
        };
      }
      const sourceNode = activeNodes.find(n => n.id === edge.source);
      if (!sourceNode) continue;
      const sourceDef = nodeRegistry[sourceNode.type];
      const sourcePortDef = sourceDef.outputs.find(o => o.id === edge.sourceHandle);
      if (!sourcePortDef) {
        return {
          success: false,
          error: `Missing source port '${edge.sourceHandle}' on node '${sourceNode.id}' (${sourceNode.type})`,
          errorNodeId: sourceNode.id
        };
      }
      if (
        (sourcePortDef.type === 'sampler2D' || inputDef.type === 'sampler2D') &&
        sourcePortDef.type !== inputDef.type
      ) {
        return {
          success: false,
          error: `Incompatible connection between ${sourcePortDef.type} and ${inputDef.type} on node '${node.id}'`,
          errorNodeId: node.id
        };
      }
    }
  }

  const systemInputs = new Set<'uv' | 'time' | 'resolution' | 'mouse'>();
  const requiredLibraries = new Set<'simplex2d' | 'voronoi'>();
  const blocks: IRNodeBlock[] = [];
  let unlitSurface: UnlitSurfaceContract | null = null;

  for (const id of sortedIds) {
    const node = activeNodes.find(n => n.id === id)!;
    const def = nodeRegistry[node.type];
    const safeNodeId = node.id.replace(/-/g, '_');
    const statements: IRStatement[] = [];

    const nodeIncomingEdges = incomingEdges.get(node.id) || [];
    const inputsMap: Record<string, IRExpression> = {};

    for (const inputDef of def.inputs) {
      const edge = nodeIncomingEdges.find(e => e.targetHandle === inputDef.id);
      const targetType = dataTypeToShaderType(inputDef.type);

      if (edge && reachable.has(edge.source)) {
        const sourceNode = activeNodes.find(n => n.id === edge.source)!;
        const sourceDef = nodeRegistry[sourceNode.type];
        const sourcePortDef = sourceDef.outputs.find(o => o.id === edge.sourceHandle)!;
        const sourceType = dataTypeToShaderType(sourcePortDef.type);
        const sourceSafeId = edge.source.replace(/-/g, '_');
        const varName = `node_${sourceSafeId}_out_${edge.sourceHandle}`;

        const baseVarExpr: IRExpression = {
          kind: 'variable',
          type: sourceType,
          name: varName
        };

        if (sourceType !== targetType) {
          inputsMap[inputDef.id] = {
            kind: 'cast',
            type: targetType,
            fromType: sourceType,
            toType: targetType,
            expr: baseVarExpr
          };
        } else {
          inputsMap[inputDef.id] = baseVarExpr;
        }
      } else {
        const rawVal = node.data[inputDef.id] !== undefined ? node.data[inputDef.id] : inputDef.defaultValue;
        if (targetType === 'float') {
          inputsMap[inputDef.id] = {
            kind: 'literal',
            type: 'float',
            value: Number(rawVal !== undefined && rawVal !== null ? rawVal : 0)
          };
        } else if (targetType === 'vector2') {
          const v = Array.isArray(rawVal)
            ? [Number(rawVal[0] ?? 0), Number(rawVal[1] ?? 0)]
            : [Number(rawVal ?? 0), Number(rawVal ?? 0)];
          inputsMap[inputDef.id] = { kind: 'literal', type: 'vector2', value: v };
        } else if (targetType === 'vector3') {
          const v = Array.isArray(rawVal)
            ? [Number(rawVal[0] ?? 0), Number(rawVal[1] ?? 0), Number(rawVal[2] ?? 0)]
            : [Number(rawVal ?? 0), Number(rawVal ?? 0), Number(rawVal ?? 0)];
          inputsMap[inputDef.id] = { kind: 'literal', type: 'vector3', value: v };
        } else if (targetType === 'vector4') {
          const v = Array.isArray(rawVal)
            ? [
                Number(rawVal[0] ?? 0),
                Number(rawVal[1] ?? 0),
                Number(rawVal[2] ?? 0),
                Number(rawVal[3] !== undefined ? rawVal[3] : 1)
              ]
            : [Number(rawVal ?? 0), Number(rawVal ?? 0), Number(rawVal ?? 0), Number(rawVal ?? 0)];
          inputsMap[inputDef.id] = { kind: 'literal', type: 'vector4', value: v };
        } else {
          inputsMap[inputDef.id] = {
            kind: 'literal',
            type: 'float',
            value: Number(rawVal ?? 0)
          };
        }
      }
    }

    // Declare output variables (for all nodes except masterOutput)
    if (node.id !== masterOutputNodeId) {
      for (const outputDef of def.outputs) {
        statements.push({
          kind: 'declare',
          type: dataTypeToShaderType(outputDef.type),
          name: `node_${safeNodeId}_out_${outputDef.id}`
        });
      }
    }

    const semantic = def.semantic;
    if (!semantic) {
      return {
        success: false,
        error: `Node '${node.type}' has no semantic operation definition.`,
        errorNodeId: node.id
      };
    }

    const primaryOutVar = def.outputs[0]
      ? `node_${safeNodeId}_out_${def.outputs[0].id}`
      : '';
    const primaryOutType = def.outputs[0]
      ? dataTypeToShaderType(def.outputs[0].type)
      : 'float';

    switch (semantic.type) {
      case 'master_output': {
        const colorInput = inputsMap['color'] || {
          kind: 'literal',
          type: 'vector4',
          value: [0, 0, 0, 1]
        };
        unlitSurface = {
          baseColor: {
            kind: 'swizzle',
            type: 'vector3',
            source: colorInput,
            channels: 'rgb'
          },
          alpha: {
            kind: 'swizzle',
            type: 'float',
            source: colorInput,
            channels: 'a'
          }
        };
        break;
      }

      case 'system_input': {
        systemInputs.add(semantic.input);
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'system_input',
            type: primaryOutType,
            name: semantic.input
          }
        });
        break;
      }

      case 'constant': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: inputsMap['val']
        });
        break;
      }

      case 'binary_op': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'binary',
            type: primaryOutType,
            operator: semantic.operator,
            left: inputsMap['a'],
            right: inputsMap['b']
          }
        });
        break;
      }

      case 'interpolate': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: primaryOutType,
            functionName: 'interpolate',
            args: [inputsMap['a'], inputsMap['b'], inputsMap['t']]
          }
        });
        break;
      }

      case 'clamp': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: primaryOutType,
            functionName: 'clamp',
            args: [inputsMap['val'], inputsMap['min'], inputsMap['max']]
          }
        });
        break;
      }

      case 'step': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: primaryOutType,
            functionName: 'step',
            args: [inputsMap['edge'], inputsMap['val']]
          }
        });
        break;
      }

      case 'smoothstep': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: primaryOutType,
            functionName: 'smoothstep',
            args: [inputsMap['edge0'], inputsMap['edge1'], inputsMap['val']]
          }
        });
        break;
      }

      case 'sine': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: primaryOutType,
            functionName: 'sine',
            args: [inputsMap['val']]
          }
        });
        break;
      }

      case 'cosine': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: primaryOutType,
            functionName: 'cosine',
            args: [inputsMap['val']]
          }
        });
        break;
      }

      case 'power': {
        const clampedBase: IRExpression = {
          kind: 'call',
          type: 'vector4',
          functionName: 'maximum',
          args: [inputsMap['base'], createZeroLiteral('vector4')]
        };
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: primaryOutType,
            functionName: 'power',
            args: [clampedBase, inputsMap['exp']]
          }
        });
        break;
      }

      case 'dot_product': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: 'float',
            functionName: 'dot_product',
            args: [inputsMap['a'], inputsMap['b']]
          }
        });
        break;
      }

      case 'cross_product': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: 'vector3',
            functionName: 'cross_product',
            args: [inputsMap['a'], inputsMap['b']]
          }
        });
        break;
      }

      case 'normalize': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: primaryOutType,
            functionName: 'normalize',
            args: [inputsMap['val']]
          }
        });
        break;
      }

      case 'length': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: 'float',
            functionName: 'length',
            args: [inputsMap['val']]
          }
        });
        break;
      }

      case 'fractional': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: primaryOutType,
            functionName: 'fractional',
            args: [inputsMap['val']]
          }
        });
        break;
      }

      case 'absolute': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: primaryOutType,
            functionName: 'absolute',
            args: [inputsMap['val']]
          }
        });
        break;
      }

      case 'minimum': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: primaryOutType,
            functionName: 'minimum',
            args: [inputsMap['a'], inputsMap['b']]
          }
        });
        break;
      }

      case 'maximum': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: primaryOutType,
            functionName: 'maximum',
            args: [inputsMap['a'], inputsMap['b']]
          }
        });
        break;
      }

      case 'split': {
        statements.push(
          {
            kind: 'assign',
            target: `node_${safeNodeId}_out_r`,
            value: { kind: 'swizzle', type: 'float', source: inputsMap['val'], channels: 'r' }
          },
          {
            kind: 'assign',
            target: `node_${safeNodeId}_out_g`,
            value: { kind: 'swizzle', type: 'float', source: inputsMap['val'], channels: 'g' }
          },
          {
            kind: 'assign',
            target: `node_${safeNodeId}_out_b`,
            value: { kind: 'swizzle', type: 'float', source: inputsMap['val'], channels: 'b' }
          },
          {
            kind: 'assign',
            target: `node_${safeNodeId}_out_a`,
            value: { kind: 'swizzle', type: 'float', source: inputsMap['val'], channels: 'a' }
          }
        );
        break;
      }

      case 'combine': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'construct',
            type: 'vector4',
            args: [inputsMap['r'], inputsMap['g'], inputsMap['b'], inputsMap['a']]
          }
        });
        break;
      }

      case 'procedural_noise': {
        requiredLibraries.add(semantic.noiseType);
        const scaledUv: IRExpression = {
          kind: 'binary',
          type: 'vector2',
          operator: '*',
          left: inputsMap['uv'],
          right: inputsMap['scale']
        };
        const fnName = semantic.noiseType === 'simplex2d' ? 'snoise' : 'voronoi';
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'call',
            type: 'float',
            functionName: fnName,
            args: [scaledUv]
          }
        });
        break;
      }

      case 'checkerboard': {
        const scaledUvVar = `node_${safeNodeId}_scaled_uv`;
        statements.push(
          {
            kind: 'declare',
            type: 'vector2',
            name: scaledUvVar,
            initializer: {
              kind: 'call',
              type: 'vector2',
              functionName: 'floor',
              args: [
                {
                  kind: 'binary',
                  type: 'vector2',
                  operator: '*',
                  left: inputsMap['uv'],
                  right: inputsMap['scale']
                }
              ]
            }
          },
          {
            kind: 'assign',
            target: primaryOutVar,
            value: {
              kind: 'call',
              type: 'float',
              functionName: 'modulo',
              args: [
                {
                  kind: 'binary',
                  type: 'float',
                  operator: '+',
                  left: {
                    kind: 'swizzle',
                    type: 'float',
                    source: { kind: 'variable', type: 'vector2', name: scaledUvVar },
                    channels: 'x'
                  },
                  right: {
                    kind: 'swizzle',
                    type: 'float',
                    source: { kind: 'variable', type: 'vector2', name: scaledUvVar },
                    channels: 'y'
                  }
                },
                { kind: 'literal', type: 'float', value: 2.0 }
              ]
            }
          }
        );
        break;
      }

      case 'tile_and_offset': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'binary',
            type: 'vector2',
            operator: '+',
            left: {
              kind: 'binary',
              type: 'vector2',
              operator: '*',
              left: inputsMap['uv'],
              right: inputsMap['tiling']
            },
            right: inputsMap['offset']
          }
        });
        break;
      }

      case 'polar_coords': {
        const deltaVar = `node_${safeNodeId}_delta`;
        const radiusVar = `node_${safeNodeId}_radius`;
        const angleVar = `node_${safeNodeId}_angle`;
        statements.push(
          {
            kind: 'declare',
            type: 'vector2',
            name: deltaVar,
            initializer: {
              kind: 'binary',
              type: 'vector2',
              operator: '-',
              left: inputsMap['uv'],
              right: inputsMap['center']
            }
          },
          {
            kind: 'declare',
            type: 'float',
            name: radiusVar,
            initializer: {
              kind: 'binary',
              type: 'float',
              operator: '*',
              left: {
                kind: 'call',
                type: 'float',
                functionName: 'length',
                args: [{ kind: 'variable', type: 'vector2', name: deltaVar }]
              },
              right: { kind: 'literal', type: 'float', value: 2.0 }
            }
          },
          {
            kind: 'declare',
            type: 'float',
            name: angleVar,
            initializer: {
              kind: 'binary',
              type: 'float',
              operator: '+',
              left: {
                kind: 'binary',
                type: 'float',
                operator: '/',
                left: {
                  kind: 'call',
                  type: 'float',
                  functionName: 'atan2',
                  args: [
                    {
                      kind: 'swizzle',
                      type: 'float',
                      source: { kind: 'variable', type: 'vector2', name: deltaVar },
                      channels: 'y'
                    },
                    {
                      kind: 'swizzle',
                      type: 'float',
                      source: { kind: 'variable', type: 'vector2', name: deltaVar },
                      channels: 'x'
                    }
                  ]
                },
                right: { kind: 'literal', type: 'float', value: 6.28318530718 }
              },
              right: { kind: 'literal', type: 'float', value: 0.5 }
            }
          },
          {
            kind: 'assign',
            target: primaryOutVar,
            value: {
              kind: 'construct',
              type: 'vector2',
              args: [
                { kind: 'variable', type: 'float', name: radiusVar },
                { kind: 'variable', type: 'float', name: angleVar }
              ]
            }
          }
        );
        break;
      }

      case 'rotate_uv': {
        const sVar = `node_${safeNodeId}_s`;
        const cVar = `node_${safeNodeId}_c`;
        const pVar = `node_${safeNodeId}_p`;
        statements.push(
          {
            kind: 'declare',
            type: 'float',
            name: sVar,
            initializer: {
              kind: 'call',
              type: 'float',
              functionName: 'sine',
              args: [inputsMap['angle']]
            }
          },
          {
            kind: 'declare',
            type: 'float',
            name: cVar,
            initializer: {
              kind: 'call',
              type: 'float',
              functionName: 'cosine',
              args: [inputsMap['angle']]
            }
          },
          {
            kind: 'declare',
            type: 'vector2',
            name: pVar,
            initializer: {
              kind: 'binary',
              type: 'vector2',
              operator: '-',
              left: inputsMap['uv'],
              right: inputsMap['center']
            }
          },
          {
            kind: 'assign',
            target: primaryOutVar,
            value: {
              kind: 'binary',
              type: 'vector2',
              operator: '+',
              left: {
                kind: 'construct',
                type: 'vector2',
                args: [
                  {
                    kind: 'binary',
                    type: 'float',
                    operator: '-',
                    left: {
                      kind: 'binary',
                      type: 'float',
                      operator: '*',
                      left: {
                        kind: 'swizzle',
                        type: 'float',
                        source: { kind: 'variable', type: 'vector2', name: pVar },
                        channels: 'x'
                      },
                      right: { kind: 'variable', type: 'float', name: cVar }
                    },
                    right: {
                      kind: 'binary',
                      type: 'float',
                      operator: '*',
                      left: {
                        kind: 'swizzle',
                        type: 'float',
                        source: { kind: 'variable', type: 'vector2', name: pVar },
                        channels: 'y'
                      },
                      right: { kind: 'variable', type: 'float', name: sVar }
                    }
                  },
                  {
                    kind: 'binary',
                    type: 'float',
                    operator: '+',
                    left: {
                      kind: 'binary',
                      type: 'float',
                      operator: '*',
                      left: {
                        kind: 'swizzle',
                        type: 'float',
                        source: { kind: 'variable', type: 'vector2', name: pVar },
                        channels: 'x'
                      },
                      right: { kind: 'variable', type: 'float', name: sVar }
                    },
                    right: {
                      kind: 'binary',
                      type: 'float',
                      operator: '*',
                      left: {
                        kind: 'swizzle',
                        type: 'float',
                        source: { kind: 'variable', type: 'vector2', name: pVar },
                        channels: 'y'
                      },
                      right: { kind: 'variable', type: 'float', name: cVar }
                    }
                  }
                ]
              },
              right: inputsMap['center']
            }
          }
        );
        break;
      }

      case 'invert': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'binary',
            type: 'float',
            operator: '-',
            left: { kind: 'literal', type: 'float', value: 1.0 },
            right: inputsMap['val']
          }
        });
        break;
      }

      case 'contrast': {
        statements.push({
          kind: 'assign',
          target: primaryOutVar,
          value: {
            kind: 'binary',
            type: 'float',
            operator: '+',
            left: {
              kind: 'binary',
              type: 'float',
              operator: '*',
              left: {
                kind: 'binary',
                type: 'float',
                operator: '-',
                left: inputsMap['val'],
                right: { kind: 'literal', type: 'float', value: 0.5 }
              },
              right: inputsMap['contrast']
            },
            right: { kind: 'literal', type: 'float', value: 0.5 }
          }
        });
        break;
      }
    }

    blocks.push({
      nodeId: node.id,
      nodeType: node.type,
      nodeName: def.name,
      statements
    });
  }

  if (!unlitSurface) {
    unlitSurface = {
      baseColor: { kind: 'literal', type: 'vector3', value: [0, 0, 0] },
      alpha: { kind: 'literal', type: 'float', value: 1.0 }
    };
  }

  const ir: ShaderIR = {
    version: '1.0',
    systemInputs,
    requiredLibraries,
    blocks,
    surface: unlitSurface
  };

  return {
    success: true,
    ir
  };
};
