import React from 'react';
import { SimulatedToolCall } from '../types';
import { Terminal, Globe, Monitor, CheckCircle2 } from 'lucide-react';

interface Props {
  tools: SimulatedToolCall[];
}

export const ToolsVisualization: React.FC<Props> = ({ tools }) => {
  if (tools.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {tools.map((tool, idx) => {
        let Icon = Terminal;
        let text = `Executing ${tool.name}...`;
        let color = "text-purple-400";
        let bg = "bg-purple-400/10";

        if (tool.name === 'openApp') {
          Icon = Monitor;
          text = `Opening ${tool.args.appName}...`;
          color = "text-emerald-400";
          bg = "bg-emerald-400/10";
        } else if (tool.name === 'webSearch') {
          Icon = Globe;
          text = `Searching: "${tool.args.query}"...`;
          color = "text-blue-400";
          bg = "bg-blue-400/10";
        } else if (tool.name === 'systemControl') {
          Icon = Terminal;
          text = `System: ${tool.args.action}`;
          color = "text-red-400";
          bg = "bg-red-400/10";
        }

        return (
          <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border border-white/5 ${bg} animate-pulse-slow`}>
            <div className={`p-2 rounded-full bg-white/5 ${color}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${color}`}>{text}</p>
            </div>
            <CheckCircle2 size={16} className={color} />
          </div>
        );
      })}
    </div>
  );
};
