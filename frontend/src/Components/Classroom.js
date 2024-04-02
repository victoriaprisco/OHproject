import { useState, useEffect } from "react";
import NewRoom from "./NewRoom";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import { getCurrentUser, findUser, getAllUserHours, getClassroomComponents, setClassroomComponents, addClassroomComponent } from "../UserUtils";
import Whiteboard from "./Whiteboard";
import Header from "./Header";
import Draggable from "react-draggable";
import ChatContainer from "./ChatContainer";
// import  { Resizable } from 'react-resizable';
import '../resizable.css';
import Moveable from "./Moveable";
import VideoCall from "./VideoCall";

// thank u guy from reddit for chat tutorial https://www.youtube.com/watch?v=LD7q0ZgvDs8

const Classroom = () => {
    const DEBUGGING = process.env.REACT_APP_DEBUGGING;
    const api_url = DEBUGGING === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL
    // eslint-disable-next-line
    const [name, setName] = useState("");
    const [editMode, setEditMode] = useState(false)
    const [roomURL, setRoomURL] = useState("")
    const [user, setCurrentUser] = useState(null);
    // eslint-disable-next-line
    const [isOwner, setIsOwner] = useState(false);
    const [elements, setElements] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [newComponentName, setNewComponentName] = useState("whiteboard")
    const { TAid } = useParams();
    const currentToken = localStorage.getItem("token");
    // const isOwner = currentUser._id === TAid; // Determine if current user is the owner of the classroom
    const [isLoading, setIsLoading] = useState(true);
    // const [roomOnline, setOnline] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        if (currentToken && !user) {
            getCurrentUser().then(user => {
                const u = user.data.user
                setCurrentUser(u)
                setName(u.firstName + " " + u.lastName)
                if (u._id === TAid) {
                    setIsOwner(true)
                }
            })
            if (elements.length === 0) {
                getClassroomComponents(TAid).then(components => {
                    console.log(components)
                    setElements(components)
                })
            }
        }
    }, [currentToken, api_url, TAid, user, elements.length]);

    useEffect(() => {
        console.log("Fetching TA's name...");
        findUser(TAid).then(TA => {
            if (TA === null) {
                console.log("TA was unable to be found")
            }
        }).catch(e => console.log(e))
    }, [TAid]); // Dependency: TAid

    useEffect(() => {
        getAllUserHours(TAid).then(hours => {
            if (hours) {
                // setOHSchedule(hours);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                console.log("TA's office hours data is missing");
            }
        }).catch((error) => {
            console.log("Error getting TA document:", error);
        });
    }, [TAid]); // Dependency: TAid

    
    
    // var dates = [];
    // const removeElement = (element) => {
    //     const newDates = [];
    //     for (var day in dates) {
    //         if (dates[day] !== element) {
    //             newDates.push(dates[day]);
    //         }
    //     }
    //     dates = newDates;
    // };

    const findElement = (elementName) => {
        for (var i in elements) {
            if (elements[i].name === elementName) {
                return elements[i]
            }
        }
    }

    // const handleDayPicker = (e) => {
    //     e.preventDefault();
    //     const day = e.target.value;
    //     const color = e.target.style.backgroundColor;
    //     if (color !== '' && color !== "") { // deselecting
    //         e.target.style.backgroundColor = "";
    //         removeElement(day);
    //     }
    //     else { //  selecting
    //         e.target.style.backgroundColor = "#818cf8";
    //         dates.push(day);
    //     }
    //     console.log(dates);
    // };

    // const sendTimeInformation =  async (e) => {
    //     // e.preventDefault();
    //     // const start_time = e.target.start_time.value;
    //     // const end_time = e.target.end_time.value;
    //     //  for(var i in dates) {
    //     //     const date = dates[i]
    //     //     // figure out how to get class id if classroom is just for TA 
    //     //     // const status = await addUserHours(user._id, "", classId, {
    //     //     //     day: date,
    //     //     //     startTime: start_time,
    //     //     //     endTime: end_time
    //     //     // })
    //     //     // if(status === true) {
    //     //     //     alert("success")
    //     //     // }z
    //     //     // else {
    //     //     //     alert("Something went wrong please try again")
    //     //     // }
    //     // }
    //     // dates = [];
    // };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex justify-center items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0H4z"></path>
                    </svg>
                </div>
            </div>
        );
    }

    const handleResize = (element, newSize) => {
        const elementToChange = findElement(element.name)
        console.log(newSize)
        elementToChange.width = newSize.width
        elementToChange.height = newSize.height
        setClassroomComponents(elements).then(_ => {
            // window.location.reload()
        }).catch(e => console.log(e))
    }

    const handleDrag = (x, y, elementName) => {
        const widgetName = elementName
        const targetElement = findElement(widgetName)
        if (targetElement) {
            console.log("MOVED: x:", targetElement.x - x, "y:", targetElement.y - y)
            targetElement.x = x
            targetElement.y = y
            console.log(elements)
            setClassroomComponents(elements).then(_ => {
                // window.location.reload()
            }).catch(e => console.log(e))
        }
    }

    const removeFromArray = (elementToRemove) => {
        const newArray = []
        for (var i in elements) {
            if (elements[i].name !== elementToRemove) {
                newArray.push(elements[i])
            }
        }
        setElements(newArray)
    }
    
    const handleDelete = (e) => {
        console.log("you clicked delete on", e.target.id)
        removeFromArray(e.target.id)
    }
    return (
        <div className="font-mono">
            <Header user={user} />
            {isOwner? <>
            <button className="hover:bg-indigo-300 rounded-lg shadow-md p-2 bg-indigo-200 my-2 mx-5" onClick={() => {
                if(editMode === true) {
                    setClassroomComponents(elements).then(_ => {
                        // window.location.reload()
                    }).catch(e => console.log(e))
                }
                setEditMode(!editMode)
            }}> { editMode === true ? "save changes" : "edit classroom" }</button>
            <br></br>
            {editMode === true ? <button onClick={() => {
                setShowDropdown(!showDropdown)
            }}> 
                 {showDropdown ? 
                    <div className="hover:bg-indigo-300 rounded-lg shadow-md p-2 bg-indigo-200 my-2 mx-5">
                    x   
                    {/* <label for="dropdown">  Select a new element:  </label> */}
                    </div>
                    :
                    <div className="hover:bg-indigo-300 rounded-lg shadow-md p-2 bg-indigo-200 my-2 mx-5">
                        + add widget
                    </div >

                 }
            </button> : <></> }
            {showDropdown ? 
                <span className="">
                    <select className="mx-3" name="components" id="select-components" onChange={(e)=>{
                            setNewComponentName(e.target.value)
                    }}>
                        <option value="whiteboard">Whiteboard</option>
                        <option value="videocall">Video Call</option>
                        <option value="chat">Text Chat</option>
                    </select>
                    <button className="hover:bg-indigo-300 rounded-lg shadow-md p-2 bg-indigo-200 my-2 mx-5 w-fit" onClick={()=>{
                        console.log("adding", newComponentName, "to user classroom")
                        addClassroomComponent(newComponentName, 100, 100, 500, 500).then(result => {
                            console.log(result)
                            if(result === true) {
                                window.location.reload()
                            }
                            else {
                                console.log("An error occured")
                            }
                        }).catch(e => console.log(e))
                    }}> add</button>
                </span>
                : <></>}
            </> : <></>}
                {
                    elements.map((element) => {
                        console.log(element)
                        if(element.name.indexOf("whiteboard") >= 0) {
                            return <Moveable
                                width={element.width}
                                height={element.height}
                                initialX={element.x}
                                initialY={element.y}
                                component="whiteboard"
                                movingStop={(newX, newY) => {
                                    console.log("dragging stopped at", newX, newY)
                                    handleDrag(newX, newY, element.name)
                                }}
                                resizingStop={(size)=>{
                                    handleResize(element, size)
                                }}
                                isOwner={isOwner}
                                >
                            </Moveable>
                        }
                        else if(element.name.indexOf("chat") >= 0) {
                            return <Moveable
                            width={element.width}
                            height={element.height}
                            initialX={element.x}
                            initialY={element.y}
                            component="chat"
                            movingStop={(newX, newY) => {
                                console.log("dragging stopped at", newX, newY)
                                handleDrag(newX, newY, element.name)
                            }}
                            resizingStop={(size)=>{
                                handleResize(element, size)
                            }}
                            isOwner={isOwner}
                            >
                        </Moveable>
                        }
                        else {
                            return <Moveable
                            width={element.width}
                            height={element.height}
                            initialX={element.x}
                            initialY={element.y}
                            component={<VideoCall />}
                            movingStop={(newX, newY) => {
                                console.log("dragging stopped at", newX, newY)
                                handleDrag(newX, newY, element.name)
                            }}
                            resizingStop={(size)=>{
                                handleResize(element, size)
                            }}
                            isOwner={isOwner}
                            >
                        </Moveable>
                            

                        }
                    })
                }
            </div>

    );
}

export default Classroom;