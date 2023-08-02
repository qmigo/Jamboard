import React, { useEffect, useState } from 'react'
import 'src/components/Navbar/navbar.css'

const Navbar = ({socket, setUserName}) => {

  return (
    <div className='Navbar'>
        <div className="nav-title">
            Untitled
        </div>        
        
        <input type="text" className='nav-btn' placeholder='Username' onChange={(e)=> {setUserName(e.target.value)}}/>

    </div>
  )
}

export default Navbar
