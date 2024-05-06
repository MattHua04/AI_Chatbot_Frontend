import { useSelector } from 'react-redux'
import { selectCurrentToken, selectCurrentActive } from "../features/auth/authSlice"
import { jwtDecode } from 'jwt-decode'

const useAuth = () => {
    const token = useSelector(selectCurrentToken)
    const active = useSelector(selectCurrentActive)
    let isAdmin = false
    let status = "User"

    if (token) {
        const decoded = jwtDecode(token)
        const { username, roles, active } = decoded.UserInfo

        isAdmin = roles.includes('Admin')

        if (isAdmin) status = "Admin"

        return { active, username, roles, status, isAdmin }
    }

    return { active: false, username: '', roles: [], isAdmin, status }
}
export default useAuth