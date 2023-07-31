import React from 'react'
// import './navbar.css'
import 'src/components/Navbar/navbar.css'


const Navbar = () => {
  return (
    <div className='Navbar'>
        <div className="nav-title">
            Untitled Jam
        </div>        
        <button className='nav-btn'>Invite A Friend</button>
        <button className='nav-btn'>Save</button>

    </div>
  )
}

export default Navbar
