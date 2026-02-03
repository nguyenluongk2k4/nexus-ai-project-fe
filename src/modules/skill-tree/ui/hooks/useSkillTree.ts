import { useState, useCallback } from 'react';
import { getSkillTreeService } from '../../providers';
import { SpecializationData, SPECIALIZATIONS } from '@/domain/data/skillTreeData';
import { treeNodeService } from '@/modules/skill-tree/domain/services/treeNodeService';

// Get service from providers (DI)
const service = getSkillTreeService();

export interface SkillNode {
  id: string;
  label: string;
  fullName: string;
  type?: string;
  icon?: string; // NEW
  status: 'unlocked' | 'available' | 'locked';
  level: number;
  originalNodeId?: string; // NEW
  x: number;
  y: number;
  connections: string[];
  nodeData: any;
}

export function useSkillTree() {
  const [skillNodes, setSkillNodes] = useState<SkillNode[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState<SpecializationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTree, setShowTree] = useState(false);

  const convertSpecializationToNodes = useCallback((specializationData: any): SkillNode[] => {
    const nodes: SkillNode[] = [];

    const rootNode: SkillNode = {
      id: specializationData.id,
      label: specializationData.name.length > 20 ? specializationData.name.substring(0, 20) + '...' : specializationData.name,
      fullName: specializationData.name,
      status: 'unlocked',
      level: 0,
      icon: specializationData.icon,
      x: 50,
      y: 5,
      connections: [],
      nodeData: specializationData
    };
    nodes.push(rootNode);

    if (specializationData.children) {
      const abilities = specializationData.children;
      const totalAbilities = abilities.length;

      abilities.forEach((ability: any, abilityIndex: number) => {
        const abilityX = ((abilityIndex + 1) / (totalAbilities + 1)) * 100;

        const abilityNode: SkillNode = {
          id: ability.id,
          label: ability.name.length > 15 ? ability.name.substring(0, 15) + '...' : ability.name,
          fullName: ability.name,
          status: 'unlocked',
          level: 1,
          icon: ability.icon,
          x: abilityX,
          y: 20,
          connections: [],
          nodeData: ability
        };
        nodes.push(abilityNode);
        rootNode.connections.push(ability.id);

        if (ability.children) {
          const skills = ability.children;
          const totalSkills = skills.length;
          const branchWidth = 100 / totalAbilities;
          const branchStart = abilityIndex * branchWidth;

          skills.forEach((skill: any, skillIndex: number) => {
            const skillX = branchStart + ((skillIndex + 1) / (totalSkills + 1)) * branchWidth;

            const skillNode: SkillNode = {
              id: skill.id,
              label: skill.name.length > 12 ? skill.name.substring(0, 12) + '...' : skill.name,
              fullName: skill.name,
              status: skillIndex < Math.ceil(skills.length * 0.7) ? 'available' : 'locked',
              level: 2,
              icon: skill.icon,
              x: skillX,
              y: 40,
              connections: [],
              nodeData: skill
            };
            nodes.push(skillNode);
            abilityNode.connections.push(skill.id);

            if (skill.children) {
              const knowledges = skill.children;
              const totalKnowledge = knowledges.length;
              const skillBranchWidth = branchWidth / totalSkills;
              const skillBranchStart = branchStart + (skillIndex * skillBranchWidth);

              knowledges.forEach((knowledge: any, knowledgeIndex: number) => {
                const knowledgeX = skillBranchStart + ((knowledgeIndex + 1) / (totalKnowledge + 1)) * skillBranchWidth;

                const knowledgeNode: SkillNode = {
                  id: knowledge.id,
                  label: knowledge.name.length > 10 ? knowledge.name.substring(0, 10) + '...' : knowledge.name,
                  fullName: knowledge.name,
                  status: knowledgeIndex < Math.ceil(knowledges.length * 0.3) ? 'available' : 'locked',
                  level: 3,
                  icon: knowledge.icon,
                  x: Math.max(0.5, Math.min(99.5, knowledgeX)),
                  y: 60,
                  connections: [],
                  nodeData: knowledge
                };
                nodes.push(knowledgeNode);
                skillNode.connections.push(knowledge.id);
              });
            }
          });
        }
      });
    }

    return nodes;
  }, []);

  const selectSpecialization = useCallback(async (spec: SpecializationData) => {
    setLoading(true);
    try {
      const data = await service.getSpecializationData(spec.id);
      const nodes = convertSpecializationToNodes(data);
      setSkillNodes(nodes);
      setSelectedSpecialization(spec);
      setShowTree(true);
    } catch (error) {
      console.error('Error loading specialization data:', error);
    } finally {
      setLoading(false);
    }
  }, [convertSpecializationToNodes]);

  const loadSessionTree = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const treeData = await service.getTreeBySession(sessionId);
      if (!treeData || !treeData.nodes) {
        // Fallback or empty state
        setSkillNodes([]);
        return;
      }

      // Convert API data to SkillNodes
      const nodesMap = new Map<string, SkillNode>();

      // 1. Create Nodes
      treeData.nodes.forEach((apiNode: any) => {
        nodesMap.set(apiNode.id, {
          id: apiNode.id,
          label: apiNode.label.length > 15 ? apiNode.label.substring(0, 15) + '...' : apiNode.label,
          fullName: apiNode.label,
          status: apiNode.data?.status === 'completed' || apiNode.data?.status === 'in-progress' ? 'unlocked' : 'available',
          level: apiNode.level ?? 0, // Use level from API (0=root, 1=ability, 2=skill)
          icon: apiNode.icon,
          x: apiNode.position?.x || 50,
          y: apiNode.position?.y || 50,
          connections: [],
          originalNodeId: apiNode.original_node_id, // NEW: Capture original mapping
          nodeData: {
            ...apiNode.data,
            filled: true, // Mark as filled since data comes from API
            learningResources: [] // Will be loaded lazily
          }
        });
      });

      // 2. Add Connections from Edges
      if (treeData.edges) {
        treeData.edges.forEach((edge: any) => {
          const sourceNode = nodesMap.get(edge.source);
          if (sourceNode) {
            sourceNode.connections.push(edge.target);
          }
        });
      }

      const finalNodes = Array.from(nodesMap.values());

      // Update Service (Global State) to Trigger UI Update in SkillTree.tsx
      // Map SkillNode back to TreeNodeData structure expected by service
      const serviceNodes: any[] = finalNodes.map(n => ({
        id: n.id,
        name: n.fullName,
        type: 'skill',
        level: n.level,
        originalNodeId: n.originalNodeId, // NEW
        icon: n.icon, // NEW
        filled: n.status !== 'locked',
        parentId: null,
        connections: n.connections, // CRITICAL: Include connections for edge drawing
        metadata: n.nodeData,
        resources: n.nodeData.learningResources
      }));

      // CRITICAL: Replace existing tree (Clean slate)
      treeNodeService.setNodes(serviceNodes);

      // Also update local state (optional, but good for hook consistency)
      setSkillNodes(finalNodes);
      setShowTree(true);

    } catch (error) {
      console.error('Error loading session tree:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateTree = useCallback(async (message: string, sessionId: string) => {
    setLoading(true);
    treeNodeService.setLoading(true);

    try {
      await service.generateTreeStream(message, sessionId, (data) => {
        if (data.status === 'generating') {
          console.log('Generating tree...', data.message);
        } else if (data.status === 'done' && data.nodes) {
          const nodes = data.nodes;

          // Map nodes to Service format
          const serviceNodes = nodes.map((n: any) => ({
            id: n.id,
            name: n.name,
            description: n.description, // Include description
            type: n.type || 'skill',
            level: n.level,
            originalNodeId: n.original_node_id, // NEW
            icon: n.icon || n.metadata?.icon, // Handle potential icon locations
            filled: true,
            parentId: n.parentId, // Critical for building connections
            connections: [], // Will be built from parentId in SkillTree.tsx
            metadata: n.metadata,
            resources: []
          }));

          treeNodeService.setNodes(serviceNodes);
          setShowTree(true);
          console.log(`Generated ${nodes.length} nodes`);
        } else if (data.status === 'error') {
          console.error('Stream error:', data.message);
        }
      });
    } catch (e) {
      console.error('Generation Error:', e);
    } finally {
      setLoading(false);
      treeNodeService.setLoading(false);
    }
  }, []);

  const backToSelection = () => {
    setShowTree(false);
    setSelectedSpecialization(null);
    setSkillNodes([]);
  };

  return {
    skillNodes,
    selectedSpecialization,
    loading,
    showTree,
    selectSpecialization,
    loadSessionTree,
    generateTree, // Exposed for Chat/UI
    backToSelection,
    specializations: SPECIALIZATIONS
  };
}
