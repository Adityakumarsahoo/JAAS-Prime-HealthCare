import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {

  const [state, setState] = useState('Login') // 'Login' or 'Sign Up'
  const [role, setRole] = useState('patient') // 'patient', 'doctor', 'admin'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [speciality, setSpeciality] = useState('')

  const navigate = useNavigate()
  const { backendUrl, aToken, setAToken } = useContext(AppContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      let endpoint = ''
      let payload = { email, password }

      // Determine API endpoint and payload
      if (state === 'Sign Up') {
        if (role === 'doctor') {
          endpoint = `${backendUrl}/api/auth/register`
          payload = { 
            fullName: name, 
            email, 
            password, 
            role: role.toUpperCase(),
            speciality
          }
        } else if (role === 'patient') {
          endpoint = `${backendUrl}/api/auth/register`
          payload = { 
            fullName: name, 
            email, 
            password,
            role: role.toUpperCase()
          }
        } else {
          toast.error('Admin accounts cannot be created here.')
          return
        }
      } else {
        if (role === 'doctor') {
          // reuse the common auth login endpoint for doctors
          endpoint = `${backendUrl}/api/auth/login`
        } else if (role === 'patient') {
          endpoint = `${backendUrl}/api/auth/login`
        } else if (role === 'admin') {
          // admin login also handled by auth controller
          endpoint = `${backendUrl}/api/auth/login`
        }
      }

      const response = await axios.post(endpoint, payload)
      console.log('Server response:', response.data) // For debugging

      if (state === 'Sign Up') {
        // Registration response handling
        if (response.data.id) { // Successfully registered
          toast.success('Registration successful! Please log in.')
          setState('Login')
          setPassword('')
          setSpeciality('') // Clear speciality if it was set
        } else {
          toast.error(response.data.message || 'Registration failed')
        }
      } else {
        // Login response handling
        const token = response.data.token
        const serverRole = response.data.role // Get role from server response if available
        const fullName = response.data.fullName // May be absent; we'll fetch profile if missing
        const emailFromServer = response.data.email

        if (token) {
          const cleanToken = token ? token.trim() : token;
          console.log('[Login] received token:', token, 'cleanToken:', cleanToken);
          localStorage.setItem('aToken', cleanToken)
          localStorage.setItem('role', serverRole || role.toUpperCase())

          // Persist any provided name/email from login response
          if (typeof fullName === 'string' && fullName.trim().length > 0) {
            localStorage.setItem('fullName', fullName.trim())
          } else {
            localStorage.removeItem('fullName')
          }
          if (typeof emailFromServer === 'string' && emailFromServer.trim().length > 0) {
            localStorage.setItem('email', emailFromServer.trim())
          }

          // If full name wasn't provided at login, fetch user profile to populate it
          try {
            const roleUpper = (serverRole || role).toUpperCase();
            const profileEndpoint = roleUpper === 'DOCTOR'
              ? `${backendUrl}/api/doctors/profile`
              : roleUpper === 'PATIENT'
                ? `${backendUrl}/api/patients/profile`
                : null;

            if (profileEndpoint) {
              const profileRes = await axios.get(profileEndpoint, {
                headers: { Authorization: `Bearer ${cleanToken}` },
              });
              const profileData = profileRes?.data || {};
              const profileName = (profileData.fullName || '').trim();
              const profileEmail = (profileData.email || '').trim();
              if (profileName) localStorage.setItem('fullName', profileName);
              if (profileEmail) localStorage.setItem('email', profileEmail);
            }
          } catch (e) {
            console.warn('Login: failed to fetch profile for name population', e);
          }

          setAToken(cleanToken)
          toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} logged in successfully!`)

          // Immediate navigation after successful login
          if (role === 'admin') navigate('/admin')
          else if (role === 'doctor') navigate('/doctor-dashboard')
          else if (role === 'patient') navigate('/patient-dashboard')
          else navigate('/')
        } else {
          toast.error(response.data.message || 'Login failed')
        }
      }

    } catch (error) {
      console.error(error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
  <div className='flex flex-col gap-3 m-auto items-start p-4 w-full max-w-[420px] sm:p-8 sm:max-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        
        {/* Title */}
        <p className='text-2xl font-semibold'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to continue</p>

        {/* Role Selector */}
        <div className='w-full'>
          <p className='mb-1 font-medium'>Select Role</p>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className='border border-[#DADADA] rounded w-full p-2'
          >
            {state === 'Sign Up' ? (
              <>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </>
            ) : (
              <>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </>
            )}
          </select>
        </div>

        {/* Full Name (only for signup) */}
        {state === 'Sign Up' && (
          <div className='w-full'>
            <p>Full Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              className='border border-[#DADADA] rounded w-full p-2 mt-1'
              type="text"
              required
            />
          </div>
        )}

        {/* Speciality (only for doctor signup) */}
        {state === 'Sign Up' && role === 'doctor' && (
          <div className='w-full'>
            <p>Speciality</p>
            <input
              onChange={(e) => setSpeciality(e.target.value)}
              value={speciality}
              className='border border-[#DADADA] rounded w-full p-2 mt-1'
              type="text"
              placeholder="e.g., Cardiologist"
              required
            />
          </div>
        )}

        {/* Email */}
        <div className='w-full'>
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className='border border-[#DADADA] rounded w-full p-2 mt-1'
            type="email"
            required
          />
        </div>

        {/* Password */}
        <div className='w-full'>
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className='border border-[#DADADA] rounded w-full p-2 mt-1'
            type="password"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          className='bg-primary text-white w-full py-2 my-2 rounded-md text-base hover:bg-primary/90 transition'
        >
          {state === 'Sign Up'
            ? (role === 'doctor' ? 'Register as Doctor' : 'Create Account')
            : 'Login'}
        </button>

        {/* Switch Between Login and Signup */}
        {state === 'Sign Up' ? (
          <p>
            Already have an account?{' '}
            <span
              onClick={() => setState('Login')}
              className='text-primary underline cursor-pointer'
            >
              Login here
            </span>
          </p>
        ) : (
          <p>
            Don’t have an account?{' '}
            <span
              onClick={() => setState('Sign Up')}
              className='text-primary underline cursor-pointer'
            >
              Create one
            </span>
          </p>
        )}
      </div>
    </form>
  )
}

export default Login
