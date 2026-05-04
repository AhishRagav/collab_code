import http from 'http'
import app from './app.js'
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';
import project_model from './db/models/project_model.js';
import Chat from './db/models/chat_model.js';
import { generateResult } from './services/ai.services.js';
const PORT=process.env.PORT || 3000;
// to create the socket server we need the raw http server not the express app
// so we create a server using http.createServer and pass the express app to it
// then we create a socket server using the raw http server and pass the express
const server=http.createServer(app);
const io= new Server(server,{cors: {
        origin: '*'
    }});
// what is this use function doing?
// it is a middleware function that runs before the connection event
// it is used to authenticate the user and get the project id from the socket handshake
// if the user is not authenticated or the project id is not valid, it will throw an error
// otherwise it will attach the user and project to the socket object

 // wen will this happen ? // when the user connects to the socket server
io.use(async (socket,next)=>{
    try {
        let token= socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        let projectId= socket.handshake.query.projectId;
        if(!mongoose.Types.ObjectId.isValid(projectId)){
            throw new Error("Invalid ProjectId");
        }
        if(!token){
            throw new Error("Authentication User");
        }
        socket.project= await project_model.findById(projectId);
        let decoded= jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            throw new Error("Authentication User");
        }
        socket.user=decoded
        next();
    } catch (error) {
        next(error);
    }
})
io.on('connection',socket=>{
    // console.log("a user connected");
    socket.roomId= socket.project._id.toString();
    socket.join(socket.roomId);
    // an event is listened from frontend
    // when a user sends a message in the project chat
    // we will emit the message to all the users in the project room
    socket.on('project-message',async (data)=>{
        const message= data.message;
        io.to(socket.roomId).emit('project-message',data);
        const isAiPresent = message.includes('@ai');
        if(isAiPresent){
            // console.log("yes ai is present");
            let res= await generateResult(data.message);
            const parsed = JSON.parse(res);
            console.log("lets see the parsed message : ",parsed);
            console.log("lets see the res message : ",res);
            console.log("lets see the res message type : ",typeof res);
            console.log("lets see the parsed message type : ",typeof parsed.text);
            // console.log(res);
            let newmessage={
                email:'AI@ai.com',
                sender:'67d7da39b9b904cb0ad30971',
                project:socket.roomId,
                message:parsed.text,
            }
            await Chat.create(newmessage);
            io.to(socket.roomId).emit('project-message',{
                message:res.toString(),
                sender:{
                    _id:'67d7da39b9b904cb0ad30971',
                    email:'AI@ai.com'
                }
            })
            return;
        }
    })
    // socket.on('',()=>{});
    socket.on('disconnect',()=>{
        console.log("User disconnected");
        socket.leave(socket.roomId);
    });
})
server.listen(PORT,()=>{
    console.log("LISTENING ON PORT : ",PORT);
})
//test commit