import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingHero from './components/LandingHero'
import FamilyGraph from './components/FamilyGraph'
import PersonCard from './components/PersonCard'
import Timeline from './components/Timeline'
import StoryTrails from './components/StoryTrails'
import StoryCard from './components/StoryCard'
import ContributeModal from './components/ContributeModal'
import { useFamilyStore } from './data/store'

function GraphPage() {
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [showContribute, setShowContribute] = useState(false)

  return (
    <>
      <LandingHero />
      <div id="family-graph" className="relative" style={{ height: 'calc(100vh - 80px)' }}>
        <FamilyGraph onSelectPerson={setSelectedPerson} />
        {selectedPerson && (
          <PersonCard
            personId={selectedPerson}
            onClose={() => setSelectedPerson(null)}
            onSelectPerson={setSelectedPerson}
            onAddStory={() => setShowContribute(true)}
          />
        )}
      </div>
      {showContribute && (
        <ContributeModal onClose={() => setShowContribute(false)} initialTab="story" />
      )}
    </>
  )
}

function StoriesPage() {
  const { stories } = useFamilyStore()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-semibold text-[#e2c275] mb-2">
        Family Stories
      </h1>
      <p className="text-gray-400 mb-8">
        Memories, traditions, and milestones shared by family members.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  )
}

function TimelinePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-semibold text-[#e2c275] mb-2">
        Family Timeline
      </h1>
      <p className="text-gray-400 mb-8">
        Key moments across generations.
      </p>
      <Timeline />
    </div>
  )
}

function TrailsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-semibold text-[#e2c275] mb-2">
        Story Trails
      </h1>
      <p className="text-gray-400 mb-8">
        Follow curated journeys through our family history.
      </p>
      <StoryTrails />
    </div>
  )
}

function App() {
  const [showContribute, setShowContribute] = useState(false)

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-gray-200">
      <Navbar onContributeClick={() => setShowContribute(true)} />
      <Routes>
        <Route path="/" element={<GraphPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/trails" element={<TrailsPage />} />
      </Routes>
      {showContribute && (
        <ContributeModal onClose={() => setShowContribute(false)} />
      )}
    </div>
  )
}

export default App
