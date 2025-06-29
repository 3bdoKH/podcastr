import React from 'react'
import './Box.css'
import { Play } from 'lucide-react'

const Box = ({img, title, author, date}) => {
    return (
        <div className='box'>
        <div className="box-image">
            <img src={img} alt="podcast image" />
        </div>
        <div className="box-data">
            <h3 className="box-title">{title}</h3>
            <div className="box-details">
                <div>
                    <p className='author'>{author}</p>
                    <p className='date'>{date}</p>
                </div>
                <div className="box-play">
                <Play size={20} color="#77ff5c" strokeWidth={3} />
                </div>
            </div>
        </div>
        </div>
    )
}

export default Box
