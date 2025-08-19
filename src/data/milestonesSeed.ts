import { addDays, addWeeks, subDays } from 'date-fns'

export interface Milestone {
  id: string
  title: string
  description: string
  category: 'audit' | 'compliance' | 'regulatory' | 'training' | 'documentation' | 'risk-management'
  priority: 'high' | 'medium' | 'low'
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'at-risk'
  targetDate: Date
  startDate: Date
  completedDate?: Date
  progress: number
  dependencies: string[]
  assignees: string[]
  deliverables: string[]
  riskFactors: string[]
  framework: string[]
}

export const SAMPLE_MILESTONES: Milestone[] = [
  {
    id: '1',
    title: 'FDA 510(k) Pre-Submission Meeting',
    description: 'Prepare and conduct pre-submission meeting with FDA to discuss regulatory pathway for new medical device',
    category: 'regulatory',
    priority: 'high',
    status: 'completed',
    targetDate: subDays(new Date(), 15),
    startDate: subDays(new Date(), 45),
    completedDate: subDays(new Date(), 12),
    progress: 100,
    dependencies: [],
    assignees: ['Sarah Johnson', 'Michael Chen'],
    deliverables: ['Meeting minutes', 'FDA feedback summary', 'Updated regulatory strategy'],
    riskFactors: [],
    framework: ['FDA QSR', 'ISO 13485']
  },
  {
    id: '2',
    title: 'EU MDR Technical Documentation Review',
    description: 'Complete comprehensive review of technical documentation for EU MDR compliance',
    category: 'regulatory',
    priority: 'high',
    status: 'in-progress',
    targetDate: addDays(new Date(), 14),
    startDate: subDays(new Date(), 30),
    progress: 82,
    dependencies: ['1'],
    assignees: ['Elena Rodriguez', 'James Wilson'],
    deliverables: ['Technical file update', 'Gap analysis report', 'Compliance matrix'],
    riskFactors: ['Incomplete clinical data', 'Translation delays'],
    framework: ['EU MDR']
  },
  {
    id: '3',
    title: 'ISO 13485:2016 Internal Audit',
    description: 'Conduct comprehensive internal audit of quality management system per ISO 13485:2016',
    category: 'audit',
    priority: 'medium',
    status: 'in-progress',
    targetDate: addDays(new Date(), 28),
    startDate: new Date(),
    progress: 35,
    dependencies: [],
    assignees: ['David Park', 'Lisa Thompson'],
    deliverables: ['Audit plan', 'Audit findings report', 'CAPA recommendations'],
    riskFactors: ['Resource availability', 'Documentation gaps'],
    framework: ['ISO 13485']
  },
  {
    id: '4',
    title: 'Risk Management File Update',
    description: 'Update risk management file according to ISO 14971:2019 requirements',
    category: 'risk-management',
    priority: 'high',
    status: 'at-risk',
    targetDate: addDays(new Date(), 7),
    startDate: subDays(new Date(), 21),
    progress: 45,
    dependencies: ['2'],
    assignees: ['Maria Santos', 'Alex Kim'],
    deliverables: ['Updated risk analysis', 'Risk control measures', 'Post-market surveillance plan'],
    riskFactors: ['Tight timeline', 'Pending clinical data'],
    framework: ['ISO 14971']
  },
  {
    id: '5',
    title: 'Design Controls Training Program',
    description: 'Implement comprehensive design controls training for engineering team',
    category: 'training',
    priority: 'medium',
    status: 'not-started',
    targetDate: addWeeks(new Date(), 6),
    startDate: addDays(new Date(), 7),
    progress: 0,
    dependencies: ['3'],
    assignees: ['Jennifer Lee', 'Robert Brown'],
    deliverables: ['Training curriculum', 'Assessment materials', 'Certification records'],
    riskFactors: ['Trainer availability', 'Schedule conflicts'],
    framework: ['FDA QSR', 'ISO 13485']
  },
  {
    id: '6',
    title: 'Clinical Data Management System Validation',
    description: 'Validate clinical data management system for upcoming clinical studies',
    category: 'compliance',
    priority: 'high',
    status: 'delayed',
    targetDate: subDays(new Date(), 5),
    startDate: subDays(new Date(), 60),
    progress: 65,
    dependencies: [],
    assignees: ['Thomas Anderson', 'Rachel Green'],
    deliverables: ['Validation protocol', 'Test execution records', 'Validation report'],
    riskFactors: ['System bugs', 'Vendor delays'],
    framework: ['GxP', 'FDA QSR']
  },
  {
    id: '7',
    title: 'Quality Manual Revision 3.0',
    description: 'Complete revision of quality manual to incorporate latest regulatory changes',
    category: 'documentation',
    priority: 'medium',
    status: 'in-progress',
    targetDate: addWeeks(new Date(), 4),
    startDate: subDays(new Date(), 14),
    progress: 60,
    dependencies: ['2', '3'],
    assignees: ['Patricia Davis', 'Kevin Liu'],
    deliverables: ['Updated quality manual', 'Training materials', 'Implementation plan'],
    riskFactors: ['Stakeholder alignment'],
    framework: ['ISO 13485', 'FDA QSR', 'EU MDR']
  },
  {
    id: '8',
    title: 'Supplier Audit Program Launch',
    description: 'Establish comprehensive supplier audit program for critical components',
    category: 'audit',
    priority: 'low',
    status: 'not-started',
    targetDate: addWeeks(new Date(), 8),
    startDate: addWeeks(new Date(), 2),
    progress: 0,
    dependencies: ['7'],
    assignees: ['Michelle Taylor', 'Daniel Martinez'],
    deliverables: ['Audit procedures', 'Supplier evaluation criteria', 'Audit schedule'],
    riskFactors: ['Supplier cooperation', 'Travel restrictions'],
    framework: ['ISO 13485', 'FDA QSR']
  }
]