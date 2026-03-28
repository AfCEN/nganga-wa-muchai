import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingHero from './components/LandingHero'
import FamilyGraph from './components/FamilyGraph'
import PersonCard from './components/PersonCard'
import Timeline from './components/Timeline'
import StoryTrails from './components/StoryTrails'
import StoryCard from './components/StoryCard'
import ContributeModal from './components/ContributeModal'
import LoginPage, { SetupPage, JoinPage } from './components/LoginPage'
import Onboarding from './components/Onboarding'
import { useFamilyStore } from './data/store'
import { useAuth } from './data/auth'

function GraphPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [showContribute, setShowContribute] = useState(false)

  useEffect(() => {
    const personId = searchParams.get('person')
    if (personId) {
      setSelectedPerson(personId)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

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

function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#e2c275]/30 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>404</h1>
        <p className="text-gray-400 mb-6">This page doesn't exist.</p>
        <a href="/" className="text-[#e2c275] hover:text-[#f0d68a] transition-colors">Go back home</a>
      </div>
    </div>
  )
}

function App() {
  const [showContribute, setShowContribute] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  function handleContributeClick() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setShowContribute(true)
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-gray-200">
      <Navbar onContributeClick={handleContributeClick} />
      <Routes>
        <Route path="/" element={<GraphPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/trails" element={<TrailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {showContribute && (
        <ContributeModal onClose={() => setShowContribute(false)} />
      )}
      <Onboarding />
    </div>
  )
}

export default App
