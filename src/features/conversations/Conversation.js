import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faSave, faTrash, faEllipsis, faXmarkCircle } from "@fortawesome/free-solid-svg-icons"
import { useSelector } from 'react-redux'
import { selectConversationById } from './conversationsApiSlice'
import { useState, useEffect, useRef } from 'react'
import { useUpdateConversationMutation, useDeleteConversationMutation, useGetConversationsQuery } from './conversationsApiSlice'

const Conversation = ({ conversationId, conversations, setCurrentConversationId, setView }) => {
    const [conversation, setConversation] = useState(useSelector(state => selectConversationById(state, conversationId)))
    const [conversationContent, setConversationContent] = useState(conversation ? conversation.content : '')
    const [edit, setEdit] = useState(false)
    const [showOptions, setShowOptions] = useState(false)
    const [title, setTitle] = useState(conversation ? conversation.title : '')
    const textareaRef = useRef(null)

    const handleConversationClick = () => {
        localStorage.setItem('view', 'conversationView')
        localStorage.setItem('currentConversationId', conversationId)
        setView('conversationView')
        setCurrentConversationId(conversationId)
    }

    const handleEdit = () => {
        setEdit(true)
        setShowOptions(false)
    }

    useEffect(() => {
        adjustTextareaHeight()
    }, [edit, title])

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.whiteSpace = 'pre-wrap'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }

    const handleSave = async () => {
        if (title?.length) {
            await updateConversation({id: conversationId, user: conversation.user, title: title, content: conversationContent})
        }
    }

    const handleCancel = () => {
        setEdit(false)
        setTitle(conversation.title)
    }

    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSave()
        }
    }

    const handleOptions = () => setShowOptions(!showOptions)

    const handleDelete = async () => {
        if (conversations.ids?.length === 1 && localStorage.getItem('currentConversationId') === conversationId) {
            localStorage.setItem('view', '')
            setView('')
            setCurrentConversationId('')
        }
        await deleteConversation({id: conversationId})
        const remainingConversations = conversations.ids?.filter(id => id !== conversationId)
        if (remainingConversations.length) {
            localStorage.setItem('currentConversationId', remainingConversations[0])
            setCurrentConversationId(remainingConversations[0])
        }
    }

    useEffect(() => {
        setConversation(conversations.entities[conversationId])
    }, [conversations])

    useEffect(() => {
        setTitle(conversation?.title)
        setConversationContent(conversation?.content)
    }, [conversation])

    useEffect(() => {console.log(conversationContent)}, [conversationContent])

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.selectionStart = textareaRef.current.value.length
            textareaRef.current.selectionEnd = textareaRef.current.value.length
        }
    }, [edit])

    const [updateConversation, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateConversationMutation()

    const [deleteConversation, {
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delError
    }] = useDeleteConversationMutation()

    useEffect(() => {
        if (isSuccess) {
            setEdit(false)
            setShowOptions(false)
        }
        if (isDelSuccess) {
            setShowOptions(false)
        }
    }, [isSuccess, isDelSuccess])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleCancel()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    if (conversation) {
        const created = (new Date(conversation.createdAt).toLocaleString('en-US', {date:'short'})).toString().split(',')[0]

        let message
        if (isError) {
            message = (
                <p className='errmsg' style={{fontSize: '15px', padding: '0.2em 0em', marginBottom: '5px'}}>{error?.data?.message}</p>
            )
        } else {
            message = null
        }

        let conversationTitle
        if (showOptions) {
            conversationTitle = (
                <button
                    title={`${title}`}
                    className={`conversationButton`}
                    onClick={handleConversationClick}
                    >
                    <div style={{
                        marginBottom: '10px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto',
                    }}>
                        {title}
                    </div>
                    <div>{created}</div>
                </button>
            )
        } else if (edit) {
            conversationTitle = (
                <div
                    title={`${title}`}
                    className={`conversationButton`}
                    style={{padding: '0.3em 0.3em'}}
                >
                    {message}
                    <textarea
                        className={`conversationInput`}
                        ref={textareaRef}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleEnter}
                        value={title}
                        autoFocus
                        style={{
                            wordWrap: 'break-word',
                            resize: 'none',
                            overflow: 'auto',
                            borderRadius: '5px',
                            scrollbarWidth: 'none',
                            whiteSpace: 'pre-wrap',
                            height: 'auto',
                            padding: '0em 0.5em',
                        }}
                    />
                </div>
            )
        } else {
            conversationTitle = (
                <button
                    title={`${title}`}
                    className={localStorage.getItem('view') === `conversationView` && localStorage.getItem('currentConversationId') === conversationId ? `selectedConversationButton` : `conversationButton`}
                    onClick={handleConversationClick}
                    >
                    {title}
                </button>
            )
        }

        let optionsButton
        if (edit) {
            optionsButton = (
                <>
                    <button
                        className="conversationOptionsButton"
                        onClick={(e) => {
                            handleSave()
                            e.stopPropagation()
                        }}
                        >
                        <FontAwesomeIcon icon={faSave} />
                    </button>
                    <button
                        className="conversationOptionsButton"
                        onClick={(e) => {
                            handleCancel()
                            e.stopPropagation()
                        }}
                        >
                        <FontAwesomeIcon icon={faXmarkCircle} />
                    </button>
                </>
            )
        } else if (showOptions) {
            optionsButton = (
                <button
                    className="conversationOptionsButton"
                    onClick={(e) => {
                        handleOptions()
                        e.stopPropagation()
                    }}
                    disabled={!title?.length}
                    >
                    <FontAwesomeIcon icon={faEllipsis} />
                </button>
            )
        } else {
            optionsButton = (
                <button
                    className="conversationOptionsButton"
                    style={{height: '100%'}}
                    onClick={(e) => {
                        handleOptions()
                        e.stopPropagation()
                    }}
                    disabled={!title?.length}
                    >
                    <FontAwesomeIcon icon={faEllipsis} />
                </button>
            )
        }

        let options
        if (showOptions) {
            options = (
                <>
                    <button
                        className="conversationOptionsButton"
                        onClick={(e) => {
                            handleEdit()
                            e.stopPropagation()
                        }}
                        >
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                        className="conversationOptionsButton"
                        onClick={(e) => {
                            handleDelete()
                        }}
                        >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </>
            )
        }

        return (
            <div style={{display: 'flex', flexGrow: '1', flexDirection: 'row', fontSize: '15px', marginBottom: '5px'}}>
                {conversationTitle}
                <div>
                    {optionsButton}
                    {options}
                </div>
            </div>
        )

    } else return null
}
export default Conversation