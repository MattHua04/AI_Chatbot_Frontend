import {useSelector} from 'react-redux'
import NewConversationForm from './NewConversationForm'

const NewConversation = ({setView, setCurrentConversationId}) => {
    const {id} = useSelector(state => state.auth)

    const content = id ? <NewConversationForm uid={id} setView={setView} setCurrentConversationId={setCurrentConversationId} /> : <p>Loading...</p>
    
    return content
}
export default NewConversation