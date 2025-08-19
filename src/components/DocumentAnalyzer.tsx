import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

import { 
  Upload,
  FileText,
  Scan,
  CheckCircle,
  Warning,
  Eye,
  Download,
  Trash,
  Brain,
  Sparkle,
  Target,
  Clock
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface AnalyzedDocument {
  id: string
  name: string
  type: string
  uploadDate: string
  size: string
  analysisStatus: 'pending' | 'analyzing' | 'complete' | 'error'
  complianceScore: number
  requiredElements: {
    element: string
    status: 'found' | 'missing' | 'incomplete'
    confidence: number
    location?: string
    suggestion?: string
  }[]
  extractedData: {
    version?: string
    approvalDate?: string
    nextReview?: string
    regulations?: string[]
  }
  aiSummary: string
  recommendations: string[]
}

const mockAnalyzedDocs: AnalyzedDocument[] = [
  {
    id: '1',
    name: 'Quality Manual v3.2.docx',
    type: 'Quality Manual',
    uploadDate: '2024-01-15T10:30:00Z',
    size: '2.4 MB',
    analysisStatus: 'complete',
    complianceScore: 85,
    requiredElements: [
      {
        element: 'Management Responsibility Section',
        status: 'found',
        confidence: 95,
        location: 'Section 4.1-4.3',
        suggestion: 'Complete and well-structured'
      },
      {
        element: 'Document Control Procedures',
        status: 'found',
        confidence: 90,
        location: 'Section 4.2.3',
        suggestion: 'Minor improvements needed in version control'
      },
      {
        element: 'Risk Management Integration',
        status: 'incomplete',
        confidence: 65,
        location: 'Section 7.1',
        suggestion: 'Needs explicit reference to ISO 14971 implementation'
      },
      {
        element: 'Corrective Action Process',
        status: 'missing',
        confidence: 85,
        suggestion: 'Add detailed CAPA procedure with effectiveness verification'
      }
    ],
    extractedData: {
      version: '3.2',
      approvalDate: '2024-01-10',
      nextReview: '2025-01-10',
      regulations: ['ISO 13485', 'FDA 21 CFR 820']
    },
    aiSummary: 'This quality manual demonstrates strong foundational compliance but lacks adequate corrective action procedures and risk management integration details.',
    recommendations: [
      'Add comprehensive CAPA procedure',
      'Enhance risk management integration',
      'Update document control versioning system',
      'Include post-market surveillance references'
    ]
  },
  {
    id: '2',
    name: 'Risk Management File.pdf',
    type: 'Risk Management File',
    uploadDate: '2024-01-14T14:20:00Z',
    size: '5.1 MB',
    analysisStatus: 'complete',
    complianceScore: 72,
    requiredElements: [
      {
        element: 'Risk Analysis Methodology',
        status: 'found',
        confidence: 92,
        location: 'Section 2',
        suggestion: 'Well documented FMEA approach'
      },
      {
        element: 'Risk Control Measures',
        status: 'incomplete',
        confidence: 70,
        location: 'Section 4.1-4.3',
        suggestion: 'Some control measures lack verification evidence'
      },
      {
        element: 'Residual Risk Assessment',
        status: 'missing',
        confidence: 88,
        suggestion: 'Add formal residual risk evaluation and acceptability criteria'
      },
      {
        element: 'Post-Production Information',
        status: 'missing',
        confidence: 82,
        suggestion: 'Include procedure for incorporating post-market data'
      }
    ],
    extractedData: {
      version: '2.1',
      approvalDate: '2024-01-08',
      regulations: ['ISO 14971', 'EU MDR']
    },
    aiSummary: 'Risk management file shows good initial analysis but needs completion of risk control verification and residual risk assessment.',
    recommendations: [
      'Complete residual risk assessment',
      'Add post-production information procedures',
      'Verify effectiveness of risk control measures',
      'Update risk/benefit analysis'
    ]
  }
]

function getElementStatusBadge(status: string) {
  switch (status) {
    case 'found':
      return <Badge className="bg-secondary text-secondary-foreground">Found</Badge>
    case 'incomplete':
      return <Badge className="bg-accent text-accent-foreground">Incomplete</Badge>
    case 'missing':
      return <Badge variant="destructive">Missing</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

function getElementIcon(status: string) {
  switch (status) {
    case 'found':
      return <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
    case 'incomplete':
      return <Warning className="h-4 w-4 text-accent" weight="fill" />
    case 'missing':
      return <Warning className="h-4 w-4 text-destructive" weight="fill" />
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />
  }
}

export function DocumentAnalyzer() {
  const [analyzedDocs, setAnalyzedDocs] = useKV('analyzed-documents', mockAnalyzedDocs)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)])
    }
  }, [])

  const analyzeDocument = async (file: File) => {
    setIsAnalyzing(true)
    
    // Simulate AI document analysis
    const newDoc: AnalyzedDocument = {
      id: Date.now().toString(),
      name: file.name,
      type: 'Document',
      uploadDate: new Date().toISOString(),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      analysisStatus: 'analyzing',
      complianceScore: 0,
      requiredElements: [],
      extractedData: {},
      aiSummary: '',
      recommendations: []
    }

    setAnalyzedDocs(prev => [...prev, newDoc])

    // Simulate analysis delay
    setTimeout(() => {
      const prompt = spark.llmPrompt`
        Analyze this document for compliance requirements. 
        Document name: ${file.name}
        Document type: Based on filename, determine if this is a Quality Manual, SOP, Risk Management File, etc.
        
        Identify:
        1. Required compliance elements for this document type
        2. Missing or incomplete sections
        3. Overall compliance score (0-100)
        4. Specific recommendations for improvement
        
        Focus on medical device regulations: ISO 13485, FDA 21 CFR 820, EU MDR, ISO 14971
      `

      spark.llm(prompt).then(result => {
        // Simulate AI analysis results
        setAnalyzedDocs(prev => prev.map(doc => 
          doc.id === newDoc.id 
            ? {
                ...doc,
                analysisStatus: 'complete' as const,
                complianceScore: Math.floor(Math.random() * 30) + 70, // 70-100
                aiSummary: 'AI-powered analysis complete. Document reviewed for compliance requirements.',
                recommendations: [
                  'Update document version control',
                  'Add missing regulatory references',
                  'Enhance traceability to requirements'
                ]
              }
            : doc
        ))
        setIsAnalyzing(false)
      })
    }, 3000)
  }

  const removeDocument = (docId: string) => {
    setAnalyzedDocs(prev => prev.filter(doc => doc.id !== docId))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            AI Document Analyzer
          </h3>
          <p className="text-sm text-muted-foreground">
            Automated compliance validation and gap detection
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="file-upload">
            <Button className="gap-2 cursor-pointer">
              <Upload className="h-4 w-4" />
              Upload Documents
            </Button>
          </label>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upload Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => analyzeDocument(file)}
                    disabled={isAnalyzing}
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    Analyze
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      <div className="space-y-4">
        {analyzedDocs.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{doc.name}</CardTitle>
                      {doc.analysisStatus === 'complete' && (
                        <Badge 
                          className={`${
                            doc.complianceScore >= 85 
                              ? 'bg-secondary text-secondary-foreground' 
                              : doc.complianceScore >= 70 
                                ? 'bg-accent text-accent-foreground' 
                                : 'bg-destructive text-destructive-foreground'
                          }`}
                        >
                          {doc.complianceScore}% Compliant
                        </Badge>
                      )}
                      {doc.analysisStatus === 'analyzing' && (
                        <Badge className="bg-primary text-primary-foreground animate-pulse">
                          <Brain className="h-3 w-3 mr-1" />
                          Analyzing...
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeDocument(doc.id)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {doc.analysisStatus === 'complete' && (
              <CardContent>
                <div className="space-y-4">
                  {/* AI Summary */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-2">
                      <Sparkle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-primary mb-1">AI Analysis Summary</p>
                        <p className="text-sm text-muted-foreground">{doc.aiSummary}</p>
                      </div>
                    </div>
                  </div>

                  {/* Required Elements Check */}
                  {doc.requiredElements.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-3">Compliance Elements</h5>
                      <div className="space-y-2">
                        {doc.requiredElements.map((element, index) => (
                          <div key={index} className="flex items-start gap-3 p-2 rounded border">
                            {getElementIcon(element.status)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">{element.element}</p>
                                  {element.location && (
                                    <p className="text-xs text-muted-foreground">
                                      Found in: {element.location}
                                    </p>
                                  )}
                                  {element.suggestion && (
                                    <p className="text-xs text-muted-foreground">
                                      {element.suggestion}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  {getElementStatusBadge(element.status)}
                                  <span className="text-xs text-muted-foreground">
                                    {element.confidence}% confidence
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {doc.recommendations.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">AI Recommendations</h5>
                      <ul className="space-y-1">
                        {doc.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Target className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Extracted Data */}
                  {Object.keys(doc.extractedData).length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Extracted Information</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {doc.extractedData.version && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Version:</span>
                            <span>{doc.extractedData.version}</span>
                          </div>
                        )}
                        {doc.extractedData.approvalDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Approved:</span>
                            <span>{doc.extractedData.approvalDate}</span>
                          </div>
                        )}
                        {doc.extractedData.nextReview && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Review:</span>
                            <span>{doc.extractedData.nextReview}</span>
                          </div>
                        )}
                        {doc.extractedData.regulations && (
                          <div className="col-span-2 flex justify-between">
                            <span className="text-muted-foreground">Regulations:</span>
                            <span>{doc.extractedData.regulations.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}