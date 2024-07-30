import { useLocation } from "react-router-dom"
import NewUserForm from "./NewUserForm"

const NewUser = ({lightmode, fullSize}) => {
    const content = <NewUserForm lightmode={lightmode} fullSize={fullSize} />

    return content
}
export default NewUser