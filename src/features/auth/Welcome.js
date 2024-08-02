import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faUserPlus, faPlus, faCircleXmark, faCaretLeft, faCaretRight, faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons"
import { useSelector } from 'react-redux'
import { selectUserById } from '../users/usersApiSlice'
import { ROLES } from '../../config/roles'
import UsersList from '../users/UsersList'
import NewUserForm from '../users/NewUserForm'
import EditUser from '../users/EditUser'
import ConversationsList from '../conversations/ConversationsList'
import NewConversation from '../conversations/NewConversation'
import ConversationView from '../conversations/ConversationView'
import { useState, useEffect, useRef } from 'react'
import SpotifyInterface from '../spotify/SpotifyInterface'
import { useSwipeable } from 'react-swipeable'

const Welcome = ({view, currentConversationId, setView, setCurrentConversationId}) => {
    const id = useSelector(state => state.auth.id)
    const loggedInUser = useSelector((state) => selectUserById(state, id))
    const isAdmin = loggedInUser?.roles.includes(ROLES.ADMIN)
    const [showNewConversation, setShowNewConversation] = useState(false)
    const newConversationRef = useRef(null)
    const sideBarRef = useRef(null)
    const [showSideBar, setShowSideBar] = useState(true)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const [currentPanelIndex, setCurrentPanelIndex] = useState(0)
    const [usingVolumeSlider, setUsingVolumeSlider] = useState(false)

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth)
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        setView(localStorage.getItem('view') || '')
        setCurrentConversationId(localStorage.getItem('currentConversationId') || '')
    }, [])

    useEffect(() => {
        localStorage.setItem('view', view)
    }, [view])

    const openUserProfile = () => {
        setView(isAdmin ? 'usersList' : 'editUser')
    }

    const openNewUserForm = () => {
        setView('newUserForm')
    }

    const openNewConversationForm = () => {
        setShowNewConversation(!showNewConversation)
    }

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                setShowNewConversation(false)
            }
        }

        const handleClickAwayFromAddConversationButton = (e) => {
            const addConversationButton = document.querySelector('.addConversationButton')
            if (newConversationRef.current && !newConversationRef.current.contains(e.target)) {
                if (!addConversationButton || !addConversationButton.contains(e.target)) {
                    setShowNewConversation(false)
                }
            }
        }

        window.addEventListener('keydown', handleEscapeKey)
        window.addEventListener('click', handleClickAwayFromAddConversationButton)

        return () => {
            window.removeEventListener('keydown', handleEscapeKey)
            window.removeEventListener('click', handleClickAwayFromAddConversationButton)
        }
    }, [])

    let defaultContent
    if (view === "") {
        if (windowWidth <= 1000) {
            defaultContent = (
                <div className='welcome__default_box'>
                    <p className='welcome__default'>
                        Welcome to
                    </p>
                    <p className='welcome__default'>
                        AI Chatbot!
                    </p>
                </div>
            )
        } else {
            defaultContent = (
                <div className='welcome__default_box'>
                    <p className='welcome__default'>
                        Welcome to AI Chatbot!
                    </p>
                    <p className='welcome__default'>
                        Your personal assistant for
                    </p>
                    <p className='welcome__default'>
                        EVERYTHING
                    </p>
                </div>
            )
        }
    }

    let spotifyInterface
    if (isAdmin) {
        spotifyInterface = (
            <div style={{maxWidth: '13rem'}}>
                <SpotifyInterface usingVolumeSlider={usingVolumeSlider} setUsingVolumeSlider={setUsingVolumeSlider}/>
            </div>
        )
    }

    let profileButtons
    if (isAdmin) {
        profileButtons = (
            <div style={{
                display: 'flex',
                gap: '1px',
            }}>
                <button
                    className='home_button'
                    title="View User Profile"
                    style={{
                        width: '100%',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.3em 0.3em',
                        textDecoration: 'none',
                        marginRight: '0.5em',
                        fontSize: '15px',
                    }}
                    onClick={openUserProfile}
                >
                    <FontAwesomeIcon icon={faUser} />
                </button>
                <button
                    className='home_button'
                    title="Register New User"
                    style={{
                        width: '100%',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.3em 0.3em',
                        textDecoration: 'none',
                        fontSize: '15px',
                    }}
                    onClick={openNewUserForm}
                >
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </div>
        )
    } else {
        profileButtons = (
            <>
                <button
                    className='home_button'
                    title="View User Profile"
                    style={{ width: '12rem',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.3em 0.3em',
                        textDecoration: 'none',
                        fontSize: '15px',
                    }}
                    onClick={openUserProfile}
                >
                    <FontAwesomeIcon icon={faUser} />
                </button>
            </>
        )
    }

    let addConversation
    if (showNewConversation) {
        addConversation = <FontAwesomeIcon icon={faCircleXmark} />
    } else {
        addConversation = <FontAwesomeIcon icon={faPlus} />
    }

    let newConversation
    if (showNewConversation) {
        newConversation = (
            <div ref={newConversationRef}>
                <NewConversation setView={setView} setCurrentConversationId={setCurrentConversationId} setShowNewConversation={setShowNewConversation}/>
            </div>
        )
    }

    // Mobile swipeable side bar components
    const musicControls = (
        <div style={{marginRight: '15px'}}>
            {spotifyInterface}
        </div>
    )

    const generalControls = (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            // marginRight: '9px',
        }}>
            <div style={{display: 'block', marginBottom: '5px', width: '13rem'}}>
                {profileButtons}
            </div>
            <div style={{display: 'block', marginBottom: '5px', width: '13rem'}}>
                <button
                    className='home_button addConversationButton'
                    title="Create a New Conversation"
                    onClick={openNewConversationForm}
                    style={{
                            width: '100%',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.3em 0.3em',
                            textDecoration: 'none',
                            fontSize: '15px',
                        }}
                >
                    {addConversation}
                </button>
                {newConversation}
            </div>
        </div>
    )

    const conversations = (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: '1',
            // maxHeight: '50dvh',
            justifyContent: 'flex-start',
            overflowX: 'visible',
            overflowY: 'scroll',
            // margin: '-3px -10px',
            padding: '3px 10px',
            borderRadius: '10px',
            scrollbarWidth: 'none',
            maxWidth: '13rem',
            }}>
            <ConversationsList setCurrentConversationId={setCurrentConversationId} setView={setView}/>
        </div>
    )

    const panels = [musicControls, generalControls, conversations]

    const handleSwipedLeft = () => {
        if (!usingVolumeSlider) {
            setCurrentPanelIndex((prevIndex) => (prevIndex + 1) % panels.length)
            setShowNewConversation(false)
        }
    }
    
    const handleSwipedRight = () => {
        if (!usingVolumeSlider) {
            setCurrentPanelIndex((prevIndex) => (prevIndex - 1 + panels.length) % panels.length)
            setShowNewConversation(false)
        }
    }
    
    const panelHandlers = useSwipeable({
        onSwipedLeft: handleSwipedLeft,
        onSwipedRight: handleSwipedRight,
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    })
    
    let sideBar
    if (showSideBar) {
        if (windowWidth <= 1000) {
            sideBar = (
                <>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}>
                        <div className='menu'
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexGrow: '1',
                                backgroundColor: 'rgba(203, 214, 238, 0.718)',
                                borderRadius: '10px',
                                padding: '6px',
                                marginBottom: '5px',
                                justifyContent: 'center',
                                maxHeight: '6.7rem',
                                height: '6.7rem',
                                paddingBottom: '0px',
                                overflow: 'visible',
                            }}
                            ref={sideBarRef}
                            {...panelHandlers}>
                            {panels[currentPanelIndex]}
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                    }}>
                        <button className='conversationButton'
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: '5px',
                                width: '15%',
                                height: '1rem',
                                padding: '0px'
                            }}
                            onClick={() => setShowSideBar(false)}
                            >
                            <FontAwesomeIcon icon={faCaretUp}/>
                        </button>
                    </div>
                </>
            )
        } else {
            sideBar = (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    height: '80dvh',
                    maxHeight: '80dvh',
                }}>
                    <div className='menu'
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flexGrow: '1',
                            width: '13rem',
                            maxWidth: '13rem',
                            marginRight: '5px',
                            backgroundColor: 'rgba(203, 214, 238, 0.718)',
                            borderRadius: '10px',
                            padding: '6px',
                        }}
                        ref={sideBarRef}>
                        <div style={{marginBottom: '10px'}}>
                            {spotifyInterface}
                        </div>
                        <div style={{display: 'block', marginBottom: '5px'}}>
                            {profileButtons}
                        </div>
                        <div style={{display: 'block', marginBottom: '5px'}}>
                            <button
                                className='home_button addConversationButton'
                                title="Create a New Conversation"
                                onClick={openNewConversationForm}
                                style={{
                                        width: '100%',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '0.3em 0.3em',
                                        textDecoration: 'none',
                                        fontSize: '15px',
                                    }}
                            >
                                {addConversation}
                            </button>
                            {newConversation}
                        </div>
                        <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flexGrow: '1',
                                // maxHeight: '50dvh',
                                justifyContent: 'flex-start',
                                overflowX: 'visible',
                                overflowY: 'scroll',
                                margin: '-3px -10px',
                                padding: '3px 10px',
                                borderRadius: '10px',
                                scrollbarWidth: 'none',
                                }}>
                            <ConversationsList setCurrentConversationId={setCurrentConversationId} setView={setView}/>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}>
                        <button className='conversationButton'
                            style={{
                                marginRight: '5px',
                                width: '1rem',
                                height: '15%',
                                padding: '0px',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            onClick={() => setShowSideBar(false)}
                            >
                            <FontAwesomeIcon icon={faCaretLeft}/>
                        </button>
                    </div>
                </div>
            )
        }
    } else {
        if (windowWidth <= 1000) {
            sideBar = (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>
                    <button className='conversationButton'
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '5px',
                            width: '15%',
                            height: '1rem',
                            padding: '0px'
                        }}
                        onClick={(e) => setShowSideBar(true)}
                        >
                        <FontAwesomeIcon icon={faCaretDown}/>
                    </button>
                </div>
            )
        } else {
            sideBar = (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '80dvh',
                }}>
                    <button className='conversationButton'
                        style={{
                            marginRight: '5px',
                            width: '1rem',
                            height: '15%',
                            padding: '0px'
                        }}
                        onClick={() => setShowSideBar(true)}
                        >
                        <FontAwesomeIcon icon={faCaretRight}/>
                    </button>
                </div>
            )
        }
    }

    const mainContent = (
        <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexGrow: '1',
                justifyContent: 'center',
                alignItems: 'flex-start',
                borderRadius: '10px',
            }}>
            {view === '' &&
                <div className="conversation-interface"
                    style={{
                        padding: '1rem 0.5rem',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(203, 214, 238, 0.718)',
                    }}>
                    {defaultContent}
                </div>
            }
            {view === 'usersList' &&
                <div className="conversation-interface"
                    style={{
                        padding: '1rem 0.5rem',
                        backgroundColor: 'rgba(203, 214, 238, 0.718)',
                    }}>
                    <UsersList />
                </div>
            }
            {view === 'editUser' &&
                <div className="conversation-interface"
                    style={{
                        padding: '1rem 0.5rem',
                        backgroundColor: 'rgba(203, 214, 238, 0.718)',
                    }}>
                    <EditUser uid={id} />
                </div>
            }
            {view === 'newUserForm' &&
                <div className="conversation-interface"
                    style={{
                        padding: '1rem 0.5rem',
                        backgroundColor: 'rgba(203, 214, 238, 0.718)',
                    }}>
                    <NewUserForm lightmode={false} />
                </div>
            }
            {view === 'conversationView' &&
                <ConversationView
                    conversationId={currentConversationId}
                    setCurrentConversationId={setCurrentConversationId}
                    setView={setView}
                    usingVolumeSlider={usingVolumeSlider}
                    setUsingVolumeSlider={setUsingVolumeSlider} />
            }
        </div>
    )

    let content
    if (windowWidth <= 1000) {
        content = (
            <div>
            {sideBar}
            {mainContent}
            </div>
            // <section className="welcome"
            //     style={{display: 'flex',
            //         flexDirection: 'row',
            //         flexGrow: '1',
            //         height: '80dvh',
            //         maxHeight: '80dvh',
            //     }}>
            //     <div style={{
            //             display: 'flex',
            //             flexDirection: 'column',
            //             flexGrow: '1',
            //         }}>
            //         {sideBar}
            //         <div style={{
            //                 display: 'flex',
            //                 flexDirection: 'row',
            //                 flexGrow: '1',
            //             }}>
            //             {mainContent}
            //         </div>
            //     </div>
            // </section>
        )
    } else {
        content = (
            <section className="welcome"
                style={{display: 'flex',
                    flexDirection: 'row',
                    flexGrow: '1',
                    height: '80dvh',
                }}>
                <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexGrow: '1'
                    }}>
                    {sideBar}
                    {mainContent}
                </div>
            </section>
        )
    }

    if (!loggedInUser) {
        return <p>Loading...</p>
    }

    return content
}
export default Welcome