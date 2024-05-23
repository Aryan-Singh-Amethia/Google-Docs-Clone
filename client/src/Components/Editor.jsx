import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import styled from '@emotion/styled';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

const Component = styled.div`
  background-color: #F5F5F5;
`;

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
    ['link', 'image', 'video', 'formula'],
  
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
  
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
  
    ['clean']                                         // remove formatting button
  ];

function Editor() {

    const [socket, setSocket] = useState(null);
    const [quill, setQuill] = useState(null);

    const {id} = useParams();

       useEffect(() => {
         const quillServer = new Quill('#container', { theme : 'snow', modules: { toolbar: toolbarOptions }});
         quillServer.disable();
         quillServer.setText('Loading...');
         setQuill(quillServer);
       },[]);

       useEffect(() => {
        const socketServer = io('http://localhost:3001');
        setSocket(socketServer);
        return () => {
            socketServer.disconnect();
        }
       },[]);

       useEffect(() =>{

        if(quill === null || socket === null) return;

        const handleChange = (delta, oldDelta, source) => {
            
            if(source !== 'user') return;

            socket && socket.emit('send-changes',delta);
        }

        quill && quill.on('text-change', handleChange);
        
        return () => {
           quill && quill.off('text-change', handleChange);
        }
       },[quill,socket]);

       useEffect(() =>{

        if(quill === null || socket === null) return;

        const handleChange = (delta) => {
            quill.updateContents(delta);
        }

        socket && socket.on('receive-changes',handleChange);
        
        return () => {
            socket && socket.off('receive-changes',handleChange);
        }
       },[quill,socket]);

       useEffect(()=>{
          if(quill === null || socket === null) return;

          socket && socket.once('load-document',document => {
            quill.setContents(document);
            quill.enable();
          })

          socket && socket.emit('get-document',id);


       },[quill,socket,id]);

       useEffect(() => {
        if(quill === null || socket === null) return;

        const interval = setInterval(() => {
            socket && socket.emit('save-document',quill.getContents());
        }, 2000);

        return () => {
            clearInterval(interval);
        }
       } , [quill,socket]);

    return (
        <Component>
        <Box className='container' id="container">
            H E L L O
        </Box>
        </Component>
    );
}

export default Editor;