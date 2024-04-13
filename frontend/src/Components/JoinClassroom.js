import { useNavigate, useParams } from "react-router-dom"
import Queue from "./Queue"
import { useEffect, useState } from "react"
import { findUser, getClassroomSettings, getCurrentStudent, getCurrentUser, testClassroomPassword } from "../UserUtils"
import Header from "./Header"

const JoinClassroom = () => {
    const [TA, setTA] = useState()
    const [user, setUser] = useState()
    const [settings, setSettings] = useState()
    const {TAid} = useParams()

    const navigate = useNavigate()
    const handleEnter = () => {
        if(settings){ 
            if(settings.queueEnabled === false && settings.passwordEnabled === false) {
                navigate(`/classrooms/${TAid}`)
            }
            else if(settings.queueEnabled === false) {
                const password = prompt("put the password in dweeb")
                testClassroomPassword(password, TAid).then(result => {
                    if(result === true) {
                        navigate(`/classrooms/${TAid}`)
                    }
                    else if(result === false) {
                        alert("Wrong password. Please try again or contact your TA.")
                    }
                    else {
                        alert("Something went wrong. Please try again later.")
                    }
                })
            }
            // else {
            //     getCurrentStudent().then(student => {
            //         if(student !== null && student._id === user._id) {
            //             navigate(`/classrooms/${TAid}`)
            //         }
            //     })
            // }
        }
    }

    useEffect(() => {
        if(!TA) {
            findUser(TAid).then(TAuser => {
                setTA(TAuser)
            })
        }
        if(!user) {
            getCurrentUser().then(userObject => {
                const user = userObject.data.user
                setUser(user)
            })
        }
        if(!settings) {
            getClassroomSettings(TAid).then(newSettings => {
                setSettings(newSettings)
            })
        }
        // handle different settings:
        handleEnter()
        //eslint-disable-next-line
    }, [TA, user, settings]) // only run the getters if the variables have changed 
    return (<>
        <Header />
        {user?._id !== TAid ? 
        <>
        You are currently waiting to join { TA ? TA.firstName + "'s classroom" : "a classroom"}. Please wait here until redirected. Refreshing will lose your place in line. 
        </>
        :
        <>
        Here is your classroom waiting page. Queue information can be found below.
        </>
        }
        <Queue />
    </>)
}

export default JoinClassroom