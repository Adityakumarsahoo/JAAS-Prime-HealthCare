import { useContext, useEffect, useState } from "react";
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Moon, Sun } from "lucide-react";

const Navbar = () => {

  const navigate = useNavigate()

  const [showMenu, setShowMenu] = useState(false)
  const [dark, setDark] = useState(() => {
    try {
      const userTheme = localStorage.getItem('theme');
      if (userTheme === 'dark') return true;
      if (userTheme === 'light') return false;
      const raw = localStorage.getItem('adminSettings');
      const settings = raw ? JSON.parse(raw) : null;
      if (settings?.general?.darkMode !== undefined) return !!settings.general.darkMode;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  })

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      // Notify other components to sync icon state
      window.dispatchEvent(new CustomEvent('themechange', { detail: dark ? 'dark' : 'light' }));
    } catch {}
  }, [dark]);

  // Listen for theme changes triggered elsewhere to keep icon in sync
  useEffect(() => {
    const onThemeChange = (e) => {
      const next = e?.detail === 'dark';
      setDark(next);
    };
    const onStorage = (e) => {
      if (e.key === 'theme') setDark(e.newValue === 'dark');
    };
    window.addEventListener('themechange', onThemeChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('themechange', onThemeChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  const { aToken, setAToken, userData } = useContext(AppContext)

  const logout = () => {
    localStorage.removeItem('aToken')
    localStorage.removeItem('role')
    setAToken("")
    navigate('/login')
  }

  return (
    <div data-global-navbar className='flex items-center justify-between text-sm text-black py-4 mb-5 border-b border-gray-200 bg-white rounded-xl shadow-sm px-4'>
      <div onClick={() => navigate('/')} className='flex items-center gap-2 cursor-pointer'>
        <img className='w-8 h-8' src={assets.medical_icon} alt="Medical Icon" />
        <span className='text-2xl font-bold text-black'>JAAS</span>
      </div>
      <ul className='md:flex items-start gap-5 font-medium hidden'>
        <NavLink to='/' >
          <li className='py-1 text-black'>HOME</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/doctors' >
          <li className='py-1 text-black'>ALL DOCTORS</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/about' >
          <li className='py-1 text-black'>ABOUT</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/contact' >
          <li className='py-1 text-black'>CONTACT</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
      </ul>

      <div className='flex items-center gap-4 '>
        {/* Theme toggle icon */}
        <button
          aria-label="Toggle theme"
          onClick={() => setDark((d) => !d)}
          className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-100'
          title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {dark ? <Sun size={18} className='text-black' /> : <Moon size={18} className='text-black' />}
        </button>
        {
          aToken && userData
            ? <div className='flex items-center gap-2 cursor-pointer group relative'>
              <img className='w-8 rounded-full' src={userData.image} alt="" />
              <img className='w-2.5' src={assets.dropdown_icon} alt="" />
              <div className='absolute top-0 right-0 pt-14 text-base font-medium text-black z-20 hidden group-hover:block'>
                <div className='min-w-48 bg-gray-50 rounded flex flex-col gap-4 p-4'>
                  <p
                    onClick={() => {
                      const role = localStorage.getItem('role') || userData?.role;
                      if (role === 'PATIENT') {
                        navigate('/patient-dashboard/profile');
                      } else if (role === 'DOCTOR') {
                        navigate('/doctor-profile');
                      } else {
                        navigate('/my-profile');
                      }
                    }}
                    className='hover:text-black cursor-pointer'
                  >
                    My Profile
                  </p>
                  <p onClick={() => navigate('/my-appointments')} className='hover:text-black cursor-pointer'>My Appointments</p>
                  <p onClick={logout} className='hover:text-black cursor-pointer'>Logout</p>
                </div>
              </div>
            </div>
            : <button onClick={() => navigate('/login')} className='bg-primary text-black px-8 py-3 rounded-full font-light hidden md:block'>Create account</button>
        }
        <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />

        {/* ---- Mobile Menu ---- */}
        <div className={`md:hidden ${showMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className='flex items-center justify-between px-5 py-6'>
            <div className='flex items-center gap-2'>
              <img className='w-7 h-7' src={assets.medical_icon} alt="Medical Icon" />
              <span className='text-xl font-bold text-black'>JAAS</span>
            </div>
            <div className='flex items-center gap-3'>
              <button
                aria-label="Toggle theme"
                onClick={() => setDark((d) => !d)}
                className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-100'
                title={dark ? 'Light Mode' : 'Dark Mode'}
              >
                {dark ? <Sun size={18} className='text-black' /> : <Moon size={18} className='text-black' />}
              </button>
              <img onClick={() => setShowMenu(false)} src={assets.cross_icon} className='w-7' alt="" />
            </div>
          </div>
          <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
            <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-4 py-2 rounded full inline-block text-black'>HOME</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors' ><p className='px-4 py-2 rounded full inline-block text-black'>ALL DOCTORS</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about' ><p className='px-4 py-2 rounded full inline-block text-black'>ABOUT</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact' ><p className='px-4 py-2 rounded full inline-block text-black'>CONTACT</p></NavLink>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar