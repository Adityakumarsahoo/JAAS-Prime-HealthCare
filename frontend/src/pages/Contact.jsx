import { useCallback } from 'react'
import PropTypes from 'prop-types'
import { assets } from '../assets/assets'

const Contact = () => {
    const handleExploreJobs = useCallback(() => {
        // Add job exploration logic here when needed
        console.log('Exploring jobs')
    }, [])
  return (
    <div>

      <div className='text-center text-2xl pt-10 text-[#707070]'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
  <img className='w-full md:max-w-[360px] h-auto' src={assets.contact_image} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className=' font-semibold text-lg text-gray-600'>OUR HOSPITAL</p>
          <p className=' text-gray-500'>Marathahalli <br /> Bengaluru, India</p>
          <p className=' text-gray-500'>Tel: +91 9876543210 <br /> Email: tojaas@medical.com</p>
          <p className=' font-semibold text-lg text-gray-600'>CAREERS AT JAAS</p>
          <p className=' text-gray-500'>Learn more about our teams and job openings.</p>
          <button 
            onClick={handleExploreJobs}
            className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'
          >
            Explore Jobs
          </button>
        </div>
      </div>

    </div>
  )
}

Contact.propTypes = {
    // Add props validation here when props are added
}

export default Contact
