import { Link } from 'react-router-dom'
import { useSelector } from "react-redux"

const DashHeader = ({view, currentConversationId, setView, setCurrentConversationId}) => {
    const {id, username} = useSelector(state => state.auth)

    const date = new Date()
    const today = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date)

    const resetPage = () => {
        localStorage.setItem('view', '')
        setView('')
        localStorage.setItem('currentConversationId', '')
        setCurrentConversationId('')
    }

    let content
    content = (
        <header className="dash-header">
            <div className="dash-header__container">
                <div>
                    <Link to="/dash" onClick={resetPage}>
                        <h1 className="dash-header__page-name">AI Chatbot</h1>
                    </Link>
                    <p className='welcome__p'>{today}</p>
                </div>
                <h1 className='dash-header__title'
                    style={{ position: 'absolute',
                    top: '0',
                    right: '0',
                    paddingRight: '1.5%',
                    paddingTop: '0.5em' }}>
                        Hello <Link to={`/dash/users/${id}`} className='dash-header__title-link' >{username}</Link> !
                </h1>
            </div>
        </header>
    )

    return content
}
export default DashHeader