import type { ShaderIR } from '../engine/ir';
import { emitUnrealCustomExpression, sanitizeGraphName } from '../engine/emitHlsl';
import type { GeneratedArtifact } from './types';

export const exportUnrealMaterial = (ir: ShaderIR, graphName = 'shader_graph'): GeneratedArtifact => {
  const cleanName = sanitizeGraphName(graphName);
  const codeBody = emitUnrealCustomExpression(ir, cleanName);

  const setupGuide = `# Unreal Engine Material Custom Expression Setup Guide
**Graph:** ${graphName} (${cleanName})  
**Target:** Unreal Engine 4 / 5 Material Editor (Unlit Shading Model)

---

## 1. Custom Material Expression Configuration

In your Unreal Material Editor, add a **Custom** node and configure its properties in the **Details** panel:

| Setting | Value | Description |
|---|---|---|
| **Description** | \`${cleanName}\` | Node title displayed on the canvas |
| **Output Type** | \`CMOT Float3\` | Returns three-component BaseColor RGB |
| **Inputs [0]** | \`UV\` | Connect to a **Texture Coordinate** node (UV0) |
| **Inputs [1]** | \`Time\` | Connect to a **Time** node (scalar elapsed seconds) |
| **Additional Outputs [0]** | \`Alpha\` | Additional scalar float output (\`CMOT Float1\`) |

---

## 2. Code Property

Paste the contents of \`ShaderGraph_Unreal_CustomExpression.hlsl.txt\` directly into the **Code** text box in the **Details** panel.

---

## 3. Main Material Node Wiring

1. Select your Main Material node and set:
   - **Material Domain**: \`Surface\`
   - **Shading Model**: \`Unlit\`
   - **Blend Mode**: \`Opaque\` (or \`Masked\` / \`Translucent\` if using transparency)
2. Connect the **Custom Node Main Output** (\`CMOT Float3\`) to the material's **Emissive Color** pin.
3. If using transparency:
   - For **Masked** materials: Connect the Custom node's **Alpha** output pin to **Opacity Mask**.
   - For **Translucent** materials: Connect the Custom node's **Alpha** output pin to **Opacity**.

---

## 4. Performance & Compiler Notes

- **Constant Folding**: Unreal Engine's material compiler cannot perform constant folding across HLSL code in Custom expressions. For simple arithmetic, native Unreal material nodes are preferred.
- **Function Scope**: Custom node code executes within an Unreal-generated wrapper function. Helper structs (\`UE_Helpers\`) provide local procedural noise functions without polluting global scope.
`;

  return {
    target: 'unreal-material',
    targetLabel: 'Unreal Engine (Custom Expression)',
    files: [
      {
        name: 'ShaderGraph_Unreal_CustomExpression.hlsl.txt',
        content: codeBody,
        mimeType: 'text/plain'
      },
      {
        name: 'ShaderGraph_Unreal_Setup.md',
        content: setupGuide,
        mimeType: 'text/markdown'
      }
    ],
    instructions: [
      "In Unreal Editor, create or open a Material and set its Shading Model to 'Unlit'.",
      "Right-click the material canvas and add a 'Custom' material expression.",
      `Select the Custom node and configure in Details: set Description to '${cleanName}' and Output Type to 'CMOT Float3'.`,
      "In Details > Inputs, add two inputs named 'UV' (index 0) and 'Time' (index 1).",
      "In Details > Additional Outputs, add one output named 'Alpha' with Output Type 'CMOT Float1'.",
      "Paste the code from 'ShaderGraph_Unreal_CustomExpression.hlsl.txt' into the Custom node's 'Code' field.",
      "Connect a 'Texture Coordinate' node (channel 0) to 'UV', and a 'Time' node to 'Time'.",
      "Connect the Custom node's main output pin to 'Emissive Color' on the Main Material node.",
      "If using opacity, set Material Blend Mode to 'Masked' or 'Translucent', and connect the Custom node's 'Alpha' pin to 'Opacity Mask' or 'Opacity'."
    ],
    warnings: [
      'Constant Folding: Unreal material compiler cannot optimize or constant-fold code inside Custom material expressions.',
      'Unlit Surface Contract only: Lit/PBR channels (Base Color in Default Lit, Normal, Metallic, Specular, Roughness) are not driven by this unlit export.',
      'Blend Mode Dependency: The Alpha output has no effect unless the Material Blend Mode is configured as Masked or Translucent.',
      'Custom expressions run inside a function-local scope; custom render passes or engine-private buffers are not supported.'
    ]
  };
};
