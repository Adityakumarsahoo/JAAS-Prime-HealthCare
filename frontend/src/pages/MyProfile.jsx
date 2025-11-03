import { useCallback, useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import PropTypes from 'prop-types';
import { assets } from '../assets/assets'
import { User, Mail, Phone, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import { getCurrentPatient, updateCurrentPatient } from "../services/UserService";

const MyProfile = () => {
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)
    const [originalUserData, setOriginalUserData] = useState(null)
    const { aToken, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)

    // Load patient profile from backend
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getCurrentPatient();
                const data = res?.data || {};
                const merged = {
                    id: data.id ?? "",
                    name: data.fullName ?? data.name ?? "",
                    email: data.email ?? "",
                    phone: data.phone ?? "",
                    address: data.address ?? { line1: "", line2: "" },
                    gender: data.gender ?? "Not Selected",
                    dob: data.dob ?? "",
                    image: data.image ?? assets?.profile_pic ?? "",
                };
                setUserData(merged);
                setOriginalUserData(merged);
            } catch (e) {
                console.error("Failed to load patient profile", e);
            }
        };
        if (aToken) fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aToken]);

    const handleNameChange = useCallback((e) => {
        setUserData(prev => ({ ...prev, name: e.target.value }))
    }, [setUserData])

    const handlePhoneChange = useCallback((e) => {
        setUserData(prev => ({ ...prev, phone: e.target.value }))
    }, [setUserData])

    const handleAddressLine1Change = useCallback((e) => {
        setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))
    }, [setUserData])

    const handleAddressLine2Change = useCallback((e) => {
        setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))
    }, [setUserData])

    const handleGenderChange = useCallback((e) => {
        setUserData(prev => ({ ...prev, gender: e.target.value }))
    }, [setUserData])

    const handleDobChange = useCallback((e) => {
        setUserData(prev => ({ ...prev, dob: e.target.value }))
    }, [setUserData])

    const handleImageChange = useCallback((e) => {
        setImage(e.target.files[0])
    }, [])

    // Update patient profile using service endpoint
    const updateUserProfileData = useCallback(async () => {
        try {
            const payload = {
                fullName: userData.name,
                email: userData.email,
            };
            const res = await updateCurrentPatient(userData.id, payload);
            if (res && res.status >= 200 && res.status < 300) {
                toast.success("Profile updated");
                setIsEdit(false);
                setImage(false);
                setOriginalUserData(userData);
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message || "Update failed");
        }
    }, [userData])

    const resetChanges = useCallback(() => {
        if (originalUserData) {
            setUserData(originalUserData);
        }
        setIsEdit(false);
        setImage(false);
    }, [originalUserData, setUserData])

    return userData ? (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-2 text-indigo-600 mb-4">
                <User className="w-5 h-5" />
                <h1 className="text-2xl font-semibold">My Profile</h1>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-4 mb-6">
                    {isEdit ? (
                        <label htmlFor="image" className="inline-block relative cursor-pointer">
                            <img className="w-24 h-24 rounded-full object-cover opacity-80" src={image ? URL.createObjectURL(image) : userData.image} alt="Profile" />
                            <div className="absolute bottom-1 right-1 bg-indigo-600 text-white p-1 rounded-full">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                            <input onChange={handleImageChange} type="file" id="image" hidden />
                        </label>
                    ) : (
                        <img className="w-24 h-24 rounded-full object-cover" src={userData.image} alt="Profile" />
                    )}

                    <div className="flex-1">
                        {isEdit ? (
                            <input className="w-full border rounded px-3 py-2 text-xl" type="text" onChange={handleNameChange} value={userData.name} />
                        ) : (
                            <p className="text-2xl font-medium text-gray-800">{userData.name}</p>
                        )}
                        <div className="flex items-center text-gray-500 mt-1">
                            <Mail className="w-4 h-4 mr-2" />
                            <span>{userData.email}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Email</label>
                        {isEdit ? (
                            <input className="w-full border rounded px-3 py-2" value={userData.email} onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))} />
                        ) : (
                            <p className="text-gray-700">{userData.email}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Phone</label>
                        {isEdit ? (
                            <div className="flex items-center border rounded px-3 py-2">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                <input className="flex-1 outline-none" value={userData.phone} onChange={handlePhoneChange} />
                            </div>
                        ) : (
                            <div className="flex items-center text-gray-700">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                <span>{userData.phone || '—'}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Address Line 1</label>
                        {isEdit ? (
                            <div className="flex items-center border rounded px-3 py-2">
                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                <input className="flex-1 outline-none" value={userData.address.line1} onChange={handleAddressLine1Change} />
                            </div>
                        ) : (
                            <p className="text-gray-700">{userData.address.line1 || '—'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Address Line 2</label>
                        {isEdit ? (
                            <input className="w-full border rounded px-3 py-2" value={userData.address.line2} onChange={handleAddressLine2Change} />
                        ) : (
                            <p className="text-gray-700">{userData.address.line2 || '—'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Gender</label>
                        {isEdit ? (
                            <select className="w-full border rounded px-3 py-2" onChange={handleGenderChange} value={userData.gender} >
                                <option value="Not Selected">Not Selected</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        ) : (
                            <p className="text-gray-700">{userData.gender}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Birthday</label>
                        {isEdit ? (
                            <div className="flex items-center border rounded px-3 py-2">
                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                <input className="flex-1 outline-none" type='date' onChange={handleDobChange} value={userData.dob} />
                            </div>
                        ) : (
                            <p className="text-gray-700">{userData.dob || '—'}</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                    {isEdit ? (
                        <>
                            <button onClick={updateUserProfileData} className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                Save Changes
                            </button>
                            <button onClick={resetChanges} className="px-5 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEdit(true)} className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100">
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Note: Currently, saving updates Name and Email. Other fields are shown for convenience and can be enabled for persistence later.</p>
        </div>
    ) : (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="bg-white rounded-xl shadow-md p-6 text-gray-700">
                Please log in to view and edit your profile.
            </div>
        </div>
    )
}

MyProfile.propTypes = {
    // Add props validation here when props are added
}

export default MyProfile