import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Contactform.css';

const Contactform = () => {
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        phone: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://93.127.167.205:5000/sendEmail', formData);
            console.log('Email sent:', response.data);
            setLoading(false);
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Message sent successfully!',
                confirmButtonText: 'OK'
            });

            setFormData({
                fname: '',
                lname: '',
                phone: '',
                email: '',
                message: ''
            });

        } catch (error) {
            console.error('Error sending message:', error);
            setLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Failed to send message. Please try again later.',
                confirmButtonText: 'OK'
            });
        }
    };

    return (
       <div className='contactform'>
              <form onSubmit={handleSubmit}>
            <div className='contactform_top1'>
                <div className='contactform_input'>
                    <label>First Name</label>
                    <input type="text" name="fname" value={formData.fname} onChange={handleChange} required />
                </div>
                <div className='contactform_input'>
                    <label>Last Name</label>
                    <input type="text" name="lname" value={formData.lname} onChange={handleChange} required />
                </div>
            </div>

            <div className='contactform_top2'>
                <div className='contactform_input'>
                    <label>Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className='contactform_input'>
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
            </div>

            <div className='contactform_input'>
                <label>Message</label>
                <input name="message" value={formData.message} onChange={handleChange} required placeholder='Write your message..'></input>
            </div>
            
            <div className='contactform_btn'>
                <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Message'}</button>
            </div>
        </form>
       </div>
    );
};

export default Contactform;
