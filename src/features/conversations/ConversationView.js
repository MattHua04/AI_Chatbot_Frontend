import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faArrowDown, faExpand, faCompress, faCircleXmark, faPlus, faGripLines, faMusic } from "@fortawesome/free-solid-svg-icons"
import { useSelector } from 'react-redux'
import { selectConversationById, useGetConversationsQuery } from './conversationsApiSlice'
import { useState, useEffect, useRef } from 'react'
import { useUpdateConversationMutation } from './conversationsApiSlice'
import { selectUserById } from '../users/usersApiSlice'
import { ROLES } from '../../config/roles'
import Prompt from '../prompts/Prompt'
import { Link } from 'react-router-dom'
import ConversationsList from './ConversationsList'
import NewConversation from './NewConversation'
import { Buffer } from 'buffer'
import SpotifyInterface from '../spotify/SpotifyInterface'

const ConversationView = ({conversationId, setCurrentConversationId, setView, usingVolumeSlider, setUsingVolumeSlider}) => {
    const id = useSelector((state) => state.auth.id)
    const loggedInUser = useSelector((state) => selectUserById(state, id))
    const isAdmin = loggedInUser?.roles.includes(ROLES.ADMIN)
    const [conversation, setConversation] = useState(useSelector(state => selectConversationById(state, conversationId)))
    const [content, setContent] = useState(conversation?.content)
    const [input, setInput] = useState('')
    const [cachedInput, setCachedInput] = useState('')
    const conversationContentRef = useRef(null)
    const textareaRef = useRef(null)
    const [editingPromptIndex, setEditingPromptIndex] = useState(null)
    const [showDownButton, setShowDownButton] = useState(false)
    const [fullScreen, setFullScreen] = useState(false)
    const [showConversationsList, setShowConversationsList] = useState(false)
    const conversationListRef = useRef(null)
    const [showNewConversation, setShowNewConversation] = useState(false)
    const newConversationRef = useRef(null)
    const [ableToSubmit, setAbleToSubmit] = useState(false)
    const [contentSize, setContentSize] = useState(0)
    const minTextAreaHeight = 7 * window.innerHeight / 100
    const [textAreaHeight, setTextAreaHeight] = useState(minTextAreaHeight)
    const [mouseDown, setMouseDown] = useState(false)
    const [showAdjustTextAreaButton, setShowAdjustTextAreaButton] = useState(false)
    const adjustTextAreaRef = useRef(null)
    const [timeoutId, setTimeoutId] = useState(null)
    const [lastTextAreaAdjustClick, setLastTextAreaAdjustClick] = useState(null)
    const lastTextAreaAdjustClickRef = useRef(lastTextAreaAdjustClick)
    const [startedAdjustmentAtBottom, setStartedAdjustmentAtBottom] = useState(false)
    const inputRef = useRef(null)
    const titleRef = useRef(null)
    const [showMusicControls, setShowMusicControls] = useState(false)
    const musicRef = useRef(null)
    const toggleMusicControlsRef = useRef(null)
    const lastTouchY = useRef(null)
    const [recentlyUsingVolumeSlider, setRecentlyUsingVolumeSlider] = useState(false)
    const [recentlyUsingVolumeSliderTimeoutId, setRecentlyUsingVolumeSliderTimeoutId] = useState(null)

    useEffect(() => {
        if (!usingVolumeSlider) {
            if (recentlyUsingVolumeSliderTimeoutId) {
                clearTimeout(recentlyUsingVolumeSliderTimeoutId)
            }
            const id = setTimeout(() => {
                setRecentlyUsingVolumeSlider(false)
            }, 1)
            setRecentlyUsingVolumeSliderTimeoutId(id)
        } else {
            setRecentlyUsingVolumeSlider(true)
        }
    }, [usingVolumeSlider])

    const handleFullScreen = () => {
        setFullScreen(!fullScreen)
        setShowConversationsList(false)
        textareaRef.current?.focus()
    }

    const openNewConversationForm = () => {
        setShowNewConversation(!showNewConversation)
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus()
        }
        setTextAreaHeight(minTextAreaHeight)
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
    }

    const adjustTextareaHeight = () => {
        // Only adjust height if the textAreaHeight has not been manually resized
        if (textareaRef.current && (textAreaHeight === minTextAreaHeight || input === '')) {
            textareaRef.current.style.height = '0px'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
        setTextAreaHeight(textareaRef.current.scrollHeight)
    }

    useEffect(() => {
        adjustTextareaHeight()
        setEditingPromptIndex(null)
    }, [input])

    const handleSubmit = async (e) => {
        if (ableToSubmit) {
            const newContent = content ? [...content, ['User', input]] : [['User', input]]
            await updateConversation({ id: conversationId, user: conversation.user, title: conversation.title, content: newContent, respond: true })
        }
    }

    useEffect(() => {
        setAbleToSubmit(
            input?.trim().length > 0
            && ((
                content?.length
                && content[content?.length - 1][0] !== 'User'
                && content[content?.length - 1][0] === 'AI'
                && content[content?.length - 1][1] !== '...'
            ) || content?.length === 0)
        )
    }, [input, content])

    useEffect(() => {
        if (content) setContentSize(Buffer.byteLength(JSON.stringify(content), 'utf8'))
    }, [content])

    useEffect(() => {
        if (contentSize > 16000) {
            if (isLoading) {
                setCachedInput(input)
                setInput('')
                setTextAreaHeight(minTextAreaHeight)
            } else if (isError) {
                setInput(cachedInput)
            }
        } else if (isSuccess) {
            setInput('')
            setTextAreaHeight(minTextAreaHeight)
        }
    }, [isSuccess, isLoading, isLoading])

    const scrollDown = (duration) => {
        if (conversationContentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = conversationContentRef.current
    
            const targetScrollTop = scrollHeight - clientHeight
            const distance = targetScrollTop - scrollTop
            const perTick = distance / duration * 10
            var previousScrollTop = -1
            
            if (targetScrollTop === scrollTop) {
                return
            }
    
            const scroll = () => {
                const currentScrollTop = conversationContentRef.current?.scrollTop
                if (currentScrollTop <= previousScrollTop) {
                    // Reached the bottom or exceeded
                    // conversationContentRef.current.scrollTop = targetScrollTop
                    return
                }
                
                previousScrollTop = currentScrollTop
                if (conversationContentRef.current) conversationContentRef.current.scrollTop = currentScrollTop + perTick
    
                // Schedule next tick
                setTimeout(scroll, 10)
            }
    
            scroll()
        }
    }
    
    const handleDownButton = () => {
        scrollDown(300)
    }

    const handleMouseDown = (e) => {
        document.body.style.cursor = "pointer"
        setMouseDown(true)
        if (e.type === "mousedown") e.preventDefault()
    }

    const handleMouseUp = (e) => {
        if (mouseDown) {
            document.body.style.cursor = "default"
            setMouseDown(false)
        }
    }

    const handleMouseMove = (e) => {
        if (mouseDown) {
            if (e.type === "mousemove") {
                const { scrollTop, scrollHeight, clientHeight } = conversationContentRef.current
                if (scrollTop === scrollHeight - clientHeight || startedAdjustmentAtBottom) {
                    conversationContentRef.current.scrollTop = scrollHeight - clientHeight
                }
                const newHeight = Math.min(Math.max(textAreaHeight - e.movementY, minTextAreaHeight), 50 * window.innerHeight / 100)
                setTextAreaHeight(newHeight)
            } else if (e.type === "touchmove") {
                const touch = e.touches[0]
                const { scrollTop, scrollHeight, clientHeight } = conversationContentRef.current
                if (scrollTop === scrollHeight - clientHeight || startedAdjustmentAtBottom) {
                    conversationContentRef.current.scrollTop = scrollHeight - clientHeight
                }
                const movementY = touch.clientY - lastTouchY.current
                lastTouchY.current = touch.clientY
                const newHeight = Math.min(Math.max(textAreaHeight - movementY, minTextAreaHeight), 50 * window.innerHeight / 100)
                setTextAreaHeight(newHeight)
            }
        }
    }

    useEffect(() => {
        setTimeout(() => {
            scrollDown(100)
        }, 100)
    }, [conversationId, isSuccess, conversation, content])

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = textAreaHeight + 'px'
        }
    }, [textAreaHeight])

    const removeAdjustTextAreaTimeout = () => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        setTimeoutId(null)
    }

    const hideAdjustTextAreaButton = () => {
        if (!mouseDown) setShowAdjustTextAreaButton(false)
    }

    useEffect(() => {
        lastTextAreaAdjustClickRef.current = lastTextAreaAdjustClick
    }, [lastTextAreaAdjustClick])

    // console.log(musicRef.current?.getBoundingClientRect())

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

        const handleClickAwayFromMusic = (e) => {
            const musicButton = toggleMusicControlsRef.current
            const targetClassName = e.target.className
            if (!recentlyUsingVolumeSlider) {
                if (musicRef.current && !musicRef.current.contains(e.target) && !targetClassName?.includes('songTitle')) {
                    if (!musicButton || !musicButton.contains(e.target)) {
                        setShowMusicControls(false)
                    }
                }
            }
        }

        const checkScrollHeight = () => {
            if (conversationContentRef.current && !mouseDown) {
                const { scrollTop, scrollHeight, clientHeight } = conversationContentRef.current
                if (scrollHeight - scrollTop > clientHeight + 20) {
                    setShowDownButton(true)
                    setStartedAdjustmentAtBottom(false)
                } else {
                    setShowDownButton(false)
                    setStartedAdjustmentAtBottom(true)
                }
            }
        }

        const mouseAtTopOfTextArea = (e) => {
            const rect = adjustTextAreaRef.current.getBoundingClientRect()
            const elementX = rect.x
            const elementY = rect.y
            if (Math.abs(e.clientY - elementY) < 30 && Math.abs(e.clientX - elementX) < 0.2 * window.innerWidth) {
                removeAdjustTextAreaTimeout()
                setShowAdjustTextAreaButton(true)
            } else {
                removeAdjustTextAreaTimeout()
                const id = setTimeout(() => {
                    hideAdjustTextAreaButton(false)
                }, 333)
                setTimeoutId(id)
            }
        }

        const quickAdjustTextArea = (e) => {
            if (adjustTextAreaRef.current && adjustTextAreaRef.current.contains(e.target)) {
                if (lastTextAreaAdjustClickRef.current === null || e.timeStamp - lastTextAreaAdjustClickRef.current > 300) {
                    setLastTextAreaAdjustClick(e.timeStamp)
                } else if (lastTextAreaAdjustClickRef.current !== null && e.timeStamp - lastTextAreaAdjustClickRef.current <= 300) {
                    const { scrollTop, scrollHeight, clientHeight } = conversationContentRef.current
                    if (textAreaHeight !== minTextAreaHeight) {
                        setTextAreaHeight(minTextAreaHeight)
                    } else {
                        setTextAreaHeight(50 * window.innerHeight / 100)
                    }
                    if (scrollTop === scrollHeight - clientHeight || startedAdjustmentAtBottom) {
                        setTimeout(() => {
                            scrollDown(1)
                        }, 1)
                    }
                }
            }
        }

        window.addEventListener('keydown', handleEscapeKey)
        window.addEventListener('click', handleClickAwayFromConversationTitle)
        window.addEventListener('click', handleClickAwayFromMusic)
        conversationContentRef.current?.addEventListener('scroll', checkScrollHeight)
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('touchend', handleMouseUp)
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('touchmove', handleMouseMove)
        window.addEventListener('mousemove', mouseAtTopOfTextArea)
        window.addEventListener('click', quickAdjustTextArea)

        return () => {
            window.removeEventListener('keydown', handleEscapeKey)
            window.removeEventListener('click', handleClickAwayFromConversationTitle)
            window.removeEventListener('click', handleClickAwayFromMusic)
            conversationContentRef.current?.removeEventListener('scroll', checkScrollHeight)
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('touchend', handleMouseUp)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('touchmove', handleMouseMove)
            window.removeEventListener('mousemove', mouseAtTopOfTextArea)
            window.removeEventListener('click', quickAdjustTextArea)
        }
    })

    let musicButton
    if (isAdmin && fullScreen) {
        musicButton = (
            <button
                ref={toggleMusicControlsRef}
                className="conversationOptionsButton"
                onClick={() => setShowMusicControls(!showMusicControls)}
                style={{
                    animation: 'none',
                    padding: '0',
                    height: '2rem',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                }}>
                <FontAwesomeIcon icon={faMusic} />
            </button>
        )
    }

    let musicControls
    if (isAdmin && showMusicControls) {
        musicControls = (
            <div ref={musicRef}
                style={{
                    flexGrow: '1',
                    zIndex: '9999',
                    position: 'fixed',
                    maxWidth: '13rem',
                    padding: '6px',
                    paddingBottom: '0px',
                    marginLeft: '0.5rem',
                    marginTop: '3rem',
                    borderRadius: '10px',
                    boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                    backgroundColor: 'rgba(231, 237, 255, 1)',
                }}>
                <SpotifyInterface usingVolumeSlider={usingVolumeSlider} setUsingVolumeSlider={setUsingVolumeSlider} />
            </div>
        )
    }

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
                    boxShadow: 'none',
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
                    boxShadow: 'none',
                }}>
                <FontAwesomeIcon icon={faExpand} />
            </button>
        )
    }

    let conversationTitle
    if (fullScreen) {
        conversationTitle = (
            <Link className="conversationTitle"
                style={{textDecoration: 'none'}}
                onClick={() => setShowConversationsList(!showConversationsList)}>
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
                    left: '50%',
                    transform: 'translateX(-50%)',
                    maxWidth: '13.6rem',
                    maxHeight: '30dvh',
                    padding: '5px 10px',
                    paddingTop: '10px',
                    marginTop: '3rem',
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
                conversationSize={contentSize}
                promptId={promptId}
                editingPromptIndex={editingPromptIndex}
                setEditingPromptIndex={setEditingPromptIndex}/>
        ))
    } else conversationContent = null

    const conversationInterface = (
        <>
            <div className={`conversation-interface ${fullScreen ? 'full-screen' : ''}`}
                style={{
                    height: fullScreen ? '100dvh' : '80dvh',
                }}>
                <div className='table__th'
                    ref={titleRef}
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'center',
                        padding: '0.2em',
                        fontSize: '20px',
                        borderRadius: fullScreen ? '0px 0px 10px 10px' : '10px',
                        marginBottom: '-' + titleRef.current?.clientHeight + 'px',
                        zIndex: '9999',
                    }}
                >
                    <div>{musicButton}</div>
                    <div style={{ flex: '1' }}>{conversationTitle}</div>
                    <div>{fullScreenButton}</div>
                </div>
                <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexGrow: '1',
                        width: '100%',
                        height: '0px'
                    }}>
                    {musicControls}
                    {coversationsList}
                </div>
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
                        paddingBottom: inputRef.current?.clientHeight + 'px',
                        paddingTop: titleRef.current?.clientHeight + parseFloat(getComputedStyle(document.documentElement).fontSize) + 'px',
                    }}>
                    {conversationContent}
                </div>
                <div
                    ref={inputRef}
                    style={{
                        marginTop: '-' + inputRef.current?.clientHeight + 'px',
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexGrow: '1',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                        }}>
                        <button
                            className="conversationOptionsButton"
                            onClick={handleDownButton}
                            disabled={!showDownButton}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                bottom: '1rem',
                                marginTop: '-40px',
                                height: '2rem',
                                opacity: showDownButton ? '1' : '0',
                                transform: showDownButton ? 'scale(1)' : 'scale(0)',
                            }}>
                            <FontAwesomeIcon icon={faArrowDown} />
                        </button>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '-0.2rem',
                        }}>
                        <button
                            className={`conversationOptionsButton ${mouseDown ? 'hovered' : ''}`}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                width: '5%',
                                minWidth: '3rem',
                                height: '0.75rem',
                                justifyContent: 'center',
                                alignItems: 'center',
                                opacity: showAdjustTextAreaButton ? '1' : '0',
                                transform: showAdjustTextAreaButton ? 'scale(1)' : 'scale(0)',
                            }}
                            onMouseDown={handleMouseDown}
                            onTouchStart={handleMouseDown}
                            ref={adjustTextAreaRef}
                        >
                            <FontAwesomeIcon icon={faGripLines}></FontAwesomeIcon>
                        </button>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexGrow: '1',
                            width: '100%',
                            justifyContent: 'flex-end',
                            marginTop: '-0.4rem',
                        }}
                    >
                        <textarea
                            className='conversationInput'
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
                            placeholder="Ask Me Anything!"
                            autoFocus
                            style={{
                                fontSize: '15px',
                                display: 'flex',
                                flexDirection: 'column',
                                flexGrow: '1',
                                flexShrink: '1',
                                color: '#5136d5',
                                wordWrap: 'break-word',
                                borderRadius: '10px',
                                resize: 'none',
                                overflow: 'auto',
                                height: textAreaHeight + 'px',
                                maxHeight: '50dvh',
                                minHeight: '3dvh',
                                width: '100%',
                                whiteSpace: 'pre-wrap',
                                textAlign: 'left',
                                padding: '1.1em 1em',
                                lineHeight: '1.5em',
                                boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                                marginTop: '1em',
                                marginLeft: '1em',
                                marginRight: '1em',
                                marginBottom: '1em',
                                transition: 'none',
                                zIndex: '9999',
                            }}/>
                        <button className='conversationSubmitButton'
                            onClick={handleSubmit}
                            disabled={!ableToSubmit}
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
            </div>
        </>
    )

    return conversationInterface
}
export default ConversationView
