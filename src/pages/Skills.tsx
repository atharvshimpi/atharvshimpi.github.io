import { useState } from 'react'
import { skillCategories } from '../data/skills'
import type { SkillCategoryId } from '../types'

interface SkillsProps {
  isActive: boolean
}

export default function Skills({ isActive }: SkillsProps) {
  const [activeTab, setActiveTab] = useState<SkillCategoryId>('languages')
  const activeCategory = skillCategories.find((c) => c.id === activeTab)

  return (
    <div id="page-skills" className={`page${isActive ? ' active' : ''}`}>
      <div className="skills-inner">
        <p className="pg-label fade-1">Capabilities</p>
        <h2 className="pg-title fade-2">Tools of the trade.</h2>

        <div className="tab-row">
          {skillCategories.map((category) => (
            <button
              key={category.id}
              className={`tbt${activeTab === category.id ? ' on' : ''}`}
              onClick={() => setActiveTab(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {activeCategory && (
          <div className="tp on">
            <div className="chips">
              {activeCategory.chips.map((chip) => (
                <span
                  className={`ch${chip.primary ? ' primary' : ''}`}
                  key={chip.label}
                >
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
