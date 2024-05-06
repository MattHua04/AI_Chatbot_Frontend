import { Outlet } from 'react-router-dom'
import DashHeader from './DashHeader'
import DashFooter from './DashFooter'

const DashLayout = ({view, currentConversationId, setView, setCurrentConversationId}) => {
    return (
        <>
            <DashHeader view={view} currentConversationId={currentConversationId} setView={setView} setCurrentConversationId={setCurrentConversationId}/>
            <div className="dash-container">
                <Outlet />
            </div>
            <DashFooter />
        </>
    )
}
export default DashLayout