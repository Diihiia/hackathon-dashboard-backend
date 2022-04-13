import User from '../models/user.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Team from '../models/team.js';
import jwt from 'jsonwebtoken';

//to create a new user
const newUser = async (req, res, next) => {
    const hash =  bcrypt.hashSync(req.body.password, 10);
    const team = await Team.findOne({code: req.body.teamCode});
    if(team || req.body.teamCode==null || req.body.teamCode=="") //if the team doesn't exist or we didn't provide a team code
    {
        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            teamCode: req.body.teamCode,
            password: hash,
            username: req.body.username,
            email: req.body.email
        });
        try{
            await user.save();
            console.log(user);
            res.status(201).json({
                message: 'User was created!',
                createdUser: {
                    username: user.username,
                    teamCode: user.teamCode,
                    email: user.email,
                    _id: user._id,
                    requestType: 'POST'
                }
            });
        }
        catch(err)
        {
            res.status(500).json({
                error: err,
                message: "Couldn't register, check your informations and try again"
            });
        }
    }
    else
    {
        res.status(404).json({message: "The code provided does not correspond to any team"});
    }
}
//to log the user in
const loggedUser = async (req, res, next) => {
    try{
        const user = await User.findOne({email: req.body.email});
        if(!user)
        {
            return res.status(401).json({message: "Authentication failed"});
        }
        bcrypt.compare(req.body.password , user.password, (err, result) => {
            if(err)
            {
                return res.status(401).json({message: "Authentication failed"});
            }
            if(result)
            {
                //we create a token for the signed in user
                const token = jwt.sign({
                    email: user.email,
                    userId: user._id
                },
                "" +process.env.JWT_KEY,
                {
                    expiresIn: "1h"
                }
                );
                return res.status(200).json({message: "Authentication successful", token: token});
            }
            res.status(401).json({message: "Authentication failed"});
        } )
    }
    catch(err)
    {
        res.status(500).json({
            error: err
        });
    }
}
//to get all teams from the database
const getAllUsers = async (req, res, next) => {
    try
    {
        const user = await User.find().select(
            'username _id email teamCode' //to only select the attributes that we need (the password is hashed so we don't really need it)
        );
            const response = {
                count: user.length,
                users: user.map( user =>{
                    return {
                        username: user.username,
                        _id: user._id,
                        email: user.email,
                        teamCode: user.teamCode,
                        requestType: 'GET'
                    }
                })
            }
            if(user.length>=0)
            {
                res.status(200).json(response);
            }
    }
    catch(err)
    {
        res.status(500).json({
            error: err
        });
    }
}
//to get a single user using its ID
const getUser = async (req, res, next) => {
    const id = req.params.userId;
    try
    {
        const user = await User.findById(id);
        if(user)
        {
            res.status(200).json(user);
        }
        else //if we don't have a corresponding user in the database
        {
            res.status(404).json({
                message: "User not found for the ID provided in the request"
            });
        }
    }
    catch(err)//case of a server error
    {
        res.status(500).json({
            error: err
        })
    }
}
//to update a user's information
const updateUser = async (req, res, next) => {
    const id = req.params.userId;
    const updateOps = {};
    for( const ops of req.body)
    {
        updateOps[ops.propName] = ops.value;
    }
    try
    {
        console.log(updateOps);
        const user = await User.updateOne({_id: id},{ $set: updateOps });
        console.log(user);
        res.status(200).json({
            message: "User updated successfully",
            requestType: "PATCH",
            _id: id
        });
    }
    catch(err)
    {
        res.status(500).json({error: err});
    }
}
//to join a specific team by providing its code
const joinTeam = async (req, res, next) => {
    const teamCode = req.body.teamCode;
    // if(teamCode.length != 6) //I haven't tested this one yet
    // {
    //     res.status(409).json({message: "The team code must contain 6 characters "});
    // }
    const id = req.body.userId;
    const team = await Team.find({code: teamCode}).select(
        'name _id code members' //to only select the attributes that we need
    );
    if(team.length > 0) //to check whether the team code is in database
    {
        try
        {
            await User.updateOne({_id: id},{ $set: {teamCode: req.body.teamCode} });
            await Team.updateOne({_id: team[0]._id},{ $push: {members: req.body.userId} });
            res.status(200).json({
                message: "You successfully joined the team " + team[0].name,
                requestType: "PATCH",
                _id: id
            });
        }
        catch(err)
        {
            res.status(500).json({error: err});
        }
    }
    else
    {
        res.status(404).json({message: "The team code provided is invalid"});
    }
}
//to delete a user with a given ID
const deleteUser = async (req, res, next) => {
    const id = req.params.userId;
    try
    {
        const user = User.findById({_id: id}).select('username _id teamCode');
        const team = await Team.findOne({code: user.teamCode}).select(
            'name _id code members' //to only select the attributes that we need
        );
        if(team)
        {
            //we remove the userIf from the team members array if it exists
            await Team.updateOne({_id: team[0]._id},{ $pop: {members: req.params.userId} });
        }
        await User.deleteOne({_id: id});
        res.status(200).json({
            message: "User deleted successfully",
            requestType: "DELETE",
            _id: id
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: err});
    }
}
export default {newUser, getAllUsers, getUser, updateUser, deleteUser, loggedUser, joinTeam};