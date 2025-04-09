import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DependencyNetwork as DependencyNetworkType, DependencyNode, DependencyLink } from "@shared/types";

interface DependencyNetworkProps {
  data: DependencyNetworkType;
  onNodeClick: (node: DependencyNode) => void;
}

export default function DependencyNetwork({ data, onNodeClick }: DependencyNetworkProps) {
  const [viewType, setViewType] = useState<'art' | 'team'>('team');
  const [period, setPeriod] = useState('Current PI');
  const [filterType, setFilterType] = useState('All Dependencies');
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !data.nodes.length) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Redraw graph when fullscreen changes
  }, [isFullscreen, data, onNodeClick]);
  
  useEffect(() => {
    if (!containerRef.current || !data.nodes.length) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Clear previous SVG
    if (svgRef.current) {
      d3.select(svgRef.current).remove();
    }
    
    // Create SVG
    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
      
    svgRef.current = svg.node();
    
    // Color scale for nodes - updated to match our theme
    const color = d3.scaleOrdinal<string>()
      .domain(["team", "epic-completed", "epic-in-progress", "epic-at-risk", "epic-blocked"])
      .range(["hsl(215, 85%, 45%)", "#10b981", "hsl(215, 85%, 65%)", "#f59e0b", "#ef4444"]);
      
    // Create force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink<DependencyNode, DependencyLink>(data.links)
        .id(d => d.id)
        .distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));
      
    // Add links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value));
      
    // Add nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("g");
    
    // Add circles to nodes
    node.append("circle")
      .attr("r", d => d.type === "team" ? 10 : 8)
      .attr("fill", d => {
        if (d.type === "team") return color("team");
        if (d.type === "epic") {
          switch (d.status) {
            case "completed": return color("epic-completed");
            case "in-progress": return color("epic-in-progress");
            case "at-risk": return color("epic-at-risk");
            case "blocked": return color("epic-blocked");
            default: return color("epic-in-progress");
          }
        }
        return "#999";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(d3.drag<SVGCircleElement, DependencyNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
        
    // Add labels to nodes
    node.append("text")
      .text(d => d.name)
      .attr("x", 15)
      .attr("y", 4)
      .style("font-size", "10px");
      
    // Add title for tooltips
    node.append("title")
      .text(d => `${d.name} (${d.type}${d.status ? ': ' + d.status : ''})`);
      
    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as DependencyNode).x || 0)
        .attr("y1", d => (d.source as DependencyNode).y || 0)
        .attr("x2", d => (d.target as DependencyNode).x || 0)
        .attr("y2", d => (d.target as DependencyNode).y || 0);
        
      node
        .attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
    });
    
    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, DependencyNode, DependencyNode>, d: DependencyNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: d3.D3DragEvent<SVGCircleElement, DependencyNode, DependencyNode>, d: DependencyNode) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: d3.D3DragEvent<SVGCircleElement, DependencyNode, DependencyNode>, d: DependencyNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Node click handler
    node.on("click", function(_event, d) {
      onNodeClick(d);
    });
    
    return () => {
      simulation.stop();
    };
  }, [data, onNodeClick]);
  
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <span className="material-icons text-primary mr-2">device_hub</span>
          Dependency Network
        </h2>
        <div className="flex space-x-2">
          <button 
            className="text-primary/70 hover:text-primary focus:outline-none transition-colors bg-gray-50 p-2 rounded-full"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <span className="material-icons">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
          </button>
          <button 
            className="text-primary/70 hover:text-primary focus:outline-none transition-colors bg-gray-50 p-2 rounded-full"
            aria-label="More options"
          >
            <span className="material-icons">more_vert</span>
          </button>
        </div>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button 
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewType === 'art' 
                ? 'text-white bg-primary border border-primary shadow-md' 
                : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'} rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary/30`}
              onClick={() => setViewType('art')}
            >
              ART View
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewType === 'team' 
                ? 'text-white bg-primary border border-primary shadow-md' 
                : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'} rounded-r-lg focus:outline-none focus:ring-1 focus:ring-primary/30`}
              onClick={() => setViewType('team')}
            >
              Team View
            </button>
          </div>
          
          <select 
            className="bg-white border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary shadow-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            aria-label="Select time period"
          >
            <option>Current PI</option>
            <option>PI 2023.1</option>
            <option>PI 2023.2</option>
          </select>
          
          <select 
            className="bg-white border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary shadow-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filter dependencies"
          >
            <option>All Dependencies</option>
            <option>At Risk Only</option>
            <option>Cross-ART Only</option>
          </select>
        </div>
        
        {/* Network Visualization */}
        <div 
          ref={containerRef}
          className={`border border-gray-200 rounded-lg bg-gray-50 ${isFullscreen ? 'h-[calc(100vh-220px)]' : 'h-[420px]'} shadow-inner`}
          aria-label="Dependency network visualization"
        />
        
        <div className="mt-5 flex flex-wrap gap-5 bg-gray-50 p-3 rounded-md border border-gray-100">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-primary mr-2 shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">Team</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-emerald-500 mr-2 shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-primary/70 mr-2 shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-amber-500 mr-2 shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">At Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2 shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
