import React from 'react';
import Contactform from './Contactform';
import Smallcard from './Smallcard';
import './Contact.css';

function Contact(){
    return(
        <div className='contact'>
            <h5>Contact US</h5>
            <div className='contact_data'>
                <Smallcard />
                <Contactform />
            </div>
        </div>
    );
}

export default Contact;
