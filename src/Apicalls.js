import React, { useEffect, useState } from 'react'
// import Navbar from './navbar'

const Apicalls = () => {
    const [Posts, setPosts] = useState([]);
    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/posts/')
            .then(res => res.json())
            .then(data => setPosts(data)) // store full array of posts
            .catch(err => console.log(err));
          
    }, []);
    console.log(Posts);

    return (
        <div>
            <div className='container'>
               {
                Posts.map(post => {
                    return(
                         <div className='postBody p-3' style={{ border: "2px solid red", width: "30em", borderRadius: "10px", marginTop: "20px" }}>
                    <div className='postTitle' >
                        <h2>{post.title}</h2>
                    </div>
                    <div className='postContent'>
                        <p>{post.body}</p>
                    </div>
                    <p>Post ID: {post.id}</p>

                </div>
                    )
                })
               }
            </div>
        </div>
    )
}

export default Apicalls
