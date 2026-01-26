"use client"

import { FileText, Download, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PDFViewerPlaceholderProps {
  fileName?: string
}

export function PDFViewerPlaceholder({ fileName = "document.pdf" }: PDFViewerPlaceholderProps) {
  return (
    <div className="h-full flex flex-col">
      {/* PDF Viewer Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border/40 bg-muted/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">100%</span>
          <Button variant="ghost" size="icon">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center space-y-4">
          <div className="w-24 h-32 mx-auto bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">PDF Document</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{fileName}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">PDF viewer would display the document here</p>
          </div>
        </div>
      </div>
    </div>
  )
}
