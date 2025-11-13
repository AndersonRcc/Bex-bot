'use client'
import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  BackgroundVariant,
} from 'reactflow';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: CSS module without type declarations
import 'reactflow/dist/style.css';
import { guardarFlujos } from '@/lib/botService';
import { Loader2 } from 'lucide-react';
interface FlowData {
    nodes: Node[];
    edges: Edge[];
}
interface FlowEditorProps {
  botId: string;
  initialFlowData: FlowData | null | undefined;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}
const flowContainerStyle = { width: '100%', height: '600px' };
const nodeTypes = {};
const edgeTypes = {};
function FlowEditorInner({ botId, initialFlowData, onSaveSuccess, onSaveError }: FlowEditorProps) {
   const [nodes, setNodes, onNodesChange] = useNodesState(initialFlowData?.nodes || []);
   const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlowData?.edges || []);
   const [isSaving, setIsSaving] = useState(false);
   const [saveError, setSaveError] = useState<string | null>(null);
    useEffect(() => {
        if (initialFlowData) {
            setNodes(initialFlowData.nodes || []);
            setEdges(initialFlowData.edges || []);
        }
    }, [initialFlowData, setNodes, setEdges]);
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  const handleGuardarFlujo = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      console.log(`🔄 Guardando flujo para bot ${botId}...`);
      const resultado = await guardarFlujos(botId, { nodes, edges });
      if (resultado.success) {
        console.log("✅ Flujo guardado exitosamente.");
        if (onSaveSuccess) onSaveSuccess();
      } else {
        console.error("❌ Error al guardar flujo:", resultado.error);
        setSaveError("No se pudo guardar el flujo. Intenta de nuevo.");
         if (onSaveError) onSaveError(resultado.error);
      }
    } catch (error: any) {
        console.error("❌ Error inesperado al guardar flujo:", error);
        setSaveError(`Error inesperado: ${error.message}`);
         if (onSaveError) onSaveError(error);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <>
        <div style={flowContainerStyle} className="border border-borders-default rounded-lg relative glass-card overflow-hidden">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
        >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
        </div>
        {saveError && (
             <p className="text-red-500 text-sm mt-2 text-center">{saveError}</p>
        )}
        <div className="mt-6 flex justify-end">
            <button
                onClick={handleGuardarFlujo}
                className="btn-primary flex items-center space-x-2"
                disabled={isSaving}
            >
            {isSaving ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                </>
            ) : (
                <span>Guardar Flujo</span>
            )}
            </button>
        </div>
    </>
  );
}
export default function FlowEditor(props: FlowEditorProps) {
  return (
    <ReactFlowProvider>
      <FlowEditorInner {...props} />
    </ReactFlowProvider>
  );
}