import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext) || {}; // ✅ Prevent undefined

  // ✅ Fallback to empty array if doctors is not yet loaded
  const topDoctors = Array.isArray(doctors) ? doctors.slice(0, 4) : [];

  return (
    <div className="my-12">
      <h2 className="text-2xl font-semibold mb-6 text-center text-[#001F3F]">
        Top Doctors
      </h2>

      {topDoctors.length === 0 ? (
        <p className="text-center text-gray-500">No doctors available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white shadow rounded-xl p-4 cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(`/appointment/${doc._id}`)}
            >
              <img
                src={doc.image || "/default-doctor.png"}
                alt={doc.name}
                className="w-full h-60 object-cover object-center rounded-lg mb-3 shadow-sm hover:shadow-md transition-all"
              />
              <h3 className="text-lg font-bold text-black">{doc.name}</h3>
              <p className="text-sm text-black">{doc.speciality}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopDoctors;
