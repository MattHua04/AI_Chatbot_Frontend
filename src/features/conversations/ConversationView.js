import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faArrowDown, faExpand, faCompress, faCircleXmark, faPlus } from "@fortawesome/free-solid-svg-icons"
import { useSelector } from 'react-redux'
import { selectConversationById, useGetConversationsQuery } from './conversationsApiSlice'
import { useState, useEffect, useRef } from 'react'
import { useUpdateConversationMutation } from './conversationsApiSlice'
import Prompt from '../prompts/Prompt'
import { Link } from 'react-router-dom'
import ConversationsList from './ConversationsList'
import NewConversation from './NewConversation'

const ConversationView = ({conversationId, setCurrentConversationId, setView}) => {
    const id = useSelector((state) => state.auth.id)
    const [conversation, setConversation] = useState(useSelector(state => selectConversationById(state, conversationId)))
    const [content, setContent] = useState(conversation?.content)
    const [input, setInput] = useState('')
    const conversationContentRef = useRef(null)
    const textareaRef = useRef(null)
    const [editingPromptIndex, setEditingPromptIndex] = useState(null)
    const [showDownButton, setShowDownButton] = useState(false)
    const [fullScreen, setFullScreen] = useState(false)
    const [showConversationsList, setShowConversationsList] = useState(false)
    const conversationListRef = useRef(null)
    const [showNewConversation, setShowNewConversation] = useState(false)
    const newConversationRef = useRef(null)

    const handleFullScreen = () => {
        setFullScreen(!fullScreen)
        setShowConversationsList(false)
    }

    const openNewConversationForm = () => {
        setShowNewConversation(!showNewConversation)
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus()
        }
        setInput('')
        setEditingPromptIndex(null)
    }, [conversationId])

    const {
        data: conversations,
    } = useGetConversationsQuery({user: id}, {
        pollingInterval: 1000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true,
    })

    useEffect(() => {
        if (conversations) {
            const { entities } = conversations
            setConversation(entities[conversationId])
        }
    }, [conversations, conversationId])

    useEffect(() => {
        if (content && conversation && content !== conversation?.content) {
            setContent(conversation?.content)
        }
    }, [conversation])

    useEffect(() => {
        setContent(conversation?.content)
    }, [conversation?.content])

    const [updateConversation, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateConversationMutation()

    const handleInputChange = (e) => {
        setInput(e.target.value)
        adjustTextareaHeight()
    }

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }

    useEffect(() => {
        adjustTextareaHeight()
        setEditingPromptIndex(null)
    }, [input])

    const handleSubmit = async (e) => {
        if (input?.trim().length) {
            const newContent = content ? [...content, ['User', input]] : [['User', input]]
            await updateConversation({ id: conversationId, user: conversation.user, title: conversation.title, content: newContent })
        }
    }

    useEffect(() => {
        if (isSuccess) {
            setInput('')
        }
    }, [isSuccess])

    const scrollDown = () => {
        if (conversationContentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = conversationContentRef.current
    
            const targetScrollTop = scrollHeight - clientHeight
            const distance = targetScrollTop - scrollTop
            const duration = 500 // 0.5 seconds in milliseconds
            const perTick = distance / duration * 10
            var previousScrollTop = -1
            
            if (targetScrollTop == scrollTop) {
                return
            }
    
            const scroll = () => {
                const currentScrollTop = conversationContentRef.current.scrollTop
                if (currentScrollTop <= previousScrollTop) {
                    // Reached the bottom or exceeded
                    // conversationContentRef.current.scrollTop = targetScrollTop
                    return
                }
                
                previousScrollTop = currentScrollTop
                conversationContentRef.current.scrollTop = currentScrollTop + perTick
    
                // Schedule next tick
                setTimeout(scroll, 10)
            }
    
            scroll()
        }
    }
    
    const handleDownButton = () => {
        scrollDown()
    }

    useEffect(() => {
        scrollDown()
    }, [conversationId, isSuccess, conversation, content])

    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape' && fullScreen) {
                setFullScreen(false)
            }
        }

        const handleClickAwayFromConversationTitle = (e) => {
            const conversationTitleLink = document.querySelector('.conversationTitle')
            if (conversationListRef.current && !conversationListRef.current.contains(e.target)) {
                if (!conversationTitleLink || !conversationTitleLink.contains(e.target)) {
                    setShowConversationsList(false)
                    setShowNewConversation(false)
                }
            }
        }

        const checkScrollHeight = () => {
            if (conversationContentRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = conversationContentRef.current
                if (scrollHeight - scrollTop > clientHeight) {
                    setShowDownButton(true)
                } else {
                    setShowDownButton(false)
                }
            }
        }

        window.addEventListener('keydown', handleEscapeKey)
        window.addEventListener('click', handleClickAwayFromConversationTitle)
        conversationContentRef.current?.addEventListener('scroll', checkScrollHeight)

        return () => {
            window.removeEventListener('keydown', handleEscapeKey)
            window.removeEventListener('click', handleClickAwayFromConversationTitle)
            conversationContentRef.current?.removeEventListener('scroll', checkScrollHeight)
        }
    })

    let fullScreenButton
    if (fullScreen) {
        fullScreenButton = (
            <button
                className="conversationOptionsButton"
                onClick={handleFullScreen}
                style={{
                    animation: 'none',
                    padding: '0',
                    height: '2rem',
                    backgroundColor: 'transparent',
                }}>
                <FontAwesomeIcon icon={faCompress} />
            </button>
        )
    } else {
        fullScreenButton = (
            <button
                className="conversationOptionsButton"
                onClick={handleFullScreen}
                style={{
                    animation: 'none',
                    padding: '0',
                    height: '2rem',
                    backgroundColor: 'transparent',
                }}>
                <FontAwesomeIcon icon={faExpand} />
            </button>
        )
    }

    let conversationTitle
    if (fullScreen) {
        conversationTitle = (
            <Link className="conversationTitle"
                onClick={() => setShowConversationsList(!showConversationsList)}
                >
                {conversation?.title}
            </Link>
        )
    } else {
        conversationTitle = (
            <p style={{color: '#5136d5'}}>
                {conversation?.title}
            </p>
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

    let coversationsList
    if (showConversationsList && fullScreen) {
        coversationsList = (
            <div
                ref={conversationListRef}
                style={{
                    zIndex: '9999',
                    position: 'fixed',
                    left: '48.5%',
                    top: '6%',
                    transform: 'translateX(-50%)',
                    maxWidth: '13.6rem',
                    maxHeight: '30vh',
                    padding: '5px 10px',
                    paddingTop: '10px',
                    margin: '10px',
                    overflowY: 'auto',
                    borderRadius: '10px',
                    border: '3px solid rgba(84, 71, 209, 0.5)',
                    boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                    backgroundColor: 'rgba(231, 237, 255, 1)',
                    scrollbarWidth: 'none',
                }}>
                <div style={{display: 'block', marginBottom: '5px'}}>
                    <button
                        className='home_button addConversationButton'
                        title="Edit Conversations"
                        onClick={openNewConversationForm}
                        style={{ width: '12rem',
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
                <ConversationsList setCurrentConversationId={setCurrentConversationId} setView={setView}/>
            </div>
        )
    } else {
        coversationsList = null
    }

    let conversationContent
    if (conversation && content) {
        const ids = Array.from({ length: content.length }, (_, i) => i)
        const prompts = ids.map((index) => [index, content[index]])
        conversationContent = (content) && ids.map(promptId => (
            <Prompt
                key={promptId}
                conversation={conversation}
                conversationId={conversationId}
                conversationContent={conversation.content}
                promptId={promptId}
                editingPromptIndex={editingPromptIndex}
                setEditingPromptIndex={setEditingPromptIndex}/>
        ))
    } else conversationContent = null

    const conversationInterface = (
        <>
            <div className={`conversation-interface ${fullScreen ? 'full-screen' : ''}`} style={{ height: fullScreen ? '100vh' : '75vh' }}>
                <div className='table__th'
                    style={{ 
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'center',
                        padding: '0.2em',
                        fontSize: '20px',
                        borderRadius: fullScreen ? '0px 0px 10px 10px' : '10px',
                    }}
                >
                    <div style={{ flex: '1' }}>{conversationTitle}</div>
                    <div>{fullScreenButton}</div>
                </div>
                {coversationsList}
                <div
                    ref={conversationContentRef}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: '1',
                        width: '100%',
                        height: '100%',
                        overflowY: 'auto',
                        scrollbarWidth: 'none',
                    }}>
                    {conversationContent}
                </div>
                <button
                    className="conversationOptionsButton"
                    onClick={handleDownButton}
                    style={{
                        display: showDownButton ? 'flex' : 'none',
                        justifyContent: 'center',
                        position: 'relative',
                        bottom: '1rem',
                        marginTop: '-40px',
                        height: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}>
                    <FontAwesomeIcon icon={faArrowDown} />
                </button>
                <div style={{ display: 'flex', flexDirection: 'row', flexGrow: '1', width: '100%', justifyContent: 'flex-end' }}>
                    <textarea
                        className={`conversationInput`}
                        ref={textareaRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (!(e.ctrlKey || e.shiftKey || e.altKey || e.metaKey)) {
                                    e.preventDefault()
                                    handleSubmit()
                                }
                            }
                        }}
                        autoFocus
                        style={{
                            fontSize: '15px',
                            display: 'flex',
                            flexDirection: 'column',
                            flexGrow: '1',
                            backgroundColor: 'rgba(203, 214, 238, 0.718)',
                            color: '#5136d5',
                            wordWrap: 'break-word',
                            borderRadius: '10px',
                            resize: 'none',
                            overflow: 'auto',
                            height: 'auto',
                            width: '100%',
                            whiteSpace: 'pre-wrap',
                            textAlign: 'left',
                            padding: '0.5em 1em',
                            boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                            marginTop: '1em',
                            marginLeft: '1em',
                            marginRight: '1em',
                            marginBottom: '1em',
                        }}/>
                    <button className='home_button'
                        onClick={handleSubmit}
                        style={{
                            borderRadius: '10px',
                            padding: '0.5em 1em',
                            textDecoration: 'none',
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            border: 'none',
                            boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                            marginTop: '1em',
                            marginRight: '1em',
                            marginBottom: '1em',
                        }}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
            </div>
        </>
    )

    return conversationInterface
}
export default ConversationView
