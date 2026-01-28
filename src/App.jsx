import { useState } from 'react'
import { Sidebar, MobileNav, MobileHeader } from './components'
import { TDEECalculator, MacroCalculator, BodyFatCalculator, FatLossCalculator, ProgressDashboard } from './calculators'

const pageTitles = {
  tdee: 'TDEE Calculator',
  macros: 'Macro Splitter',
  bodyfat: 'Body Fat Calculator',
  fatloss: 'Fat Loss Required',
  progress: 'Progress Tracker',
}

function App() {
  const [currentPage, setCurrentPage] = useState('tdee')
  const [sharedTDEE, setSharedTDEE] = useState(null)
  const [sharedWeight, setSharedWeight] = useState(null)
  const [sharedWeightUnit, setSharedWeightUnit] = useState(null)

  const handleUseTDEE = (tdee, weight, weightUnit) => {
    setSharedTDEE(tdee)
    setSharedWeight(weight)
    setSharedWeightUnit(weightUnit)
    setCurrentPage('macros')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'tdee':
        return <TDEECalculator onUseTDEE={handleUseTDEE} />
      case 'macros':
        return (
          <MacroCalculator
            key={`${sharedTDEE}-${sharedWeight}-${sharedWeightUnit}`}
            initialTDEE={sharedTDEE}
            initialWeight={sharedWeight}
            initialWeightUnit={sharedWeightUnit}
          />
        )
      case 'bodyfat':
        return <BodyFatCalculator />
      case 'fatloss':
        return <FatLossCalculator />
      case 'progress':
        return <ProgressDashboard />
      default:
        return <TDEECalculator onUseTDEE={handleUseTDEE} />
    }
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 pb-20 md:pb-0">
        <MobileHeader title={pageTitles[currentPage]} />

        <div className="max-w-2xl mx-auto p-4 md:p-8">
          {renderPage()}
        </div>
      </main>

      <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  )
}

export default App
