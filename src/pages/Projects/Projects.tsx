import { useState } from 'react'
import ProjectsTab from './ProjectsTab'
import RecognitionTab from './RecognitionTab'
import AwardsTab from './AwardsTab'

type ProjectsTabId = 'pt-projects' | 'pt-recognition' | 'pt-awards'

interface ProjectsProps {
  isActive: boolean
}

const TABS: { id: ProjectsTabId; label: string }[] = [
  { id: 'pt-projects', label: 'Projects' },
  { id: 'pt-recognition', label: 'Achievements' },
  { id: 'pt-awards', label: 'Awards' },
]

export default function Projects({ isActive }: ProjectsProps) {
  const [activeTab, setActiveTab] = useState<ProjectsTabId>('pt-projects')

  return (
    <div id="page-projects" className={`page${isActive ? ' active' : ''}`}>
      <div className="shell">
        <p className="pg-label fade-1">Featured Work</p>
        <h2 className="pg-title fade-2">Projects &amp; Recognition.</h2>

        <div className="tab-row">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tbt${activeTab === tab.id ? ' on' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Each tab component keeps its own internal "tp" / "on" class
            structure for styling parity with the original CSS, but we
            only render the active one to keep things simple in React. */}
        {activeTab === 'pt-projects' && <ProjectsTab />}
        {activeTab === 'pt-recognition' && <RecognitionTab />}
        {activeTab === 'pt-awards' && <AwardsTab />}
      </div>
    </div>
  )
}
