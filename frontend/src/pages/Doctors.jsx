import { useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const Doctors = () => {

  const { speciality } = useParams();
  const location = useLocation();

  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const navigate = useNavigate();

  const { doctors, getDoctosData } = useContext(AppContext);

  const normalizeSpeciality = (label) => {
    if (!label) return null;
    const trimmed = String(label).trim();
    switch (trimmed.toLowerCase()) {
      case 'general physician':
      case 'general_physician':
      case 'general physician ':
        return 'General physician';
      case 'gynecologist':
        return 'Gynecologist';
      case 'dermatologist':
        return 'Dermatologist';
      case 'pediatricians':
      case 'pediatrician':
        return 'Pediatrician';
      case 'neurologist':
        return 'Neurologist';
      case 'gastroenterologist':
        return 'Gastroenterologist';
      default:
        return trimmed;
    }
  };

  const applyFilter = useCallback(() => {
    const qsSpeciality = new URLSearchParams(location.search).get('speciality');
    const activeSpeciality = speciality || qsSpeciality || null;
    const normalizedActive = normalizeSpeciality(activeSpeciality);
    let list = doctors;
    if (normalizedActive) {
      list = list.filter((doc) => normalizeSpeciality(doc.speciality) === normalizedActive);
    }
    if (onlyAvailable) {
      list = list.filter((doc) => doc.available);
    }
    setFilterDoc(list);
  }, [doctors, speciality, onlyAvailable, location.search]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  // Ensure latest doctors are loaded from backend
  useEffect(() => {
    (async () => {
      await getDoctosData();
      applyFilter();
    })();
  }, [getDoctosData, applyFilter]);

  const inPatientDashboard = location.pathname.startsWith('/patient-dashboard');
  const qsSpeciality = new URLSearchParams(location.search).get('speciality');
  const activeSpeciality = speciality || qsSpeciality || null;
  const normalizedActive = normalizeSpeciality(activeSpeciality);

  const toggleSpeciality = (name) => {
    const isActive = normalizedActive === normalizeSpeciality(name);
    if (inPatientDashboard) {
      if (isActive) {
        navigate('/patient-dashboard/doctors');
      } else {
        navigate(`/patient-dashboard/doctors?speciality=${encodeURIComponent(name)}`);
      }
    } else {
      if (isActive) {
        navigate('/doctors');
      } else {
        navigate(`/doctors/${encodeURIComponent(name)}`);
      }
    }
  };

  return (
    <div>
      {!location.pathname.startsWith('/patient-dashboard') && (
        <p className='text-black'>Browse through the doctors specialist.</p>
      )}
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button onClick={() => setShowFilter(!showFilter)} className={`py-1 px-3 border rounded text-sm  transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`}>Filters</button>
        <div className='flex items-center gap-2'>
          <input id='onlyAvailable' type='checkbox' checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          <label htmlFor='onlyAvailable' className='text-sm text-black'>Show available only</label>
        </div>
        <div className={`flex-col gap-4 text-sm text-black ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p onClick={() => toggleSpeciality('General physician')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${normalizedActive === normalizeSpeciality('General physician') ? 'bg-[#E2E5FF] text-black ' : ''}`}>General physician</p>
          <p onClick={() => toggleSpeciality('Gynecologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${normalizedActive === normalizeSpeciality('Gynecologist') ? 'bg-[#E2E5FF] text-black ' : ''}`}>Gynecologist</p>
          <p onClick={() => toggleSpeciality('Dermatologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${normalizedActive === normalizeSpeciality('Dermatologist') ? 'bg-[#E2E5FF] text-black ' : ''}`}>Dermatologist</p>
          <p onClick={() => toggleSpeciality('Pediatricians')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${normalizedActive === normalizeSpeciality('Pediatricians') ? 'bg-[#E2E5FF] text-black ' : ''}`}>Pediatricians</p>
          <p onClick={() => toggleSpeciality('Neurologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${normalizedActive === normalizeSpeciality('Neurologist') ? 'bg-[#E2E5FF] text-black ' : ''}`}>Neurologist</p>
          <p onClick={() => toggleSpeciality('Gastroenterologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${normalizedActive === normalizeSpeciality('Gastroenterologist') ? 'bg-[#E2E5FF] text-black ' : ''}`}>Gastroenterologist</p>
        </div>
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {filterDoc.map((item, index) => (
            <div
              onClick={() => {
                if (!item.available) {
                  toast.error('Doctor is not available for appointments');
                  return;
                }
                navigate(`/appointment/${item._id}`); scrollTo(0, 0);
              }}
              className={`border border-[#C9D8FF] rounded-xl overflow-hidden ${item.available ? 'cursor-pointer hover:translate-y-[-10px]' : 'opacity-60 cursor-not-allowed'} transition-all duration-500`}
              key={index}
            >
              <img className='bg-[#EAEFFF]' src={item.image} alt="" />
              <div className='p-4'>
                <div className={`flex items-center gap-2 text-sm text-center text-black`}>
                  <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-gray-500'}`}></p><p>{item.available ? 'Available' : 'Not Available'}</p>
                </div>
                <p className='text-black text-lg font-medium'>{item.name}</p>
                <p className='text-black text-sm'>{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
