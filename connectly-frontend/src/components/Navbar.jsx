import { useState } from 'react';

function Navbar({ user, onLoginClick, onRegisterClick, onLogout, onHomeClick, onAccountClick }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="#" onClick={(e) => { e.preventDefault(); if (onHomeClick) onHomeClick(); }} className="font-bold text-2xl text-gray-700">
              <img src='/src/assets/logo.png' alt='Connectly Logo' className="h-12 mr-2 inline" />
              Connectly
            </a>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.name}!</span>
                  <button onClick={() => onAccountClick && onAccountClick()} className="text-gray-700 hover:text-gray-900 ml-2">Account</button>
                  <button onClick={onLogout} className="text-gray-500 hover:text-gray-900 ml-2">Logout</button>
                </>
              ) : (
                <>
                  <button onClick={onRegisterClick} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition">
                    Register
                  </button>
                  <button onClick={onLoginClick} className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100">
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <button onClick={() => { if (onAccountClick) onAccountClick(); }} className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Account</button>
                <button onClick={onLogout} className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <button onClick={onRegisterClick} className="text-white bg-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Register</button>
                <button onClick={onLoginClick} className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Login</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;