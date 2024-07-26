import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faUserPlus, faPlus, faCircleXmark, faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons"
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

const Welcome = ({view, currentConversationId, setView, setCurrentConversationId}) => {
    const {id} = useSelector(state => state.auth)
    const loggedInUser = useSelector((state) => selectUserById(state, id))
    const isAdmin = loggedInUser?.roles.includes(ROLES.ADMIN)
    const [showNewConversation, setShowNewConversation] = useState(false)
    const newConversationRef = useRef(null)
    const [windowHeight, setWindowHeight] = useState(window.innerHeight)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const sideBarRef = useRef(null)
    const [showSideBar, setShowSideBar] = useState(true)

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

        const handleResize = () => {
            setWindowWidth(window.innerWidth)
            setWindowHeight(window.innerHeight)
        }

        window.addEventListener('keydown', handleEscapeKey)
        window.addEventListener('click', handleClickAwayFromAddConversationButton)
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('keydown', handleEscapeKey)
            window.removeEventListener('click', handleClickAwayFromAddConversationButton)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    let defaultContent
    if (view === "") {
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

    let spotifyInterface
    if (isAdmin) {
        spotifyInterface = (
            <div style={{marginBottom: '10px'}}>
                <SpotifyInterface />
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


    if (!loggedInUser) {
        return <p>Loading...</p>
    }
    
    let sideBar
    if (showSideBar) {
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
                    {spotifyInterface}
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
                            padding: '0px'
                        }}
                        onClick={() => setShowSideBar(false)}
                        >
                        <FontAwesomeIcon icon={faCaretLeft}/>
                    </button>
                </div>
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

    const mainContent = (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexGrow: '1',
            justifyContent: 'center',
            alignItems: 'flex-start',
            borderRadius: '10px',
            // maxHeight: '80dvh',
            }}>
            {view === '' && defaultContent}
            {view === 'usersList' && <UsersList />}
            {view === 'editUser' && <EditUser uid={id} />}
            {view === 'newUserForm' && <NewUserForm />}
            {view === 'conversationView' && <ConversationView conversationId={currentConversationId} setCurrentConversationId={setCurrentConversationId} setView={setView}/>}
        </div>
    )

    const content = (
        <section className="welcome"
            style={{display: 'flex',
                flexDirection: 'column',
                flexGrow: '1',
                height: '80dvh',
            }}>
            <div style={{display: 'flex'}}>
                {sideBar}
                {mainContent}
            </div>
        </section>
    )

    return content
}
export default Welcome