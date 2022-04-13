import randomstring from 'randomstring';
import Team from '../models/team.js';
import mongoose from 'mongoose';
import User from '../models/user.js';

//to create a new team
const newTeam = async (req, res, next) => {
    var code = randomstring.generate(6);
    var teamsWithTheSameID = await Team.findOne({code: code}).select(' _id name code'); //to ensure that the code is unique across the database
    while(teamsWithTheSameID != null) //if the code already exists in the database
    {
        code = randomstring.generate(6); //generating another code
        teamsWithTheSameID = await Team.findOne({code: code}).select(' _id name code');
    }
    const team = new Team({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        code: code, //the last code that we generated
        members: req.body.members
    });
    try{
        await team.save();
        //if there is an error, the code doesn't proceed from here
        console.log(team);
        res.status(201).json({
            message: 'Team was created!',
            createdTeam: {
                name: team.name,
                code: team.code,
                members: team.members,
                _id: team._id,
                requestType: 'POST'
            }
        });
    }
    catch(err)
    {
        res.status(500).json({
            error: err,
            message: "Something went wrong, please try again"
        });
    }
}
//to get all the teams from the database
const getAllTeams = async (req, res, next) => {
    try
    {
        const team = await Team.find().select(
            'name _id code members' //to only select the attributes that we need
        );
            const response = {
                count: team.length, //the number of teams
                teams: team.map( team =>{
                    return {
                        name: team.name,
                        code: team.code,
                        members: team.members,
                        _id: team._id,
                        requestType: 'GET'
                    }
                })
            }
            if(team.length >=0)
            {
                res.status(200).json(response);
            }
    }
    catch(err)
    {
        res.status(500).json({
            error: err
        })
    }
}
//to get a single team using its ID
const getTeam = async (req, res, next) => {
    const id = req.params.teamId;
    try
    {
        const team = await Team.findById(id).select('name _id members code');
        if(team)
        {
            res.status(200).json(team);
        }
        else //if we don't have a corresponding team in the database
        {
            res.status(404).json({
                message: "Team not found for the ID provided in the request"
            });
        }
    }
    catch(err)
    {
        res.status(500).json({
            error: err
        })
    }
}
//to update a team's information
const updateTeam = async (req, res, next) => { // we send this request when we want to change the team name
    //or when we wanna change the members' array we pass the new array (with all the new members) as a propName value pair
    const id = req.params.teamId;
    const updateOps = {};
    for( const ops of req.body)
    {
        updateOps[ops.propName] = ops.value;
    }
    try
    {
        const team = await Team.updateOne({_id: id},{ $set: updateOps });
        res.status(200).json({
            message: "Team updated successfully",
            requestType: "PATCH",
            _id: id
        });
    }
    catch(err)
    {
        res.status(500).json({error: err});
    }
}
//to delete a team with a given ID
const deleteTeam = async (req, res, next) => {
    const id = req.params.teamId;
    try
    {
        //we remove the teamCode from the members objects before removing the team
        const teamObject = await Team.findById({_id: id}).select('code');
        const teamCode = teamObject.code;
        const members = await User.find({teamCode: teamCode}).select('_id');
        for( const member of members)
        {
             await User.updateOne({_id: member._id}, {$set : {teamCode: " "}});
        }
        await Team.deleteOne({_id: id});
        res.status(200).json({
            message: "Team deleted successfully",
            requestType: "DELETE",
            _id: id
        });
    }
    catch(err){
        res.status(500).json({error: err, message: "The team you requested to delete doesn't exist"});
    }
}
export default {newTeam, getAllTeams, getTeam, updateTeam, deleteTeam};