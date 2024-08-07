import { Link } from 'react-router-dom'
import { useSelector } from "react-redux"
import { useState, useEffect } from 'react'

const DashHeader = ({view, currentConversationId, setView, setCurrentConversationId, setEditingUserId}) => {
    const {id, username} = useSelector(state => state.auth)
    const date = new Date()
    const today = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date)

    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    const editUser = () => {
        localStorage.setItem('view', 'editUser')
        setView('editUser')
        localStorage.setItem('currentConversationId', '')
        setCurrentConversationId('')
        localStorage.setItem('editingUserId', id)
        setEditingUserId(id)
    }

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth)
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const resetPage = () => {
        localStorage.setItem('view', '')
        setView('')
        localStorage.setItem('currentConversationId', '')
        setCurrentConversationId('')
    }

    let info
    if (windowWidth <= 1000) {
        info = (
            <div className="dash-header__container"
                style={{
                    flexDirection: 'column',
                }}>
                {/* <div>
                    <Link to="/dash" onClick={resetPage} style={{textDecoration: 'none'}}>
                        <h1 className="dash-header__page-name">AI Chatbot</h1>
                    </Link>
                </div> */}
                <h1 className='dash-header__title' style={{margin: '0'}}>
                        Hello <Link onClick={editUser} className='dash-header__title' style={{textDecoration: 'none'}}>{username}</Link> !
                </h1>
            </div>
        )
    } else {
        info = (
            <div className="dash-header__container"
                style={{
                    flexDirection: 'row',
                }}>
                <div>
                    <Link to="/dash" onClick={resetPage} style={{textDecoration: 'none'}}>
                        <h1 className="dash-header__page-name" style={{margin: '0'}}>AI Chatbot</h1>
                    </Link>
                    <p className='welcome__p'>{today}</p>
                </div>
                <h1 className='dash-header__title' style={{margin: '0'}}>
                    Hello <Link onClick={editUser} className='dash-header__title' style={{textDecoration: 'none'}}>{username}</Link> !
                </h1>
            </div>
        )
    }

    const content = (
        <header className="dash-header">
            {info}
        </header>
    )

    return content
}
export default DashHeader