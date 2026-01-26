"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Download, Upload, FileText, Eye, Trash2, Search, Filter, X } from "lucide-react"
import { PDFViewerPlaceholder } from "@/components/pdf-viewer-placeholder"

interface Document {
  id: number
  serialNo: string
  documentType: string
  documentNo: string
  issuedAt: string
  issueDate: string
  validDate: string
  fileName?: string
  fileSize?: number
  uploadDate: string
  status: "valid" | "expiring" | "expired"
  daysUntilExpiry: number
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      serialNo: "DOC001",
      documentType: "Medical Certificate",
      documentNo: "MED/2023/001234",
      issuedAt: "Port Medical Center",
      issueDate: "2023-06-15",
      validDate: "2024-06-15",
      fileName: "Medical_Certificate_2023.pdf",
      fileSize: 2.4,
      uploadDate: "2023-06-16",
      status: "valid",
      daysUntilExpiry: 180,
    },
    {
      id: 2,
      serialNo: "DOC002",
      documentType: "Passport",
      documentNo: "P12345678",
      issuedAt: "Passport Office",
      issueDate: "2020-03-10",
      validDate: "2030-03-10",
      fileName: "Passport_Copy.pdf",
      fileSize: 1.8,
      uploadDate: "2023-01-15",
      status: "valid",
      daysUntilExpiry: 2190,
    },
    {
      id: 3,
      serialNo: "DOC003",
      documentType: "Seaman's Book",
      documentNo: "SB/2022/987654",
      issuedAt: "Maritime Authority",
      issueDate: "2022-08-20",
      validDate: "2024-02-20",
      fileName: "Seamans_Book.pdf",
      fileSize: 3.2,
      uploadDate: "2022-08-21",
      status: "expiring",
      daysUntilExpiry: 25,
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false)
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)

  // Form state for adding new document
  const [newDocument, setNewDocument] = useState({
    documentType: "",
    documentNo: "",
    issuedAt: "",
    issueDate: "",
    validDate: "",
    fileName: "",
  })

  const calculateDaysUntilExpiry = (validDate: string) => {
    const today = new Date()
    const expiry = new Date(validDate)
    const diffTime = expiry.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getDocumentStatus = (daysUntilExpiry: number): "valid" | "expiring" | "expired" => {
    if (daysUntilExpiry < 0) return "expired"
    if (daysUntilExpiry <= 30) return "expiring"
    return "valid"
  }

  const handleAddDocument = () => {
    if (!newDocument.documentType || !newDocument.documentNo || !newDocument.issuedAt || !newDocument.validDate) {
      alert("Please fill in all required fields")
      return
    }

    const nextId = Math.max(...documents.map((d) => d.id), 0) + 1
    const serialNo = `DOC${nextId.toString().padStart(3, "0")}`
    const daysUntilExpiry = calculateDaysUntilExpiry(newDocument.validDate)

    const document: Document = {
      id: nextId,
      serialNo,
      documentType: newDocument.documentType,
      documentNo: newDocument.documentNo,
      issuedAt: newDocument.issuedAt,
      issueDate: newDocument.issueDate,
      validDate: newDocument.validDate,
      fileName: newDocument.fileName || `${newDocument.documentType.replace(/\s+/g, "_")}.pdf`,
      fileSize: Math.random() * 3 + 1, // Random file size for demo
      uploadDate: new Date().toISOString().split("T")[0],
      status: getDocumentStatus(daysUntilExpiry),
      daysUntilExpiry,
    }

    setDocuments([...documents, document])
    setNewDocument({
      documentType: "",
      documentNo: "",
      issuedAt: "",
      issueDate: "",
      validDate: "",
      fileName: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleViewDocument = (document: Document) => {
    setCurrentPdfUrl(`/placeholder-pdf-${document.id}.pdf`)
    setIsPdfViewerOpen(true)
  }

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document)
    setIsEditDialogOpen(true)
  }

  const handleUpdateDocument = (updatedDocument: Document) => {
    const daysUntilExpiry = calculateDaysUntilExpiry(updatedDocument.validDate)
    const updated = {
      ...updatedDocument,
      status: getDocumentStatus(daysUntilExpiry),
      daysUntilExpiry,
    }
    setDocuments(documents.map((d) => (d.id === updated.id ? updated : d)))
    setIsEditDialogOpen(false)
    setEditingDocument(null)
  }

  const handleDeleteDocument = (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setDocuments(documents.filter((d) => d.id !== id))
    }
  }

  const documentTypes = [...new Set(documents.map((d) => d.documentType))]

  const statusCounts = {
    total: documents.length,
    valid: documents.filter((d) => d.status === "valid").length,
    expiring: documents.filter((d) => d.status === "expiring").length,
    expired: documents.filter((d) => d.status === "expired").length,
  }

  const filteredDocuments = documents.filter((doc) => {
    const typeMatch = filterType === "all" || doc.documentType === filterType
    const statusMatch = filterStatus === "all" || doc.status === filterStatus
    const searchMatch =
      searchTerm === "" ||
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.issuedAt.toLowerCase().includes(searchTerm.toLowerCase())

    return typeMatch && statusMatch && searchMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
            Valid
          </Badge>
        )
      case "expiring":
        return (
          <Badge variant="destructive" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Expiring Soon
          </Badge>
        )
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Document Management</h1>
            <p className="text-sm text-muted-foreground">Organize and manage your important maritime documents</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Document</DialogTitle>
                <DialogDescription>Upload and register a new maritime document</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type *</Label>
                    <Select
                      value={newDocument.documentType}
                      onValueChange={(value) => setNewDocument({ ...newDocument, documentType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medical Certificate">Medical Certificate</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="Seaman's Book">Seaman's Book</SelectItem>
                        <SelectItem value="Visa">Visa</SelectItem>
                        <SelectItem value="License">License</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentNo">Document Number *</Label>
                    <Input
                      id="documentNo"
                      placeholder="e.g., MED/2024/001234"
                      value={newDocument.documentNo}
                      onChange={(e) => setNewDocument({ ...newDocument, documentNo: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuedAt">Issued At *</Label>
                  <Input
                    id="issuedAt"
                    placeholder="e.g., Port Medical Center"
                    value={newDocument.issuedAt}
                    onChange={(e) => setNewDocument({ ...newDocument, issuedAt: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={newDocument.issueDate}
                      onChange={(e) => setNewDocument({ ...newDocument, issueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validDate">Valid Until *</Label>
                    <Input
                      id="validDate"
                      type="date"
                      value={newDocument.validDate}
                      onChange={(e) => setNewDocument({ ...newDocument, validDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Upload Document (PDF)</Label>
                  <div className="border-2 border-dashed border-border/40 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your document PDF here, or click to browse
                    </p>
                    <Input id="file" type="file" accept=".pdf" className="hidden" />
                    <Button variant="outline" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDocument}>Add Document</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Document</DialogTitle>
                <DialogDescription>Modify the details of your maritime document</DialogDescription>
              </DialogHeader>
              {editingDocument && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-documentType">Document Type</Label>
                      <Select
                        value={editingDocument.documentType}
                        onValueChange={(value) => setEditingDocument({ ...editingDocument, documentType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Medical Certificate">Medical Certificate</SelectItem>
                          <SelectItem value="Passport">Passport</SelectItem>
                          <SelectItem value="Seaman's Book">Seaman's Book</SelectItem>
                          <SelectItem value="Visa">Visa</SelectItem>
                          <SelectItem value="License">License</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-documentNo">Document Number</Label>
                      <Input
                        id="edit-documentNo"
                        defaultValue={editingDocument.documentNo}
                        onChange={(e) => setEditingDocument({ ...editingDocument, documentNo: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-issuedAt">Issued At</Label>
                    <Input
                      id="edit-issuedAt"
                      defaultValue={editingDocument.issuedAt}
                      onChange={(e) => setEditingDocument({ ...editingDocument, issuedAt: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-issueDate">Issue Date</Label>
                      <Input
                        id="edit-issueDate"
                        type="date"
                        defaultValue={editingDocument.issueDate}
                        onChange={(e) => setEditingDocument({ ...editingDocument, issueDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-validDate">Valid Until</Label>
                      <Input
                        id="edit-validDate"
                        type="date"
                        defaultValue={editingDocument.validDate}
                        onChange={(e) => setEditingDocument({ ...editingDocument, validDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => editingDocument && handleUpdateDocument(editingDocument)}>
                  Update Document
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className={`transition-all duration-300 ${isPdfViewerOpen ? "w-2/5" : "w-full"} p-6 space-y-6`}>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-border/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusCounts.total}</div>
                <p className="text-xs text-muted-foreground">Stored documents</p>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valid</CardTitle>
                <FileText className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{statusCounts.valid}</div>
                <p className="text-xs text-muted-foreground">Currently valid</p>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <FileText className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{statusCounts.expiring}</div>
                <p className="text-xs text-muted-foreground">Need renewal</p>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0).toFixed(1)} MB
                </div>
                <p className="text-xs text-muted-foreground">Total file size</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search & Filter Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1 min-w-64">
                  <Label className="text-sm font-medium mb-2 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Document Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="valid">Valid</SelectItem>
                      <SelectItem value="expiring">Expiring Soon</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export List
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Document Registry</CardTitle>
              <CardDescription>Complete list of your maritime documents with quick access controls</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Document No.</TableHead>
                    <TableHead>Issued At</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.documentType}</TableCell>
                      <TableCell className="font-mono text-sm">{doc.documentNo}</TableCell>
                      <TableCell>{doc.issuedAt}</TableCell>
                      <TableCell className="text-sm">{doc.issueDate}</TableCell>
                      <TableCell className="text-sm">{doc.validDate}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-sm">
                        {doc.fileSize ? `${doc.fileSize.toFixed(1)} MB` : "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Document"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Document"
                            onClick={() => handleEditDocument(doc)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Download Document">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Document"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest document uploads and modifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents
                  .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                  .slice(0, 5)
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{doc.documentType}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.documentNo} • Uploaded on {doc.uploadDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(doc.status)}
                        <Button variant="ghost" size="icon" onClick={() => handleViewDocument(doc)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PDF Viewer Sidebar - 60% of screen */}
        {isPdfViewerOpen && (
          <div className="w-3/5 border-l border-border/40 bg-muted/20">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <h3 className="font-semibold">Document Viewer</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsPdfViewerOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-full">
              <PDFViewerPlaceholder
                fileName={documents.find((d) => `/placeholder-pdf-${d.id}.pdf` === currentPdfUrl)?.fileName}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
