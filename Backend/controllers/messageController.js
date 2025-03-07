import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId, io } from "../lib/socket.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
 export const getUsersForSiderbar =async (req,res)=>{
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    
   
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersforSidebar:" ,error.message);
    res.status(500).json({error:"Internal server error"})
  }
 };
 export const getMessages =async (req,res) =>{
   try {
    const { id:userToChatId} =req.params;
    const myId = req.user._id;

    const messages =await Message.find({
      $or: [
        {senderId:myId ,receiverId:userToChatId},         // message between user and friend
        {senderId:userToChatId ,receiverId:myId}
      ]
    })

    res.status(200).json(messages)
   } catch (error) {
    console.log("Error in getMessage controller", error.message);
    res.status(500).json({error:"Internal server error"});
    
   }
 }

 export const sendMessage =async (req,res)=>{

  try {
     const {text , image} =req.body;
     const {id:receiverId} =req.params;
     const senderId =req.user._id;


     let imageUrl;

     if(image){
      //uplaod base64 image in cloudinary

      const uploadResponse =await cloudinary.uploader.upload(image);
      imageUrl=uploadResponse.secure_url;
     }

     const newMessage =new Message({
      senderId,
      receiverId,
      text,
      image:imageUrl,
     });

     await newMessage.save();

     //  realtime functionality goes herre  => socket.io


  const receiverSocketId =getRecieverSocketId(receiverId);
  if(receiverSocketId){
    // here to emit beacuse we dont want send everyone we want specifically one person
    io.to(receiverSocketId).emit("newMessage",newMessage);
  }

     res.status(201).json(newMessage);

  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({error:"Internal server error"});
  }
}