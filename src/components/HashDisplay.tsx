
"use client"

import React from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface HashDisplayProps {
  hash: string
  label?: string
  tooltipContent?: string
  className?: string
  prefixLength?: number
  suffixLength?: number
}

/**
 * HashDisplay component for nicely formatting and displaying cryptographic hashes
 * with optional tooltip explanation
 */
const HashDisplay = ({
  hash,
  label = "Hash",
  tooltipContent = "SHA-256 Protected Identity Hash",
  className,
  prefixLength = 12,
  suffixLength = 12,
}: HashDisplayProps) => {
  if (!hash) return null

  const prefix = hash.slice(0, prefixLength)
  const suffix = hash.slice(-suffixLength)

  return (
    <div className={cn("flex items-center gap-1.5 text-sm", className)}>
      {label && <span className="text-muted-foreground mr-1">{label}:</span>}
      <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">
        {prefix}...{suffix}
      </code>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span className="cursor-help">
              <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[280px] text-xs">
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default HashDisplay
