
"use client"

import React from "react"
import { Shield, Info, AlertTriangle, Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import HashDisplay from "@/components/HashDisplay"

export type ZKPStatusType = "pending" | "verified" | "generating" | "failed" | "inactive"

interface ZKPStatusProps {
  status: ZKPStatusType;
  hash?: string;
  hashLabel?: string;
  className?: string;
  tooltipContent?: string;
}

/**
 * ZKP Status component that displays the current status of a Zero-Knowledge Proof
 * along with an optional hash display
 */
const ZKPStatus: React.FC<ZKPStatusProps> = ({
  status,
  hash,
  hashLabel = "ZKP Hash",
  className,
  tooltipContent = "Zero-Knowledge Proofs allow verification without revealing sensitive data",
}) => {
  const getStatusContent = () => {
    switch (status) {
      case "verified":
        return {
          icon: <Check className="h-3.5 w-3.5" />,
          label: "Verified",
          variant: "outline" as const,
          bgClass: "bg-success/20 text-success border-success/30",
        }
      case "generating":
        return {
          icon: <Clock className="h-3.5 w-3.5 animate-pulse" />,
          label: "Generating",
          variant: "outline" as const,
          bgClass: "bg-warning/20 text-warning border-warning/30",
        }
      case "failed":
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          label: "Failed",
          variant: "outline" as const,
          bgClass: "bg-destructive/20 text-destructive border-destructive/30",
        }
      case "inactive":
        return {
          icon: <Shield className="h-3.5 w-3.5" />,
          label: "Inactive",
          variant: "outline" as const,
          bgClass: "bg-muted/80 text-muted-foreground border-muted-foreground/30",
        }
      case "pending":
      default:
        return {
          icon: <Clock className="h-3.5 w-3.5 animate-pulse" />,
          label: "Pending",
          variant: "outline" as const,
          bgClass: "bg-primary/20 text-primary border-primary/30",
        }
    }
  }

  const statusContent = getStatusContent()

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Badge variant={statusContent.variant} className={cn("gap-1 py-0.5 px-2", statusContent.bgClass)}>
          {statusContent.icon}
          <span className="text-xs font-medium">{statusContent.label}</span>
        </Badge>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[280px] text-xs">
              <p>{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {hash && <HashDisplay hash={hash} label={hashLabel} />}
    </div>
  )
}

export default ZKPStatus
