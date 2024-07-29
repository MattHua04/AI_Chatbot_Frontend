import { useLocation } from "react-router-dom"
import NewUserForm from "./NewUserForm"

const NewUser = ({lightmode}) => {
    const content = <NewUserForm lightmode={lightmode} />

    return content
}
export default NewUser