import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState('hindi')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [currentReport, setCurrentReport] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  return (
    <AppContext.Provider value={{
      selectedLanguage, setSelectedLanguage,
      sidebarOpen, setSidebarOpen,
      authModalOpen, setAuthModalOpen,
      authMode, setAuthMode,
      currentReport, setCurrentReport,
      selectedFile, setSelectedFile,
      openAuthModal
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)